import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface Item {
  id: number;
  name: string;
}

interface PairwiseCompareProps {
  itemA: Item | null;
  itemB: Item | null;
  onChoose: (winnerId: number) => void;
  isRankingComplete: boolean;
  isLoading: boolean;
}

export function PairwiseCompare({ itemA, itemB, onChoose, isRankingComplete, isLoading }: PairwiseCompareProps) {
  if (isLoading) return <p>Loading items...</p>;
  if (isRankingComplete) return null;
  if (!itemA || !itemB) return null;
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
      <Button
        variant="outline"
        className="h-auto p-6 flex flex-col justify-center items-center text-center text-lg md:text-xl hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => onChoose(itemA.id)}
        aria-label={`Choose ${itemA.name} (Option A)`}
      >
        <span className="text-sm font-semibold text-muted-foreground mb-2">[A]</span>
        <span className="max-w-xs overflow-auto break-words">
          <ReactMarkdown>{itemA.name}</ReactMarkdown>
        </span>
      </Button>
      <Button
        variant="outline"
        className="h-auto p-6 flex flex-col justify-center items-center text-center text-lg md:text-xl hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => onChoose(itemB.id)}
        aria-label={`Choose ${itemB.name} (Option B)`}
      >
        <span className="text-sm font-semibold text-muted-foreground mb-2">[B]</span>
        <span className="max-w-xs overflow-auto break-words">
          <ReactMarkdown>{itemB.name}</ReactMarkdown>
        </span>
      </Button>
    </div>
  );
} 