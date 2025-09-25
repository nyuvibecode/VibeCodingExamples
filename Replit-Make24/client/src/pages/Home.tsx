import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calculator, UsersRound, Users, Play, LogIn } from "lucide-react";
import { useGame } from "@/hooks/useGame";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [selectedMode, setSelectedMode] = useState<2 | 4>(4);

  const { createRoom, joinRoom, isLoading } = useGame({
    onRoomCreated: (roomCode) => {
      navigate(`/room/${roomCode}`);
    },
    onGameJoined: (roomCode) => {
      navigate(`/room/${roomCode}`);
    }
  });

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorage.setItem('playerName', playerName);
      const roomCode = await createRoom(selectedMode);
      // Auto-join the created room
      await joinRoom(roomCode, playerName, playerName.charAt(0).toUpperCase(), "#3B82F6");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create room",
        variant: "destructive",
      });
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim() || !joinRoomCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name and room code",
        variant: "destructive",
      });
      return;
    }

    try {
      localStorage.setItem('playerName', playerName);
      await joinRoom(joinRoomCode.toUpperCase(), playerName, playerName.charAt(0).toUpperCase(), "#3B82F6");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join room. Please check the room code.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-game-slate mb-2">
            <Calculator className="inline h-12 w-12 text-game-blue mr-3" />
            Make 24
          </h1>
          <p className="text-gray-600 text-lg">Use all 4 numbers exactly once to make 24!</p>
        </div>

        {!showJoinForm ? (
          <Card data-testid="create-room-card">
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Player Name */}
                <div>
                  <Label htmlFor="playerName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Your Name
                  </Label>
                  <Input
                    id="playerName"
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="w-full"
                    data-testid="input-player-name"
                  />
                </div>

                {/* Game Mode Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Game Mode</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedMode(2)}
                      className={`p-4 border-2 rounded-xl text-center transition-colors ${
                        selectedMode === 2
                          ? "border-game-blue bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      data-testid="button-2-player-mode"
                    >
                      <UsersRound className={`h-8 w-8 mx-auto mb-2 ${
                        selectedMode === 2 ? "text-game-blue" : "text-gray-400"
                      }`} />
                      <div className="font-semibold text-gray-800">2 Players</div>
                      <div className="text-xs text-gray-600">Quick Match</div>
                    </button>
                    
                    <button
                      onClick={() => setSelectedMode(4)}
                      className={`p-4 border-2 rounded-xl text-center transition-colors ${
                        selectedMode === 4
                          ? "border-game-blue bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      data-testid="button-4-player-mode"
                    >
                      <Users className={`h-8 w-8 mx-auto mb-2 ${
                        selectedMode === 4 ? "text-game-blue" : "text-gray-400"
                      }`} />
                      <div className="font-semibold text-gray-800">4 Players</div>
                      <div className="text-xs text-gray-600">Group Match</div>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleCreateRoom}
                    disabled={isLoading || !playerName.trim()}
                    className="w-full bg-game-blue hover:bg-blue-600 h-12"
                    data-testid="button-create-room"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    {isLoading ? "Creating..." : "Create Room"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowJoinForm(true)}
                    className="w-full h-12"
                    data-testid="button-join-room-toggle"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Join Existing Room
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="join-room-card">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Game</h2>
                  <p className="text-gray-600">Enter the room code to join an existing game</p>
                </div>

                <div>
                  <Label htmlFor="joinPlayerName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Your Name
                  </Label>
                  <Input
                    id="joinPlayerName"
                    type="text"
                    placeholder="Enter your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    data-testid="input-join-player-name"
                  />
                </div>

                <div>
                  <Label htmlFor="roomCode" className="text-sm font-medium text-gray-700 mb-2 block">
                    Room Code
                  </Label>
                  <Input
                    id="roomCode"
                    type="text"
                    placeholder="Enter room code"
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                    className="font-mono text-center text-lg tracking-widest"
                    data-testid="input-room-code"
                  />
                </div>

                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleJoinRoom}
                    disabled={isLoading || !playerName.trim() || !joinRoomCode.trim()}
                    className="w-full bg-game-blue hover:bg-blue-600 h-12"
                    data-testid="button-join-room"
                  >
                    {isLoading ? "Joining..." : "Join Game"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowJoinForm(false)}
                    className="w-full h-12"
                    data-testid="button-back-to-create"
                  >
                    Back to Create Room
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How to Play */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="font-bold text-gray-800 mb-3">How to Play</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Use all 4 numbers exactly once with +, -, *, / and parentheses</p>
              <p>• First to reach 24 wins the round and gets points</p>
              <p>• Play 10 rounds, highest score wins the game!</p>
              <p>• Example: (8 - 6) × (4 + 2) = 24</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
