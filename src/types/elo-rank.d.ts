declare module 'elo-rank' {
  class EloRank {
    constructor(k?: number);
    getExpected(playerRating: number, opponentRating: number): number;
    updateRating(expected: number, actual: number, playerRating: number): number;
  }
  
  export default EloRank;
} 