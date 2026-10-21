/* Illustrative educational model. Scores are normalized indices, not forecasts. */
(function (root) {
  const policies = [
    { id: 'fishing', icon: '♧', name: 'Let the fish recover', subtitle: 'Limit fishing', description: 'Smaller catches today. More life beneath the surface tomorrow.', gain: '↑ Fish recovery', cost: '↓ Short-term fishing income', effects: [14, 0, -9, -3] },
    { id: 'pollution', icon: '≋', name: 'Turn the tide on waste', subtitle: 'Reduce pollution', description: 'Invest in clean water for the reef and everyone on shore.', gain: '↑ Water quality & wellbeing', cost: '↓ Income while funding cleanup', effects: [2, 18, -8, 5] },
    { id: 'reserve', icon: '⚑', name: 'Give nature a refuge', subtitle: 'Create a marine reserve', description: 'Protect a patch of habitat. Let its benefits grow over time.', gain: '↑ Lasting habitat protection', cost: '↓ Income & access this year', effects: [5, 3, -10, -3] },
    { id: 'nothing', icon: '☼', name: 'Stay the course', subtitle: 'Take no action', description: 'Keep the boats moving. Leave the ocean to face the pressure.', gain: '↑ Immediate earnings', cost: '↓ Fish stocks & clean water', effects: [-5, -4, 6, 1] }
  ];
  const initial = () => ({ year: 0, fish: 55, water: 62, economy: 64, community: 60, reserves: 0 });
  const keys = ['fish', 'water', 'economy', 'community'];
  function step(state, id) {
    const policy = policies.find(p => p.id === id);
    if (!policy) throw new Error('Unknown policy');
    if (state.year >= 8) throw new Error('The scenario is complete');
    // Existing reserves support recovery; new reserves start paying back next year.
    const drift = [ -5 + (state.water - 50) * .10 + state.reserves * 2.5,
      -5 + state.reserves * .8,
      (state.fish - 45) * .14 + (state.water - 50) * .06 + state.reserves * 1.2,
      (state.economy - 55) * .12 + (state.water - 50) * .09 - 1 ];
    const next = { ...state, year: state.year + 1, reserves: Math.min(3, state.reserves + (id === 'reserve' ? 1 : 0)) };
    keys.forEach((key, i) => next[key] = Math.round(Math.max(0, Math.min(100, state[key] + drift[i] + policy.effects[i]))));
    return next;
  }
  const api = { policies, initial, keys, step };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TidalSimulation = api;
})(typeof window !== 'undefined' ? window : globalThis);
