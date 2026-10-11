const CRICKET_BASE = "https://api.cricapi.com/v1";
const liveInnings = (score = []) => score[score.length - 1] || {};
async function cricketData(path, apiKey) {
  const result = await fetch(`${CRICKET_BASE}${path}${path.includes("?") ? "&" : "?"}apikey=${encodeURIComponent(apiKey)}`, { cache: "no-store" });
  if (!result.ok) throw new Error(`CricketData returned ${result.status}`);
  const payload = await result.json();
  if (payload.status !== "success") throw new Error(payload.reason || "CricketData did not return a successful response");
  return payload;
}
function normalise(match, scorecard) {
  const innings = scorecard?.data?.score || match?.score || [];
  const current = liveInnings(innings); const prior = innings.length > 1 ? innings[innings.length - 2] : null;
  const matchType = scorecard?.data?.matchType || match.matchType || "t20";
  return { id: scorecard?.data?.id || match.id, name: scorecard?.data?.name || match.name, status: scorecard?.data?.status || match.status, venue: scorecard?.data?.venue || match.venue, teams: scorecard?.data?.teams || match.teams || [], matchType, maxOvers: matchType === "test" ? null : 20, target: prior?.r ? Number(prior.r) + 1 : null, currentScore: { runs: current.r || 0, wickets: current.w || 0, overs: current.o || 0 }, rawScorecard: scorecard?.data || null };
}
export default async function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });
  const key = process.env.CRICKET_DATA_API_KEY;
  if (!key) return response.status(500).json({ error: "CRICKET_DATA_API_KEY is not configured" });
  try {
    const matches = await cricketData("/currentMatches?offset=0", key);
    const matchId = Array.isArray(request.query.matchId) ? request.query.matchId[0] : request.query.matchId;
    const match = matchId ? matches.data.find((item) => item.id === matchId) : matches.data.find((item) => item.matchStarted && !item.matchEnded) || matches.data[0];
    if (!match) return response.status(404).json({ error: "No current matches were returned by CricketData" });
    let scorecard = null; try { scorecard = await cricketData(`/match_scorecard?id=${encodeURIComponent(match.id)}`, key); } catch { /* scorecards are not always available */ }
    response.setHeader("Cache-Control", "s-maxage=15, stale-while-revalidate=30");
    return response.status(200).json({ match: normalise(match, scorecard), availableMatches: matches.data.slice(0, 10).map(({ id, name, status }) => ({ id, name, status })) });
  } catch (error) { return response.status(502).json({ error: "Unable to fetch live match data", detail: error.message }); }
}

