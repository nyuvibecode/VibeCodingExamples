import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Play } from "lucide-react";
import { Player, Room } from "@shared/schema";

interface GameLobbyProps {
  room: Room;
  players: Player[];
  onStartGame: () => void;
  onCopyLink: () => void;
  canStart: boolean;
}

export function GameLobby({ room, players, onStartGame, onCopyLink, canStart }: GameLobbyProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="game-lobby">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <Users className="h-12 w-12 text-game-blue mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Lobby</h2>
            <p className="text-gray-600">
              Room Code: <code className="bg-gray-100 px-2 py-1 rounded text-game-blue font-mono" data-testid="room-code">{room.code}</code>
            </p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">
              Players ({players.length}/{room.maxPlayers})
            </h3>
            
            <div className="space-y-2" data-testid="players-list">
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: player.color }}
                      data-testid={`player-avatar-${player.id}`}
                    >
                      {player.avatar}
                    </div>
                    <span className="ml-3 font-medium" data-testid={`player-name-${player.id}`}>
                      {player.name}
                    </span>
                  </div>
                  <Badge 
                    variant={player.isReady ? "default" : "secondary"}
                    data-testid={`player-status-${player.id}`}
                  >
                    {player.isReady ? "Ready" : "Waiting..."}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={onCopyLink}
              data-testid="button-copy-link"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button 
              className="flex-1 bg-game-blue hover:bg-blue-600" 
              onClick={onStartGame}
              disabled={!canStart}
              data-testid="button-start-game"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
