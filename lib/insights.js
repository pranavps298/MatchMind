export function calculateSignals(match) {
  const score = match?.currentScore || {};
  const target = Number(match?.target) || null;
  const runs = Number(score.runs) || 0;
  const wickets = Number(score.wickets) || 0;
  const overs = Number(score.overs) || 0;
  const maxOvers = Number(match?.maxOvers) || null;
  const ballsUsed = Math.floor(overs) * 6 + Math.round((overs % 1) * 10);
  const ballsRemaining = maxOvers ? Math.max(0, maxOvers * 6 - ballsUsed) : null;
  const runsRequired = target ? Math.max(0, target - runs) : null;
  const requiredRunRate = runsRequired !== null && ballsRemaining !== null && ballsRemaining > 0 ? Number((runsRequired / ballsRemaining * 6).toFixed(2)) : null;
  const currentRunRate = ballsUsed > 0 ? Number((runs / ballsUsed * 6).toFixed(2)) : null;
  const rateGap = requiredRunRate !== null && currentRunRate !== null ? Number((requiredRunRate - currentRunRate).toFixed(2)) : null;
  const pressure = rateGap === null ? null : Math.min(100, Math.max(0, Math.round(50 + rateGap * 12 + wickets * 2)));
  return { score: `${runs}/${wickets}`, overs, target, runsRequired, ballsRemaining, requiredRunRate, currentRunRate, rateGap, pressureIndex: pressure, evidence: [target && `Target: ${target}`, `Current score: ${runs}/${wickets} after ${overs} overs`, runsRequired !== null && `${runsRequired} runs needed from ${ballsRemaining} balls`, requiredRunRate !== null && `Required rate: ${requiredRunRate}`, currentRunRate !== null && `Current rate: ${currentRunRate}`].filter(Boolean) };
}

