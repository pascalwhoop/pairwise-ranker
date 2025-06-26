import React, { useState, useRef, useMemo } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Download } from "lucide-react";
import EloRank from "elo-rank";
import { generatePairs, pairKey } from "./lib/utils";
import { LoadItemsPanel } from "./components/LoadItemsPanel";
import { RankingTable } from "./components/RankingTable";
import { PairwiseCompare } from "./components/PairwiseCompare";

const elo = new EloRank(32);

interface Item {
    id: number;
    name: string;
    rating: number;
    wins: number;
}

type Pair = [number, number];

export default function App() {
    const [items, setItems] = useState<Item[]>([]);
    const [pasteContent, setPasteContent] = useState<string>("");
    const [comparedPairs, setComparedPairs] = useState<Set<string>>(new Set());
    const [remainingPairs, setRemainingPairs] = useState<Pair[]>([]);
    const [isRankingComplete, setIsRankingComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Derived
    const allPairs = useMemo(() => generatePairs(items.map(i => i.id)), [items]);
    const progress = allPairs.length ? Math.round((comparedPairs.size / allPairs.length) * 100) : 0;
    const currentPair = remainingPairs[0] || null;
    const rankedItems = useMemo(() => [...items].sort((a, b) => b.rating - a.rating), [items]);

    // Handlers
    function loadItems(names: string[]) {
        if (names.length < 2) {
            toast.warning("Please provide at least 2 items to rank.");
            setItems([]);
            setComparedPairs(new Set());
            setRemainingPairs([]);
            setIsRankingComplete(true);
            return;
        }
        const newItems = names.map((name, index) => ({
            id: index,
            name: name,
            rating: 1200,
            wins: 0,
        }));
        setItems(newItems);
        setComparedPairs(new Set());
        const ids = newItems.map(i => i.id);
        setRemainingPairs(generatePairs(ids));
        setIsRankingComplete(false);
        toast.success(`${newItems.length} items loaded successfully!`);
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

    function handleChoice(winnerId: number) {
        if (!currentPair) return;
        const [idA, idB] = currentPair;
        const loserId = (winnerId === idA) ? idB : idA;
        const winnerItem = items.find(item => item.id === winnerId);
        const loserItem = items.find(item => item.id === loserId);
        if (!winnerItem || !loserItem) return;
        const expectedWinner = elo.getExpected(winnerItem.rating, loserItem.rating);
        const expectedLoser = elo.getExpected(loserItem.rating, winnerItem.rating);
        const newWinnerRating = elo.updateRating(expectedWinner, 1, winnerItem.rating);
        const newLoserRating = elo.updateRating(expectedLoser, 0, loserItem.rating);
        setItems(prevItems => prevItems.map(item => {
            if (item.id === winnerId) {
                return { ...item, rating: newWinnerRating, wins: item.wins + 1 };
            } else if (item.id === loserId) {
                return { ...item, rating: newLoserRating };
            }
            return item;
        }));
        setComparedPairs(prev => {
            const next = new Set(prev);
            next.add(pairKey(currentPair));
            return next;
        });
        setRemainingPairs(prev => {
            const next = prev.slice(1);
            if (next.length === 0) setIsRankingComplete(true);
            return next;
        });
    }

    function resetRanking() {
        setItems([]);
        setPasteContent("");
        setComparedPairs(new Set());
        setRemainingPairs([]);
        setIsRankingComplete(false);
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast.info("Ranking reset.");
    }

    function downloadCSV(filename: string, data: Item[]) {
        const sortedData = [...data].sort((a, b) => b.rating - a.rating);
        const csvContent = "Rank,Name,Elo Rating,Wins\n" +
            sortedData.map((item, index) => `${index + 1},"${item.name.replace(/"/g, '""')}",${item.rating},${item.wins}`).join("\n");
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

    const getItemById = (id: number): Item | undefined => items.find(item => item.id === id);
    const itemA = currentPair ? getItemById(currentPair[0]) ?? null : null;
    const itemB = currentPair ? getItemById(currentPair[1]) ?? null : null;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Pairwise Ranker</h1>
                <p className="text-muted-foreground">Rank your items by comparing them head-to-head.</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <LoadItemsPanel
                        isLoading={isLoading}
                        itemsLoaded={items.length > 0}
                        onFileChange={handleFileChange}
                        onPaste={handlePaste}
                        pasteContent={pasteContent}
                        setPasteContent={setPasteContent}
                        onReset={resetRanking}
                        fileInputRef={fileInputRef}
                    />
                    {items.length > 0 && (
                        <RankingTable
                            rankedItems={rankedItems}
                            onExport={() => downloadCSV('ranking.csv', rankedItems)}
                        />
                    )}
                </div>
                <div className="lg:col-span-2">
                    <div className="sticky top-8">
                        <div className="mb-4">
                            {items.length >= 2 && (
                                <div className="text-muted-foreground mb-2">
                                    Choose the better item (A or B). Use buttons or 'A'/'B' keys.<br />
                                    Progress: {comparedPairs.size} / {allPairs.length} pairs ({progress}%)
                                </div>
                            )}
                            {items.length < 2 && (
                                <div className="text-muted-foreground mb-2">
                                    Load at least two items to start comparing.
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
                            <PairwiseCompare
                                itemA={itemA}
                                itemB={itemB}
                                onChoose={handleChoice}
                                isRankingComplete={isRankingComplete}
                                isLoading={isLoading}
                            />
                            {!isLoading && items.length >= 2 && isRankingComplete && (
                                <div className="text-center space-y-4">
                                    <p className="text-xl font-semibold text-green-600">Ranking Complete!</p>
                                    <p>All pairs have been compared.</p>
                                    <button className="border rounded px-4 py-2" onClick={resetRanking}>
                                        Start New Ranking
                                    </button>
                                </div>
                            )}
                            {!isLoading && items.length < 2 && (
                                <p className="text-muted-foreground">Load items using the panel on the left.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 