import { ModerationResponse } from './types';

export function getRatingsFromModerationResponse(
    moderationResponse: ModerationResponse
  ): number {
    const { results } = moderationResponse;
    const categoryScores = results[0].category_scores;
    const categoryScoresKeys = Object.keys(categoryScores);
    const len = categoryScoresKeys.length;
    let sum = 0;
    categoryScoresKeys.forEach((key) => {
      const value = categoryScores[key];
      sum += value;
    });
    const averageScore = (sum / len).toFixed(31).slice(2);
    let zeroes = 0,
      nonZeroFlag = false;
    averageScore.split("").forEach((ch) => {
      if (!nonZeroFlag && ch === "0") {
        zeroes++;
      } else {
        nonZeroFlag = true;
      }
    });
    return 10 - zeroes;
  }