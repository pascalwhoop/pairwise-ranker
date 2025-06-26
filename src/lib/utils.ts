import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Pair = [number, number];

export function generatePairs(itemIds: number[]): Pair[] {
    const pairs: Pair[] = [];
    if (itemIds.length < 2) return pairs;
    for (let i = 0; i < itemIds.length; i++) {
        for (let j = i + 1; j < itemIds.length; j++) {
            pairs.push([itemIds[i], itemIds[j]]);
        }
    }
    for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    return pairs;
}

export function pairKey(pair: Pair): string {
    return [Math.min(pair[0], pair[1]), Math.max(pair[0], pair[1])].join('-');
}

export function progressPercent(comparedPairsSet: Set<string>, allPossiblePairs: Pair[]): number {
    const totalPairs = allPossiblePairs.length;
    const completedPairs = comparedPairsSet.size;
    return totalPairs > 0 ? Math.round((completedPairs / totalPairs) * 100) : 0;
}
