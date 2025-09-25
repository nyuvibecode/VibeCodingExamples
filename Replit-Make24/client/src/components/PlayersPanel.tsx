import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { Player } from "@shared/schema";

interface PlayersPanelProps {
  players: Player[];
  currentPlayerId?: string;
}

export function PlayersPanel({ players, currentPlayerId }: PlayersPanelProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Card data-testid="players-panel">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Trophy className="h-5 w-5 text-game-amber mr-2" />
          Players
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`p-4 rounded-xl transition-all ${
              player.isActive 
                ? "bg-gradient-to-r from-game-blue to-blue-600 text-white" 
                : "bg-gray-50"
            } ${
              player.id === currentPlayerId ? "ring-2 ring-game-blue ring-opacity-50" : ""
            }`}
            data-testid={`player-card-${player.id}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    player.isActive ? "bg-white bg-opacity-20" : "text-white"
                  }`}
                  style={{ 
                    backgroundColor: player.isActive ? undefined : player.color 
                  }}
                  data-testid={`player-avatar-${player.id}`}
                >
                  {player.avatar}
                </div>
                <div className="ml-3">
                  <div className={`font-semibold ${player.isActive ? "text-white" : "text-gray-800"}`} data-testid={`player-name-${player.id}`}>
                    {player.name}
                    {index === 0 && (
                      <Trophy className="inline h-4 w-4 ml-1 text-game-amber" />
                    )}
                  </div>
                  <div className={`text-sm ${player.isActive ? "text-blue-100" : "text-gray-500"}`}>
                    Score: <span data-testid={`player-score-${player.id}`}>{player.score}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                {player.isActive && (
                  <>
                    <div className={`text-xs mb-1 ${player.isActive ? "text-blue-100" : "text-gray-400"}`}>
                      Current Turn
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" data-testid={`player-active-indicator-${player.id}`}></div>
                  </>
                )}
                {!player.isActive && (
                  <div className="text-xs text-gray-400" data-testid={`player-waiting-${player.id}`}>
                    Waiting...
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
