import React, { useState, useRef, useMemo, useEffect } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { PairwiseRanker } from "pairwise-ranker";
import { LoadItemsPanel } from "./components/LoadItemsPanel";
import { RankingTable } from "./components/RankingTable";
import { PairwiseCompare } from "./components/PairwiseCompare";
import { HowItWorksPanel } from "./components/HowItWorksPanel";

interface Item {
    id: number;
    name: string;
    score: number;
    rank: number;
    confidence: number;
}

export default function App() {
    const [itemNames, setItemNames] = useState<string[]>([]);
    const [pasteContent, setPasteContent] = useState<string>("");
    const [ranker, setRanker] = useState<PairwiseRanker | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [updateCounter, setUpdateCounter] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Derived state from the ranker
    const currentPair = useMemo(() => {
        if (!ranker) return null;
        const nextMatch = ranker.getNextMatch();
        return nextMatch;
    }, [ranker, updateCounter]);

    const items = useMemo(() => {
        if (!ranker) return [];
        const rankings = ranker.getRankings();
        return rankings.map((ranking, index): Item => ({
            id: index,
            name: ranking.item,
            score: ranking.score,
            rank: ranking.rank,
            confidence: ranking.confidence,
        }));
    }, [ranker, updateCounter]);

    const isRankingComplete = useMemo(() => {
        return ranker ? ranker.isSessionComplete() : false;
    }, [ranker, updateCounter]);

    const progress = useMemo(() => {
        if (!ranker) return 0;
        // Calculate progress based on comparisons made vs total possible pairs
        const totalPairs = itemNames.length * (itemNames.length - 1) / 2;
        const nextMatches = ranker.getNextMatches(totalPairs);
        const completedPairs = totalPairs - nextMatches.length;
        return totalPairs > 0 ? Math.round((completedPairs / totalPairs) * 100) : 0;
    }, [ranker, itemNames.length, updateCounter]);

    // Handlers
    function loadItems(names: string[]) {
        if (names.length < 2) {
            toast.warning("Please provide at least 2 items to rank.");
            setItemNames([]);
            setRanker(null);
            return;
        }
        try {
            const newRanker = new PairwiseRanker(names);
            setRanker(newRanker);
            setItemNames(names);
            toast.success(`${names.length} items loaded successfully!`);
        } catch (error) {
            console.error("Error creating ranker:", error);
            toast.error(`Error creating ranker: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsLoading(true);
        resetRanking();
        Papa.parse<string[]>(file, {
            complete: (results) => {
                const names = results.data.flat().map(name => name.trim()).filter(name => name);
                loadItems(names);
                setIsLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            error: (error) => {
                console.error("CSV Parsing Error:", error);
                toast.error(`Error parsing CSV: ${error.message}`);
                setIsLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
            skipEmptyLines: true,
        });
    }

    function handlePaste() {
        const names = pasteContent.split('\n').map(name => name.trim()).filter(name => name);
        if (names.length === 0) {
            toast.warning("Paste area is empty or contains no valid items.");
            return;
        }
        setIsLoading(true);
        resetRanking();
        loadItems(names);
        setPasteContent("");
        setIsLoading(false);
    }

    function handleChoice(winnerName: string) {
        if (!ranker || !currentPair) return;
        
        const loserName = currentPair.itemA === winnerName ? currentPair.itemB : currentPair.itemA;
        
        try {
            ranker.submitComparison(winnerName, loserName);
            // Force re-render by incrementing the update counter
            setUpdateCounter(prev => prev + 1);
        } catch (error) {
            console.error("Error submitting comparison:", error);
            toast.error(`Error submitting comparison: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    function resetRanking() {
        setItemNames([]);
        setPasteContent("");
        setRanker(null);
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.info("Ranking reset.");
    }

    function downloadCSV(filename: string, data: Item[]) {
        const sortedData = [...data].sort((a, b) => a.rank - b.rank);
        const csvContent = "Rank,Name,Score,Confidence\n" +
            sortedData.map((item) => `${item.rank},"${item.name.replace(/"/g, '""')}",${item.score.toFixed(4)},${item.confidence.toFixed(4)}`).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            toast.error("CSV download not supported in your browser.");
        }
    }

    const itemA = currentPair ? { id: 0, name: currentPair.itemA } : null;
    const itemB = currentPair ? { id: 1, name: currentPair.itemB } : null;

    // Keyboard event handler
    useEffect(() => {
        function handleKeyPress(event: KeyboardEvent) {
            if (!currentPair || !itemA || !itemB || isRankingComplete || isLoading) return;
            
            const key = event.key.toLowerCase();
            if (key === 'a') {
                event.preventDefault();
                handleChoice(itemA.name);
            } else if (key === 'b') {
                event.preventDefault();
                handleChoice(itemB.name);
            }
        }

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [currentPair, itemA, itemB, isRankingComplete, isLoading]);

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Pairwise Ranker</h1>
                <p className="text-muted-foreground">
                    Intelligent ranking through simple A vs B comparisons using advanced Elo algorithms
                </p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <LoadItemsPanel
                        isLoading={isLoading}
                        itemsLoaded={itemNames.length > 0}
                        onFileChange={handleFileChange}
                        onPaste={handlePaste}
                        pasteContent={pasteContent}
                        setPasteContent={setPasteContent}
                        onReset={resetRanking}
                        fileInputRef={fileInputRef}
                    />
                    <HowItWorksPanel />
                    {items.length > 0 && (
                        <RankingTable
                            rankedItems={items}
                            onExport={() => downloadCSV('ranking.csv', items)}
                        />
                    )}
                </div>
                <div className="lg:col-span-2">
                    <div className="sticky top-8">
                        <div className="mb-4">
                            {itemNames.length >= 2 && (
                                <div className="text-muted-foreground mb-2">
                                    Choose the better item (A or B). Use buttons or 'A'/'B' keys.<br />
                                    Progress: {progress}% complete {isRankingComplete && "(Complete!)"}
                                </div>
                            )}
                            {itemNames.length < 2 && (
                                <div className="text-muted-foreground mb-2">
                                    Load at least two items to start comparing.
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
                            <PairwiseCompare
                                itemA={itemA}
                                itemB={itemB}
                                onChoose={(id) => {
                                    if (itemA && itemB) {
                                        const winnerName = id === itemA.id ? itemA.name : itemB.name;
                                        handleChoice(winnerName);
                                    }
                                }}
                                isRankingComplete={isRankingComplete}
                                isLoading={isLoading}
                            />
                            {!isLoading && itemNames.length >= 2 && isRankingComplete && (
                                <div className="text-center space-y-4">
                                    <p className="text-xl font-semibold text-green-600">Ranking Complete!</p>
                                    <p>All necessary comparisons have been made with sufficient confidence.</p>
                                    <button className="border rounded px-4 py-2" onClick={resetRanking}>
                                        Start New Ranking
                                    </button>
                                </div>
                            )}
                            {!isLoading && itemNames.length < 2 && (
                                <p className="text-muted-foreground">Load items using the panel on the left.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 