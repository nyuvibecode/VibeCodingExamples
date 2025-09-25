import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle, XCircle, Lightbulb, Eye } from "lucide-react";
import { GameActivity } from "@shared/schema";

interface ActivityFeedProps {
  activities: GameActivity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "solved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "attempted":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "hint":
        return <Lightbulb className="h-4 w-4 text-amber-600" />;
      case "solution_revealed":
        return <Eye className="h-4 w-4 text-blue-600" />;
      default:
        return <History className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "solved":
        return "bg-green-50 border-green-200";
      case "attempted":
        return "bg-red-50 border-red-200";
      case "hint":
        return "bg-amber-50 border-amber-200";
      case "solution_revealed":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getActivityMessage = (activity: GameActivity) => {
    switch (activity.type) {
      case "solved":
        return "solved it!";
      case "attempted":
        return `tried: ${activity.expression}`;
      case "hint":
        return "requested a hint";
      case "solution_revealed":
        return "revealed the solution";
      default:
        return "performed an action";
    }
  };

  const formatTimeAgo = (timestamp: Date | null) => {
    if (!timestamp) return "just now";
    
    const now = new Date();
    const timestampDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diff = now.getTime() - timestampDate.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "just now";
    if (minutes === 1) return "1 minute ago";
    return `${minutes} minutes ago`;
  };

  return (
    <Card data-testid="activity-feed">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <History className="h-5 w-5 text-gray-500 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500" data-testid="no-activities">
                No activities yet. Be the first to make a move!
              </div>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                  data-testid={`activity-${activity.id}`}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: "#3B82F6" }}
                  >
                    {activity.playerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getActivityIcon(activity.type)}
                      <span className="font-medium text-gray-800">
                        {activity.playerName} {getActivityMessage(activity)}
                      </span>
                    </div>
                    
                    {activity.expression && (
                      <div className="text-sm font-mono text-gray-600 mb-1" data-testid={`activity-expression-${activity.id}`}>
                        {activity.expression}
                        {activity.result && (
                          <span className="ml-2">
                            = {activity.result} {activity.type === "solved" ? "✓" : "✗"}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {activity.points && activity.points > 0 && (
                        <Badge variant="outline" className="text-green-600 border-green-600" data-testid={`activity-points-${activity.id}`}>
                          +{activity.points} points
                        </Badge>
                      )}
                      <span data-testid={`activity-timestamp-${activity.id}`}>
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
