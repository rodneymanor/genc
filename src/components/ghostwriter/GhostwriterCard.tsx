import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component
import { UserCircle2 } from 'lucide-react'; // Or your preferred user icon

interface GhostwriterCardProps {
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  hook: string;
  goldenNugget: string;
  tags?: string[];
  likes?: number;
  comments?: number;
  shares?: number;
}

const GhostwriterCard: React.FC<GhostwriterCardProps> = ({
  authorName,
  authorHandle,
  authorAvatar,
  hook,
  goldenNugget,
  tags,
  likes,
  comments,
  shares,
}) => {
  return (
    <Card className="mb-4 break-inside-avoid">
      <CardHeader>
        <div className="flex items-center space-x-3">
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className="size-10 rounded-full" />
          ) : (
            <UserCircle2 className="size-10 text-muted-foreground" />
          )}
          <div>
            <CardTitle className="text-sm font-medium">{authorName}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">@{authorHandle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Hook</h3>
          <p className="text-sm">{hook}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Golden Nugget</h3>
          <p className="text-sm">{goldenNugget}</p>
        </div>
        {tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
        {(likes !== undefined || comments !== undefined || shares !== undefined) && (
           <div className="mt-4 flex items-center space-x-4 text-xs text-muted-foreground">
            {likes !== undefined && <span>{likes} Likes</span>}
            {comments !== undefined && <span>{comments} Comments</span>}
            {shares !== undefined && <span>{shares} Shares</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GhostwriterCard; 