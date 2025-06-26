import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface LoadItemsPanelProps {
  isLoading: boolean;
  itemsLoaded: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste: () => void;
  pasteContent: string;
  setPasteContent: (value: string) => void;
  onReset: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function LoadItemsPanel({
  isLoading,
  itemsLoaded,
  onFileChange,
  onPaste,
  pasteContent,
  setPasteContent,
  onReset,
  fileInputRef,
}: LoadItemsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Load Items</CardTitle>
        <CardDescription>Upload a CSV (one item per row/cell) or paste a list (one item per line).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-upload">Upload CSV</Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={onFileChange}
            disabled={isLoading || itemsLoaded}
          />
        </div>
        <Separator orientation="horizontal" />
        <div className="space-y-2">
          <Label htmlFor="paste-area">Or Paste List</Label>
          <Textarea
            id="paste-area"
            placeholder={`Item 1\nItem 2\nItem 3...`}
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            rows={5}
            disabled={isLoading || itemsLoaded}
          />
          <Button onClick={onPaste} disabled={isLoading || itemsLoaded || !pasteContent.trim()}>
            Load from Paste
          </Button>
        </div>
        {itemsLoaded && (
          <Button variant="outline" onClick={onReset} className="w-full">
            Reset / Start Over
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 