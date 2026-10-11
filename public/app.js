const state = { score: 118, wickets: 4, balls: 86, momentum: 42, boundaryDrought: 24, lastOver: ['1','•','1','1','•','2'] };

const el = (id) => document.getElementById(id);
const answers = {
  struggling: "Chennai still have six wickets, but the chase is becoming difficult because the required rate has climbed to 11.12 while they have found only one boundary in their last 24 balls. Wickets help only if the incoming batters can convert them into attacking shots; right now Mumbai are winning the dot-ball battle.",
  wicket: "That wicket mattered because Conway was Chennai's only established top-order batter. It broke momentum just as the required rate crossed 10, and leaves Jadeja and Dube needing to build a new partnership while scoring at more than 11 an over.",
  next: "The priority is to bring the required rate below 10 before the 17th over. Chennai should target Mumbai's least economical bowler, take low-risk singles early in the over, and make sure Jadeja faces the final balls to look for one boundary per over.",
  outperforming: "Ravindra Jadeja is performing above expectation: his strike rate is 129, around 22% higher than his typical chase rate. But he cannot carry the chase alone—Dube needs to turn more of his starts into boundaries.",
  fallback: "MatchMind sees Mumbai ahead because the required rate is 11.12, Chennai have scored only one boundary in the last 24 balls, and two wickets fell in the previous three overs. The next two overs are the key window to reset the chase."
};

function getAnswer(question) {
  const q = question.toLowerCase();
  if (q.includes('wicket') || q.includes('conway') || q.includes('moment')) return answers.wicket;
  if (q.includes('what should') || q.includes('next') || q.includes('do now')) return answers.next;
  if (q.includes('who') || q.includes('outperform') || q.includes('player')) return answers.outperforming;
  if (q.includes('struggling') || q.includes('wickets in hand') || q.includes('why')) return answers.struggling;
  return answers.fallback;
}

function answer(question) {
  const output = el('chat-answer');
  output.querySelector('p').textContent = getAnswer(question);
  output.classList.add('show');
  output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

document.querySelectorAll('.prompt-button').forEach(button => button.addEventListener('click', () => answer(button.dataset.question || 'Why did that wicket change the match?')));
el('chat-form').addEventListener('submit', event => { event.preventDefault(); const input = el('question'); if (input.value.trim()) { answer(input.value); input.value = ''; } });

el('next-ball').addEventListener('click', () => {
  const outcomes = [{run:0,label:'•',note:'Dot ball — Mumbai keep the pressure on.'},{run:1,label:'1',note:'A single keeps the strike rotating.'},{run:2,label:'2',note:'Jadeja finds two and eases pressure.'},{run:4,label:'4',note:'FOUR — a much-needed boundary for Chennai.'}];
  const ball = outcomes[Math.floor(Math.random() * outcomes.length)];
  state.balls += 1; state.score += ball.run; state.boundaryDrought = ball.run === 4 ? 0 : state.boundaryDrought + 1;
  const over = Math.floor(state.balls / 6) + '.' + (state.balls % 6);
  const required = 181 - state.score; const remaining = 120 - state.balls; const rrr = (required / remaining * 6).toFixed(2);
  state.lastOver.push(ball.label); if (state.lastOver.length > 6) state.lastOver.shift();
  el('score').textContent = `${state.score}/${state.wickets}`; el('overs').textContent = `${over} ov`;
  el('ball-strip').innerHTML = state.lastOver.map(x => `<b>${x}</b>`).join('');
  const timeline = el('timeline'); timeline.insertAdjacentHTML('afterbegin', `<div class="event ${ball.run === 4 ? 'positive' : 'neutral'}"><time>${over}</time><div><strong>${ball.run === 4 ? 'BOUNDARY' : 'LIVE UPDATE'}</strong><p>${ball.note}</p></div></div>`);
  if (ball.run === 4) { state.momentum = Math.max(18, state.momentum - 8); }
  const percent = Math.min(78, 50 + state.momentum / 2); el('meter-fill').style.width = percent + '%'; el('momentum-score').textContent = `MI +${state.momentum}`;
  el('momentum-copy').textContent = ball.run === 4 ? `That boundary helps, but Chennai still need ${required} from ${remaining} balls at ${rrr} an over.` : `Mumbai keep control: Chennai now need ${required} from ${remaining} balls at ${rrr} an over.`;
});

el('theme-toggle').addEventListener('click', () => document.body.classList.toggle('night'));



// Live data connection: browser calls only our own secure Vercel endpoints.
let liveMatch = null;
async function refreshLiveMatch() {
  try {
    const result = await fetch('/api/match');
    if (!result.ok) throw new Error('Live data is temporarily unavailable');
    const { match } = await result.json();
    liveMatch = match;
    const teams = match.teams || [];
    if (teams[0]) el('batting-team').textContent = teams[0];
    if (teams[1]) el('bowling-team').textContent = teams[1];
    el('score').textContent = match.currentScore ? `${match.currentScore.runs}/${match.currentScore.wickets}` : '—';
    el('overs').textContent = match.currentScore ? `${match.currentScore.overs} ov` : '';
    el('target-line').textContent = match.target ? `Target ${match.target}` : (match.matchType || 'LIVE').toUpperCase();
    el('match-status').innerHTML = '<span class="red-dot"></span>' + (match.status || 'Live score updated');
    document.querySelector('.competition').textContent = match.name || 'LIVE CRICKET';
  } catch (error) {
    console.info('MatchMind live feed:', error.message);
  }
}
async function answer(question) {
  const output = el('chat-answer');
  output.querySelector('p').textContent = liveMatch ? 'MatchMind is analysing the live match…' : getAnswer(question);
  output.classList.add('show');
  if (!liveMatch) return;
  try {
    const result = await fetch('/api/insight', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, match: liveMatch }) });
    const payload = await result.json();
    if (!result.ok) throw new Error(payload.error || 'Unable to generate an insight');
    output.querySelector('p').textContent = payload.answer;
  } catch (error) {
    output.querySelector('p').textContent = 'Live match data is available, but the AI explanation is temporarily unavailable. ' + getAnswer(question);
  }
}
const previousButton = el('next-ball');
if (previousButton) {
  const refreshButton = previousButton.cloneNode(true);
  refreshButton.id = 'next-ball';
  refreshButton.innerHTML = 'Refresh live data <span>↻</span>';
  previousButton.replaceWith(refreshButton);
  refreshButton.addEventListener('click', refreshLiveMatch);
}
refreshLiveMatch();
setInterval(refreshLiveMatch, 30000);
