import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { GameLobby } from "@/components/GameLobby";
import { GameBoard } from "@/components/GameBoard";
import { PlayersPanel } from "@/components/PlayersPanel";
import { ActivityFeed } from "@/components/ActivityFeed";
import { SolutionModal } from "@/components/SolutionModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Users, Link as LinkIcon, Settings } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import { useToast } from "@/hooks/use-toast";

export default function Game() {
  const [, params] = useRoute("/room/:code");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const roomCode = params?.code;
  
  const [showSolution, setShowSolution] = useState(false);
  const [currentSolution, setCurrentSolution] = useState("");

  const { 
    gameState, 
    playerId, 
    isConnected, 
    error,
    startGame,
    submitExpression,
    requestSolution,
    copyRoomLink,
    joinRoom
  } = useGame();

  // Handle room joining
  useEffect(() => {
    if (!roomCode) {
      navigate("/");
      return;
    }

    // Check if we need to join the room (no gameState yet)
    if (!gameState && !error) {
      // Try to join with a default name if not already connected
      const playerName = localStorage.getItem('playerName') || 'Guest';
      joinRoom(roomCode, playerName);
    }
  }, [roomCode, navigate, gameState, error, joinRoom]);

  // Handle WebSocket errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle solution modal
  useEffect(() => {
    // Listen for solution reveals in activities
    if (gameState?.activities) {
      const solutionActivity = gameState.activities.find(
        activity => activity.type === "solution_revealed"
      );
      
      if (solutionActivity && solutionActivity.expression) {
        setCurrentSolution(solutionActivity.expression);
        setShowSolution(true);
      }
    }
  }, [gameState?.activities]);

  const handleCopyLink = () => {
    copyRoomLink();
    toast({
      title: "Link Copied",
      description: "Room link copied to clipboard!",
    });
  };

  const handleStartGame = () => {
    if (gameState?.players && gameState.players.length >= 2) {
      startGame();
    } else {
      toast({
        title: "Cannot Start",
        description: "Need at least 2 players to start the game",
        variant: "destructive",
      });
    }
  };

  const handleShowSolution = () => {
    requestSolution();
  };

  const currentPlayer = gameState?.players.find(p => p.id === playerId);
  const canSubmit = currentPlayer?.isActive && gameState?.room.gameState === "playing";
  const canStartGame = gameState?.players && gameState.players.length >= 2 && gameState.room.gameState === "waiting";

  // Loading state
  if (!gameState && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-game-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to game...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Room Not Found</h1>
          <p className="text-gray-600 mb-4">The room code "{roomCode}" doesn't exist or the game has ended.</p>
          <Button onClick={() => navigate("/")} data-testid="button-back-home">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const { room, players, activities, timeRemaining, isTimerRunning } = gameState;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" data-testid="game-page">
      {/* Show lobby if game is waiting */}
      {room.gameState === "waiting" && (
        <GameLobby
          room={room}
          players={players}
          onStartGame={handleStartGame}
          onCopyLink={handleCopyLink}
          canStart={!!canStartGame}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-game-slate mb-2">
            <Calculator className="inline h-12 w-12 text-game-blue mr-3" />
            Make 24
          </h1>
          <p className="text-gray-600 text-lg">Use all 4 numbers exactly once to make 24!</p>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {room.maxPlayers}-Player Mode
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              Room: {room.code}
            </Badge>
            <Badge 
              variant={isConnected ? "default" : "destructive"}
              className={isConnected ? "bg-green-500" : ""}
            >
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>
        </header>

        {/* Game Content */}
        {room.gameState === "playing" && (
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {/* Players Panel */}
            <div className="lg:col-span-1">
              <PlayersPanel players={players} currentPlayerId={playerId || undefined} />
            </div>

            {/* Game Board */}
            <div className="lg:col-span-2">
              <GameBoard
                room={room}
                timeRemaining={timeRemaining}
                isTimerRunning={isTimerRunning}
                onSubmitExpression={submitExpression}
                onShowSolution={handleShowSolution}
                canSubmit={!!canSubmit}
              />
            </div>
          </div>
        )}

        {/* Game Finished */}
        {room.gameState === "finished" && (
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Game Finished!</h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Final Scores:</h3>
              <div className="space-y-2">
                {[...players]
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <div key={player.id} className="flex items-center justify-center gap-4">
                      <Badge variant={index === 0 ? "default" : "outline"} className="w-16">
                        #{index + 1}
                      </Badge>
                      <span className={`font-medium ${index === 0 ? "text-game-blue text-lg" : ""}`}>
                        {player.name}
                      </span>
                      <span className={`font-bold ${index === 0 ? "text-game-blue text-lg" : ""}`}>
                        {player.score} points
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <Button onClick={() => navigate("/")} data-testid="button-new-game">
              Start New Game
            </Button>
          </div>
        )}

        {/* Activity Feed */}
        {room.gameState !== "waiting" && (
          <ActivityFeed activities={activities} />
        )}

        {/* Mobile Controls */}
        <div className="fixed bottom-4 right-4 md:hidden">
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopyLink}
              className="bg-white shadow-lg"
              data-testid="button-mobile-copy"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="bg-white shadow-lg"
              data-testid="button-mobile-settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Solution Modal */}
      <SolutionModal
        isVisible={showSolution}
        solution={currentSolution}
        onClose={() => setShowSolution(false)}
      />
    </div>
  );
}
