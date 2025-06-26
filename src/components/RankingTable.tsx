import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import ReactMarkdown from "react-markdown";

interface Item {
  id: number;
  name: string;
  rating: number;
  wins: number;
}

interface RankingTableProps {
  rankedItems: Item[];
  onExport?: () => void;
}

export function RankingTable({ rankedItems, onExport }: RankingTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>2. Live Ranking</CardTitle>
          {onExport && (
            <button onClick={onExport} title="Export Ranking as CSV" className="border rounded px-2 py-1 text-sm">
              Export
            </button>
          )}
        </div>
        <CardDescription>Current ranking based on Elo ratings. Updates live.</CardDescription>
      </CardHeader>
      <CardContent>
        {rankedItems.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Wins</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedItems.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="max-w-xs overflow-auto break-words">
                      <ReactMarkdown>{item.name}</ReactMarkdown>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{Math.round(item.rating)}</TableCell>
                  <TableCell className="text-right">{item.wins}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center">Load items to see the ranking.</p>
        )}
      </CardContent>
    </Card>
  );
} 