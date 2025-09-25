import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Hash, Send, SkipForward, Lightbulb, Eye } from "lucide-react";
import { Room } from "@shared/schema";

interface GameBoardProps {
  room: Room;
  timeRemaining: number;
  isTimerRunning: boolean;
  onSubmitExpression: (expression: string) => void;
  onShowSolution: () => void;
  canSubmit: boolean;
}

export function GameBoard({ 
  room, 
  timeRemaining, 
  isTimerRunning, 
  onSubmitExpression, 
  onShowSolution,
  canSubmit 
}: GameBoardProps) {
  const [expression, setExpression] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!expression.trim()) {
      setValidationError("Please enter a mathematical expression");
      return;
    }
    
    setValidationError(null);
    onSubmitExpression(expression);
    setExpression("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSubmit && expression.trim()) {
      handleSubmit();
    }
  };

  return (
    <Card className="h-fit" data-testid="game-board">
      <CardContent className="p-8">
        {/* Timer and Round Info */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center text-gray-600">
            <Hash className="h-4 w-4 mr-2" />
            <span data-testid="round-info">
              Round <span className="font-bold text-game-blue">{room.currentRound}</span> of {room.maxRounds}
            </span>
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-game-amber mr-2" />
            <Badge 
              variant={timeRemaining <= 10 ? "destructive" : "secondary"}
              className={`text-lg font-bold px-3 py-1 ${
                timeRemaining <= 10 ? "bg-red-500 text-white" : "bg-game-amber text-white"
              }`}
              data-testid="timer"
            >
              {formatTime(timeRemaining)}
            </Badge>
          </div>
        </div>

        {/* Numbers Display */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Use these 4 numbers to make 24:
          </h2>
          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto" data-testid="numbers-display">
            {room.currentNumbers?.map((number, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-game-slate to-gray-700 text-white rounded-2xl p-6 shadow-lg transform hover:scale-105 transition-transform"
                data-testid={`number-${index}`}
              >
                <div className="text-4xl font-bold text-center">{number}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Expression Input */}
        <div className="mb-6">
          <Label htmlFor="expression" className="text-sm font-medium text-gray-700 mb-2 block">
            Your mathematical expression:
          </Label>
          <div className="flex gap-3">
            <Input
              id="expression"
              type="text"
              placeholder="e.g., (6 + 8) * 2 - 4"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 text-lg font-mono"
              disabled={!canSubmit}
              data-testid="input-expression"
            />
            <Button 
              onClick={handleSubmit}
              disabled={!canSubmit || !expression.trim()}
              className="bg-game-blue hover:bg-blue-600"
              data-testid="button-submit"
            >
              <Send className="h-4 w-4 mr-2" />
              Submit
            </Button>
          </div>
          
          {validationError && (
            <div className="mt-2 text-sm text-red-600" data-testid="validation-error">
              <span className="font-medium">Error:</span> {validationError}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            data-testid="button-skip"
          >
            <SkipForward className="h-4 w-4 mr-2" />
            Skip This Round
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-game-amber hover:bg-yellow-500 text-white border-game-amber"
            data-testid="button-hint"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Request Hint
          </Button>
          <Button 
            onClick={onShowSolution}
            className="flex-1 bg-game-green hover:bg-green-600"
            data-testid="button-solution"
          >
            <Eye className="h-4 w-4 mr-2" />
            Show Solution
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
