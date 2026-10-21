# Tidal Wave

**A small ocean. A lasting impact.**

Tidal Wave is a playable 2D pixel-art browser demo about ocean stewardship, inspired by **SDG 14: Life Below Water**. Players guide the fictional coastal community of Bluehaven through eight years of policy choices, balancing marine ecosystems, local livelihoods, and community wellbeing.

Designed for a short project presentation or a classroom discussion at schools, universities, museums, aquariums, and environmental education organizations.

## Run locally

Requires Node.js 18 or newer. No package installation is necessary.

```sh
git clone https://github.com/BW6Z/TidalWave.git
cd TidalWave
npm start
```

Open http://127.0.0.1:5173 in a browser. You can also open `index.html` directly: the game uses plain scripts, no backend, and no fetched game assets. Optional Google Fonts require an internet connection; local fallback fonts keep the game usable offline.

```sh
npm test   # Model invariants and 4,096 deterministic sampled eight-year paths
npm run build   # Copies the five static application files to dist/
```

Deploy the contents of `dist/` to any static website host. No API keys, database, or environment variables are required. `PORT` optionally changes the local server port.

## How to play

1. Choose one policy card.
2. Click **Let a year unfold**.
3. Read the coastal update and observe the four indicators and animated ocean.
4. Repeat for eight years, then compare your coast with a no-action baseline.
5. Replay to explore a different balance.

| Decision | Immediate trade-off | Longer-term effect |
| --- | --- | --- |
| Limit fishing | Reduced income and access | Fish recovery |
| Reduce pollution | Cleanup costs | Cleaner water supports fish and wellbeing |
| Create a marine reserve | Establishment costs and reduced access | Persistent recovery benefits starting the following year |
| Take no action | Immediate earnings | Continued fishing and pollution pressure |

The original Canvas scene includes a coastal village, fishing boats, moving fish, kelp, coral, floating debris, and reserve markers. Fish abundance, coral color, water tint, and debris reflect the simulation. The interface supports keyboard-operated controls, a native help dialog, responsive layouts, and an animation pause button. Reduced-motion preferences pause the scene initially.

## Model and limitations

This is a **simplified, deterministic educational model**, not a scientifically validated forecast or policy recommendation. All four indicators are illustrative integer indices from 0 to 100. They are not fish counts, currency, or measured water chemistry. There is no random event system.

Starting scores: fish 55, water 62, economy 64, community 60. Each year combines ongoing pressure, interactions calculated from the previous year's scores, and the selected policy's effect. Scores are rounded and clamped to 0–100. See `simulation.js` for the complete formulas and policy coefficients.

Fish recovery depends on water quality and existing reserves. Economic outcomes depend on fish stocks, water quality, and reserves. Community outcomes depend on economic conditions and water quality. Reserves persist, begin producing benefits the following year, and cap at three; choosing that policy again maintains habitat with the same annual policy costs and direct benefits. Other policies apply only during the selected year. No-action comparison uses the same initial conditions and rules.

The final narrative recognizes a balanced coast when all indicators reach at least 45, ecological recovery when fish and water both reach 60, and severe environmental stress when fish or water fall below 30. These thresholds are teaching devices. Different decisions can produce visible trade-offs, and protecting the environment alone does not guarantee healthy livelihoods.

Before use as a substantive educational simulation, marine scientists and educators should review the model and calibrate its assumptions. Real ecosystems have regional variation, uncertainty, species interactions, enforcement constraints, and much longer recovery periods.

## Project structure

```text
index.html                 Accessible game interface and instructions
style.css                  Responsive coastal visual design
app.js                     Interaction and outcomes
scene.js                   Detailed 960 x 540 original pixel artwork
simulation.js              Pure state transition model
scripts/serve.cjs           Dependency-free local HTTP server
scripts/build.cjs           Static distribution builder
tests/simulation.test.cjs   Model regression and bounds checks
```

## Product concept

Potential future offerings include institutional licenses, subscriptions, and customized educational scenarios. Possible channels include schools, universities, museums, aquariums, and environmental organizations. These are product ideas only; this demo does not implement payments, accounts, analytics, or subscriptions.

Scope is intentionally small: eight decisions, four headline indicators and five scene indicators, one fictional island, and an eight-year session. Future work could include expert-reviewed scenarios, teacher discussion guides, regional ecosystems, and saved comparisons.

## Artwork and attribution

All pixel scenery is drawn programmatically for this project. The visual direction draws on cozy pixel-art fishing games; no Cast n Chill artwork, music, or other game assets are used. Fonts: DM Sans and Space Grotesk via Google Fonts, with system fallbacks. SDG 14 is referenced as an educational theme; this project does not imply United Nations endorsement.

## Visible consequences update

Eight policies now include **industrial fishing**, **untreated discharge**, and **unregulated coastal expansion**, alongside **coastal habitat restoration** and the original four choices. Cards show next-year headline score changes before confirmation. Coastal updates report actual changes in coral, woodland, litter, buildings, and boats.

The 960 × 540 scene adds tiled roofs, window lights, woodland layers, tree stumps, sailboats and industrial trawlers with nets, branching and plate coral, shells, seafloor textures, light shafts, fish stripes, and a turtle that returns when coral and water recover.

| Scene indicator | What changes | Persistent consequence |
| --- | --- | --- |
| Coral health | Colorful colonies fade to pale skeletons and broken branches | Damage accumulates; restoration and reserves help gradual recovery |
| Water quality | Blue-green water becomes murky, with an outfall plume, particles and algae | Development adds runoff pressure |
| Litter load | Bottles, bags and cans accumulate at the surface and seabed | Cleanup removes litter; development increases ongoing waste |
| Tree cover | Woodland disappears into stumps and bare branches | Restoration replants the shore |
| Buildings | Waterfront homes increase from 3 to at most 11 | Buildings remain even after a policy change |
| Fishing fleet | Boats increase from 2 to at most 10, with industrial nets | Fleet pressure persists; fishing limits reduce it to a minimum of 1 |

Housing and boats represent physical development, not overall wellbeing. Short-term revenue can coexist with environmental damage; later income depends on fish and water. Coral health is an illustrative combined stress proxy: pale coral is used as visual shorthand for stress, not a scientific claim that pollution is the only cause of real coral bleaching. Recovery rates and all coefficients remain fictional teaching assumptions.

Verification includes harmful-policy trade-offs, persistent fleet/runoff pressure, cleanup and restoration, score bounds across 4,096 seeded eight-year paths, and browser checks for harmful and restorative runs, replay, pause, and mobile layout.
