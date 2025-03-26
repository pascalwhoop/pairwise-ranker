// src/app/page.tsx
"use client"; // Essential for state and event handlers

import React, { useState, useEffect, useRef, useCallback } from "react";
import Papa from "papaparse";
import { toast } from "sonner"; // Use Sonner
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Download } from "lucide-react";


// --- Data Structures ---
interface Item {
    id: number;
    name: string;
    wins: number; // Simple win count for ranking
    // comparisonsMade: number; // Could add for more complex logic
}

type Pair = [number, number]; // Represents [itemIdA, itemIdB]

// --- Helper Functions ---
function generatePairs(itemIds: number[]): Pair[] {
    const pairs: Pair[] = [];
    if (itemIds.length < 2) return pairs;
    for (let i = 0; i < itemIds.length; i++) {
        for (let j = i + 1; j < itemIds.length; j++) {
            pairs.push([itemIds[i], itemIds[j]]);
        }
    }
    // Shuffle pairs for variety
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    return pairs;
}

function downloadCSV(filename: string, data: Item[]) {
    const sortedData = [...data].sort((a, b) => b.wins - a.wins);
    const csvContent = "Rank,Name,Wins\n" +
                       sortedData.map((item, index) => `${index + 1},"${item.name.replace(/"/g, '""')}",${item.wins}`).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // feature detection
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


// --- Main Component ---
export default function HomePage() {
    const [items, setItems] = useState<Item[]>([]);
    const [pasteContent, setPasteContent] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [allPossiblePairs, setAllPossiblePairs] = useState<Pair[]>([]);
    const [remainingPairs, setRemainingPairs] = useState<Pair[]>([]);
    const [currentPair, setCurrentPair] = useState<Pair | null>(null);
    const [rankedItems, setRankedItems] = useState<Item[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRankingComplete, setIsRankingComplete] = useState<boolean>(false);

    // --- Input Handling ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsLoading(true);
        resetRanking();

        Papa.parse<string[]>(file, {
            complete: (results) => {
                const names = results.data.flat().map(name => name.trim()).filter(name => name);
                loadItems(names);
                setIsLoading(false);
                 if (fileInputRef.current) {
                     fileInputRef.current.value = ""; // Reset file input
                 }
            },
            error: (error) => {
                console.error("CSV Parsing Error:", error);
                toast.error(`Error parsing CSV: ${error.message}`);
                setIsLoading(false);
                 if (fileInputRef.current) {
                     fileInputRef.current.value = ""; // Reset file input
                 }
            },
            skipEmptyLines: true,
        });
    };

    const handlePaste = () => {
        const names = pasteContent.split('\n').map(name => name.trim()).filter(name => name);
        if (names.length === 0) {
            toast.warning("Paste area is empty or contains no valid items.");
            return;
        }
         setIsLoading(true);
         resetRanking();
         loadItems(names);
         setPasteContent(""); // Clear textarea
         setIsLoading(false);
    };

    const loadItems = (names: string[]) => {
         if (names.length < 2) {
             toast.warning("Please provide at least 2 items to rank.");
             setItems([]);
             return;
         }
        const newItems = names.map((name, index) => ({
            id: index, // Simple ID generation
            name: name,
            wins: 0,
        }));
        setItems(newItems);
        toast.success(`${newItems.length} items loaded successfully!`);
    };

    // --- Ranking Logic ---
    useEffect(() => {
        // Update ranking whenever items change
        const sorted = [...items].sort((a, b) => b.wins - a.wins);
        setRankedItems(sorted);

        // Initialize or update pairs when items are loaded/changed
        if (items.length >= 2) {
            const itemIds = items.map(item => item.id);
            const newPairs = generatePairs(itemIds);
            setAllPossiblePairs(newPairs);
            setRemainingPairs(newPairs); // Start with all pairs
            setCurrentPair(newPairs[0] || null); // Set the first pair
            setIsRankingComplete(false);
        } else {
            setAllPossiblePairs([]);
            setRemainingPairs([]);
            setCurrentPair(null);
            setIsRankingComplete(true);
        }
    }, [items]); // Dependency: items array

     const handleChoice = useCallback((winnerId: number) => {
        if (!currentPair) return;

        const [idA, idB] = currentPair;
        const loserId = (winnerId === idA) ? idB : idA; // Determine loser

         setItems(prevItems => prevItems.map(item =>
            item.id === winnerId ? { ...item, wins: item.wins + 1 } : item
         ));

        // Move to the next pair
         const nextRemainingPairs = remainingPairs.slice(1);
         setRemainingPairs(nextRemainingPairs);

         if (nextRemainingPairs.length === 0) {
            setCurrentPair(null);
            setIsRankingComplete(true);
            toast.success("Ranking complete! All pairs compared.");
         } else {
            setCurrentPair(nextRemainingPairs[0]);
         }
    }, [currentPair, remainingPairs]); // Dependencies


    const resetRanking = () => {
        setItems([]);
        setPasteContent("");
        setAllPossiblePairs([]);
        setRemainingPairs([]);
        setCurrentPair(null);
        setRankedItems([]);
        setIsRankingComplete(false);
        setIsLoading(false);
         if (fileInputRef.current) {
             fileInputRef.current.value = ""; // Reset file input
         }
         toast.info("Ranking reset.");
    };

    // --- Keyboard Handling ---
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!currentPair || isRankingComplete) return; // Only active during comparison

            const [idA, idB] = currentPair;
            const itemA = items.find(i => i.id === idA);


            if (event.key.toLowerCase() === 'a') {
                event.preventDefault(); // Prevent typing 'a' in inputs etc.
                if(itemA) handleChoice(itemA.id);
            } else if (event.key.toLowerCase() === 'b') {
                 event.preventDefault(); // Prevent typing 'b'
                 const itemB = items.find(i => i.id === idB);
                 if(itemB) handleChoice(itemB.id);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => { // Cleanup listener on component unmount
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentPair, items, handleChoice, isRankingComplete]); // Dependencies

    // --- Get Item Details ---
    const getItemById = (id: number): Item | undefined => items.find(item => item.id === id);

    // --- Calculate Progress ---
    const totalPairs = allPossiblePairs.length;
    const completedPairs = totalPairs - remainingPairs.length;
    const progressPercent = totalPairs > 0 ? Math.round((completedPairs / totalPairs) * 100) : 0;


    // --- Render ---
    const itemA = currentPair ? getItemById(currentPair[0]) : null;
    const itemB = currentPair ? getItemById(currentPair[1]) : null;

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Pairwise Ranker</h1>
                <p className="text-muted-foreground">Rank your items by comparing them head-to-head.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* --- Column 1: Input & Ranking --- */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Input Card */}
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
                                    onChange={handleFileChange}
                                    disabled={isLoading || items.length > 0}
                                />
                            </div>
                            <Separator orientation="horizontal" />
                            <div className="space-y-2">
                                <Label htmlFor="paste-area">Or Paste List</Label>
                                <Textarea
                                    id="paste-area"
                                    placeholder="Item 1
Item 2
Item 3..."
                                    value={pasteContent}
                                    onChange={(e) => setPasteContent(e.target.value)}
                                    rows={5}
                                    disabled={isLoading || items.length > 0}
                                />
                                <Button onClick={handlePaste} disabled={isLoading || items.length > 0 || !pasteContent.trim()}>
                                    Load from Paste
                                </Button>
                            </div>
                             {items.length > 0 && (
                                 <Button variant="outline" onClick={resetRanking} className="w-full">
                                    Reset / Start Over
                                </Button>
                             )}
                        </CardContent>
                    </Card>

                     {/* Ranking Card */}
                    {items.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>2. Live Ranking</CardTitle>
                                     <Button
                                         variant="outline"
                                         size="sm"
                                         onClick={() => downloadCSV('ranking.csv', rankedItems)}
                                         title="Export Ranking as CSV"
                                     >
                                         <Download className="h-4 w-4 mr-2" /> Export
                                     </Button>
                                </div>
                                <CardDescription>Current ranking based on wins. Updates live.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {rankedItems.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">Rank</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="text-right">Wins</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {rankedItems.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell>{item.name}</TableCell>
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
                    )}
                </div>

                 {/* --- Column 2: Comparison Area --- */}
                <div className="lg:col-span-2">
                     <Card className="sticky top-8"> {/* Make comparison sticky */}
                         <CardHeader>
                             <CardTitle>3. Compare Items</CardTitle>
                             {items.length >= 2 && (
                                 <CardDescription>
                                     Choose the better item (A or B). Use buttons or 'A'/'B' keys.
                                     <br />
                                     Progress: {completedPairs} / {totalPairs} pairs ({progressPercent}%)
                                 </CardDescription>
                             )}
                             {items.length < 2 && (
                                 <CardDescription>Load at least two items to start comparing.</CardDescription>
                             )}
                         </CardHeader>
                         <CardContent className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
                             {isLoading && <p>Loading items...</p>}

                             {!isLoading && currentPair && itemA && itemB && !isRankingComplete ? (
                                 <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                                     {/* Item A Button */}
                                     <Button
                                         variant="outline"
                                         className="h-auto p-6 flex flex-col justify-center items-center text-center text-lg md:text-xl hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                         onClick={() => handleChoice(itemA.id)}
                                         aria-label={`Choose ${itemA.name} (Option A)`}
                                     >
                                         <span className="text-sm font-semibold text-muted-foreground mb-2">[A]</span>
                                         <span>{itemA.name}</span>
                                     </Button>

                                     {/* Item B Button */}
                                     <Button
                                         variant="outline"
                                         className="h-auto p-6 flex flex-col justify-center items-center text-center text-lg md:text-xl hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                         onClick={() => handleChoice(itemB.id)}
                                         aria-label={`Choose ${itemB.name} (Option B)`}
                                     >
                                         <span className="text-sm font-semibold text-muted-foreground mb-2">[B]</span>
                                         <span>{itemB.name}</span>
                                     </Button>
                                 </div>
                             ) : !isLoading && items.length >= 2 && isRankingComplete ? (
                                 <div className="text-center space-y-4">
                                     <p className="text-xl font-semibold text-green-600">Ranking Complete!</p>
                                     <p>All pairs have been compared.</p>
                                      <Button variant="outline" onClick={resetRanking}>
                                            Start New Ranking
                                        </Button>
                                 </div>
                             ) : !isLoading && items.length < 2 ? (
                                  <p className="text-muted-foreground">Load items using the panel on the left.</p>
                             ) : null /* Handle other potential states if necessary */}
                         </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    );
}