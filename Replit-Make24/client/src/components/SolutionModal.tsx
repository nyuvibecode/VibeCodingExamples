import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

interface SolutionModalProps {
  isVisible: boolean;
  solution: string;
  onClose: () => void;
}

export function SolutionModal({ isVisible, solution, onClose }: SolutionModalProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-testid="solution-modal">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <Lightbulb className="h-16 w-16 text-game-amber mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Solution Revealed!</h2>
            
            <div className="bg-gray-100 rounded-xl p-6 mb-6">
              <div className="text-sm text-gray-600 mb-2">One possible solution:</div>
              <div className="text-2xl font-mono font-bold text-game-blue" data-testid="solution-expression">
                {solution} = 24
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mb-6" data-testid="solution-message">
              No points awarded when solution is revealed. Get ready for the next round!
            </div>
            
            <Button 
              onClick={onClose}
              className="w-full bg-game-blue hover:bg-blue-600"
              data-testid="button-continue"
            >
              Continue to Next Round
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
