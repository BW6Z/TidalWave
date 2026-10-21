/* Illustrative educational model. Scores are normalized indices, not forecasts. */
(function (root) {
  const policies = [
    { id: 'fishing', icon: '♧', name: 'Let the fish recover', subtitle: 'Limit fishing', description: 'Smaller catches today. More life beneath the surface tomorrow.', gain: '↑ Fish recovery', cost: '↓ Short-term fishing income', effects: [14, 0, -9, -3] },
    { id: 'pollution', icon: '≋', name: 'Turn the tide on waste', subtitle: 'Reduce pollution', description: 'Invest in clean water for the reef and everyone on shore.', gain: '↑ Water quality & wellbeing', cost: '↓ Income while funding cleanup', effects: [2, 18, -8, 5] },
    { id: 'reserve', icon: '⚑', name: 'Give nature a refuge', subtitle: 'Create a marine reserve', description: 'Protect a patch of habitat. Let its benefits grow over time.', gain: '↑ Lasting habitat protection', cost: '↓ Income & access this year', effects: [5, 3, -10, -3] },
    { id: 'restore', icon: '♧', name: 'Bring the shore back', subtitle: 'Restore coastal habitat', description: 'Replant trees, restore reef habitat and remove coastal litter.', gain: '↑ Trees, coral & coastal resilience', cost: '↓ Restoration funding this year', effects: [5, 5, -8, 4] },
    { id: 'trawling', risk: true, icon: '⚓', name: 'Bigger nets. Bigger catches.', subtitle: 'Expand industrial fishing', description: 'Add trawlers for fast income. Heavy nets damage the reef and deplete fish.', gain: '↑ Immediate fishing revenue', cost: '↓ Fish & coral · more boats persist', effects: [-19, -5, 15, -2] },
    { id: 'dumping', risk: true, icon: '▨', name: 'Let the waste flow', subtitle: 'Allow untreated discharge', description: 'Cut treatment costs. Waste clouds the water and accumulates along the coast.', gain: '↑ Short-term business savings', cost: '↓ Water & health · litter accumulates', effects: [-9, -21, 12, -10] },
    { id: 'development', risk: true, icon: '▥', name: 'Build along the bay', subtitle: 'Unregulated coastal expansion', description: 'Clear woodland for waterfront housing. Construction brings jobs and runoff.', gain: '↑ Jobs & housing this year', cost: '↓ Trees & reef · lasting runoff', effects: [-7, -10, 14, 3] },
    { id: 'nothing', icon: '☼', name: 'Stay the course', subtitle: 'Take no action', description: 'Keep the boats moving. Leave the ocean to face the pressure.', gain: '↑ Immediate earnings', cost: '↓ Fish stocks & clean water', effects: [-5, -4, 6, 1] }
  ];
  const initial = () => ({ year: 0, fish: 55, water: 62, economy: 64, community: 60, reserves: 0, coral: 72, trees: 78, litter: 18, buildings: 3, fleet: 2 });
  const clamp = (n, max = 100) => Math.round(Math.max(0, Math.min(max, n)));
  const keys = ['fish', 'water', 'economy', 'community'];
  function step(state, id) {
    const policy = policies.find(p => p.id === id);
    if (!policy) throw new Error('Unknown policy');
    if (state.year >= 8) throw new Error('The scenario is complete');
    // Existing reserves support recovery; new reserves start paying back next year.
    const drift = [ -5 + (state.water - 50) * .10 + state.reserves * 2.5 - Math.max(0, state.fleet - 2) * .8,
      -5 + state.reserves * .8 - Math.max(0, state.buildings - 3) * .45,
      (state.fish - 45) * .14 + (state.water - 50) * .06 + state.reserves * 1.2,
      (state.economy - 55) * .12 + (state.water - 50) * .09 - 1 ];
    const next = { ...state, year: state.year + 1, reserves: Math.min(3, state.reserves + (id === 'reserve' ? 1 : 0)) };
    keys.forEach((key, i) => next[key] = Math.round(Math.max(0, Math.min(100, state[key] + drift[i] + policy.effects[i]))));
    next.fleet = Math.max(1, Math.min(10, state.fleet + (id === 'trawling' ? 2 : id === 'fishing' ? -1 : 0)));
    next.buildings = Math.min(11, state.buildings + (id === 'development' ? 2 : 0));
    next.trees = clamp(state.trees + (id === 'restore' ? 18 : id === 'development' ? -22 : next.water < 30 ? -4 : 0));
    next.litter = clamp(state.litter + 4 + Math.max(0, state.buildings - 3) + (id === 'dumping' ? 25 : id === 'pollution' ? -32 : id === 'restore' ? -15 : id === 'development' ? 9 : 0));
    // Coral recovery is slower than damage; the score is a visual stress proxy.
    next.coral = clamp(state.coral + (next.water - 60) * .16 + state.reserves * 1.2 + (id === 'restore' ? 9 : id === 'trawling' ? -20 : id === 'development' ? -9 : 0));
    return next;
  }
  const api = { policies, initial, keys, step };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TidalSimulation = api;
})(typeof window !== 'undefined' ? window : globalThis);
