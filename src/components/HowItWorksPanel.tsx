import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

export function HowItWorksPanel() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">How It Works</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Collapse explanation" : "Expand explanation"}
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                {!isExpanded && (
                    <CardDescription>
                        Learn about pairwise comparison and intelligent ranking
                    </CardDescription>
                )}
            </CardHeader>
            {isExpanded && (
                <CardContent className="space-y-4 text-sm">
                    <div>
                        <h4 className="font-semibold mb-2">🎯 Pairwise Ranking</h4>
                        <p className="text-muted-foreground">
                            Instead of asking "rank these 10 items," we ask simpler questions: 
                            "Which is better, A or B?" This approach reduces bias and makes 
                            complex decisions manageable by breaking them into simple comparisons.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">🧮 Smart Elo System</h4>
                        <p className="text-muted-foreground">
                            Originally created for chess rankings, Elo ratings dynamically 
                            adjust scores based on match outcomes. When a lower-rated item 
                            beats a higher-rated one, the score change is larger than expected wins.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">🎓 Intelligent Selection</h4>
                        <p className="text-muted-foreground">
                            Our algorithm doesn't just pick random pairs. It prioritizes:
                        </p>
                        <ul className="list-disc ml-4 mt-1 space-y-1 text-muted-foreground">
                            <li>Items with similar scores (more informative)</li>
                            <li>Items with low confidence (need more data)</li>
                            <li>Strategically valuable comparisons</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">⚡ Early Completion</h4>
                        <p className="text-muted-foreground">
                            You don't need to compare every possible pair! The system can 
                            complete rankings early when it reaches high confidence in the 
                            relative positions, saving you time.
                        </p>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-md">
                        <h4 className="font-semibold mb-1">💡 Perfect For:</h4>
                        <p className="text-muted-foreground text-xs">
                            Ranking job candidates, design options, feature priorities, 
                            investment choices, creative work, product features, or any 
                            complex decision involving multiple alternatives.
                        </p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
} 