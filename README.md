# seedling-wasm

SWFRecomp-recompiled [Seedling](https://github.com/ConnorUllmann/Seedling) builds,
consumed by [Archipelago-CC](https://github.com/PeerInfinity/Archipelago-CC) as a
git submodule mounted at `frontend/modules/flashPanel/wasm/`.

Each directory is a **self-contained game page**: an ActionScript 3 SWF put
through [SWFRecomp](https://github.com/PeerInfinity/SWFRecomp-CC) into
WebAssembly, wrapped in a page that installs the `__swfBridge` host surface a
same-origin iframe can drive. Load `<build>/game.html`; nothing else is needed.

```
<build>/
  game.html            the iframe surface — names its own js in a <script src>
  swf_bridge_avm2.js   the AVM2 ExternalInterface shim (installs __swfBridge)
  <name>.js            emscripten glue (~100-146 KB)
  <name>.wasm          the recompiled game (~31-34 MB)
```

⛔ **`<name>` is not always the directory name.** Both builds pinned here
happen to agree today, so the rule needs its evidence stated rather than
demonstrated: `seedling_bot_ap_phase3/`, pinned until 2026-08-19, carried
`seedling_bot_ap.{js,wasm}` — the directory had been renamed and the build had
not. `builds.json`'s `js` / `wasm` fields are the authority, and `game.html`'s
own `<script src>` is where they come from. Anything that resolves a payload
filename from the directory name is wrong for such a build — and so is
anything that assumes the directory name, which is the OTHER half and cost the
consuming repo a silently-skipping check row.

The page needs **WebGPU**. It comes up headless on
`--enable-unsafe-webgpu --ignore-gpu-blocklist --enable-unsafe-swiftshader
--use-angle=swiftshader`, at software-rendering speed. There is no
`SharedArrayBuffer` and no pthread use (measured: 0 occurrences in the glue),
so a host does **not** need COOP/COEP headers — plain GitHub Pages serves it.

## Who uses these builds, and where they are live

Each pinned build is served from the consuming repo's GitHub Pages site, at
`https://peerinfinity.github.io/Archipelago-CC/modules/flashPanel/wasm/<build>/game.html`.
These are the pages a person can open and watch the recompiled game run:

⛓ **THREE BUILDS ARE PINNED (2026-08-28, EDITOR INTEGRATION slice M1), and only
one of them is a DEFAULT.** `seedling_bot_ap_p4c` is THE bot build — every `SEEDLING_PAGE`
default, `WASM_PAGE`, the three presets' `flash_panel.wasm` and both tests that
assert the name spell it. `seedling_bot_ap_p4b` is its predecessor and is
pinned ONLY because tracked prose in the consuming repo still names it: two
lines of `docs/json/developer/procgen/seedling-bot.md` say which build a
measurement RAN AGAINST, and rewriting those would make the doc lie about its
own history. ⚠ That is a real pin with a real cost (~34 MB) and it is meant to
be TEMPORARY: the fifth-run slice (12h) retires p4b at its close, at which
point those two doc lines become historical statements about a build that is no
longer on disk here — which is what the whitelist is for.

⛓ **`seedling_bot_ap_p4d` (2026-08-28) is the newcomer and is NOT a default.**
It is the first build carrying anything the host reads beyond the vanilla item
flags: `Pickups/APItem.as` (Archipelago's placement pickup, which grants
NOTHING), `Game.pendingExit`/`pendingCheck` and the `keyMask`/`totemCount`
getters. Exactly ONE tracked file names it — the M1 rows of
`scripts/procgen/verify-seedling-ap-placement.mjs`, which SKIP by name without
the artifact — and that reference is written as a whole literal path on purpose:
⚠ a name in its own `const` with the path assembled by `join(REPO, 'frontend',
'modules', …)` matches **none** of `check-seedling-wasm-pins.mjs`'s four
spellings, which was measured here, and an unreferenced build is one the gate
clears for retirement while an instrument still loads it. Whether p4d also
becomes the default is a separate decision that moves **53 tracked files / 69
lines**.

| build | live | in the consuming repo |
|---|---|---|
| `seedling_bot_ap_p4d` | not wired into any page yet — reachable as `SEEDLING_PAGE=seedling_bot_ap_p4d` and by the M1 rows that name it | `scripts/procgen/verify-seedling-ap-placement.mjs` (the M1 rows: the `APItem` draws, its `@look` picks the sprite, `pendingCheck` reports the collection, `pendingExit` reports the door before the level moves). **1 tracked file spells it**, deliberately: a non-default build should be reachable and pinned, not woven in |
| `seedling_bot_ap_p4c` | the same three pages as the row below — it replaced `p4b` as the default everywhere on 2026-08-26 | `seedlingDemo/watchWasm.js` (`WASM_PAGE`) and `watchEditor.js`, the three seedling presets' `flash_panel.wasm`, `procgenPipeline/regionAtlasCompiler.js` (+ its test), `watchWasm.test.js` (asserts the exact page string), `verify-seedling-{wasm-bridge,atlas-play,bot-differential}.mjs`, `check-seedling-{generated-set,save-stamp,vanilla-manifest,wasm-pages,wasm-ship}.mjs`, and ~40 other `scripts/procgen/{probe,plan,solve,run,derive,rerecord}-seedling-*.mjs`. **53 tracked files spell it**, which is the whole story of why a default flip is a derived list and never a typed one |
| `seedling_bot_ap_p4b` | [watch.html, a committed tape on the wasm side](https://peerinfinity.github.io/Archipelago-CC/modules/seedlingDemo/watch.html?tape=frontend/modules/seedlingDemo/fixtures/tapes/pit-fall-chain-85.json&side=wasm) — press ▶ Start inside the frame; pick any of the 153 tapes from the roster.  ⛓ And [**▶ load in wasm**](https://peerinfinity.github.io/Archipelago-CC/modules/seedlingDemo/watch.html?source=generate&seed=1&biome=pre-sword&count=4&tries=8&k=3&anchortries=1&run=1): generate a room in the page, press the button, then press ▶ Start — the generated room mounts as a one-room LEVEL SET and its certification solve replays into it.  ⛓ And [the app itself, flash panel, Seedling seed 1](https://peerinfinity.github.io/Archipelago-CC/index.html?mode=flash&game=seedling&seed=1&focusPanel=flashPanel) — the Archipelago panel drives the game over `__swfBridge` | ⛔ **NOTHING NAMES IT AS A DEFAULT ANY MORE.** Its only tracked references are two prose lines of `docs/json/developer/procgen/seedling-bot.md` recording which build §43's and §45's measurements ran against. It held every default listed in the row above until 2026-08-26 |

The [procgen demo catalogue](https://peerinfinity.github.io/Archipelago-CC/modules/procgenDocs/demos.html)
links further watch.html URLs; they run the JS engine rather than the wasm, so
they exercise the same tapes without loading 33 MB.

⚠ **Every live page here needs WebGPU and a real user gesture.** The ▶ Start button
inside the frame has to be clicked by a person (or by a browser automation
tool, whose click is a real input event) — the renderer and the audio context
consume the activation, and the host page deliberately refuses to press it.

⛓ **The pin set was four builds on the morning of 2026-08-19 and is ONE.**
`seedling_bot_ap`, `seedling_bot_ap_phase3` and `seedling_teleport_ap` all
retired on MEASUREMENT rather than on tidiness, and each was earned by the gate
that had pinned it — see their commits. All three are still on developers'
disks, untracked under the whitelist, reachable as `SEEDLING_PAGE=<name>`.

⛓⛓ `seedling_teleport_ap` was the variant that skips the preloader and the
title screen, and the flash panel loaded it because that is what was on hand
when the panel was written. `verify-seedling-wasm-bridge.mjs` — the row that
pinned it — reads **ALL PASS 12/12** with the presets, `regionAtlasCompiler`
and both verify rows pointed at `seedling_bot_ap_p4b`, **including the arm the
variant is named for** (*"teleport new_instance applied by BridgeGeneric"*).
The different boot path costs nothing: the panel already waits for the user's
▶ Start and for the bridge handshake to reach `ready` before it configures
anything, so a build that shows a title screen first arrives at the same place
a little later. ⇒ **63 MB of checkout became 33 MB.**

## Why this is a repository

The builds are ~33 MB of binary each and were previously copied by hand into a
gitignored directory. That worked for a developer with the artifacts on disk
and failed for everyone else: Archipelago-CC's GitHub Pages site could not
serve the game at all, and its `watch.html` printed *"…/game.html is missing"*
to every visitor. A submodule at exactly the path the loaders already use
fixes that with **zero code change** — `actions/checkout` with
`submodules: recursive` (which that repo's workflows already pass) puts the
files where every existing path expects them.

## The pin policy

> **A build lives here iff a tracked file of Archipelago-CC names it.**

That is the whole rule, and it is enforced four ways at once:

| Where | What it says |
|---|---|
| `.gitignore` | a **whitelist** — `/*` then one `!/<name>/` line per pinned build |
| `builds.json` | one manifest entry per pinned build, with md5s and *who names it* |
| Archipelago-CC's `scripts/procgen/check-seedling-wasm-pins.mjs` | reds unless the tracked-reference set, the whitelist, `git ls-tree` here, and `builds.json` all agree |

A reference is a reference however it is spelled, and that has now been the
finding three separate times. The gate enumerates **four** spellings, over a
text in which adjacent string literals have been joined first, because every
one of those forms occurs in the consuming tree:

1. the literal `wasm/<name>` path — including `../flashPanel/wasm/<name>/…`
   and a full `http://localhost:8000/…` URL, none of which the first version
   of this scan could see, because it excluded a leading `/`;
2. a preset's `"wasm": "<name>/game.html"`;
3. a script's `process.env.SEEDLING_PAGE || '<name>'` **default** — the
   default is the pin, the environment variable is just an override;
4. a bare `PAGE_NAME = '<name>'` constant.

An env EXAMPLE in a docblock is deliberately *not* a pin — that is the rule
keeping the historical builds out — so spelling 4 is scoped to `PAGE_NAME`
rather than matching any quoted name. `check-seedling-wasm-pins.mjs
--self-test` gates all of this with one seen/not-seen case per spelling.

The whitelist exists because the working copy is not the repository. Builds
nobody pins any more stay on a developer's disk in this same directory and stay
reachable as `SEEDLING_PAGE=<name>`; they are simply invisible to git. A
blocklist could not promise that — a new historical build would silently
become trackable.

### Adding a build

1. Copy the four files in (`game.html`, `swf_bridge_avm2.js`, and the `.js` /
   `.wasm` that `game.html` names — **not** `test.swf`, `test_info.json`,
   `.demo_type` or `index.html`; nothing loads them, and `index.html` is a
   redirect to an SWFRecomp-CC path that does not exist in the consuming tree).
2. Add `!/<name>/` to `.gitignore`.
3. Add the `builds.json` entry — `js`, `wasm`, the md5s, `bytes`, `builtFrom`,
   and `namedBy` (the outer paths that pin it).
4. Commit and push here, then bump the submodule pointer in Archipelago-CC in
   its own commit.

### Retiring a build

Delete the whitelist line and the manifest entry — and only once **nothing
tracked in Archipelago-CC names it any more**, because the gate checks that
direction too. The directory may stay on disk; git will ignore it.

## History size

Every commit that changes a `.wasm` adds ~33 MB to this repository forever;
nothing rewrites history today. If it grows uncomfortable, the stated remedy is
to shed it deliberately — commit the current tree as an orphan commit and
force-push, keeping the working files and dropping the old bytes. That is a
policy, not something already done: the full history is intact.

## Licence

**The Unlicense** — public domain. Upstream
[ConnorUllmann/Seedling](https://github.com/ConnorUllmann/Seedling) and the
[PeerInfinity/Seedling](https://github.com/PeerInfinity/Seedling) fork are both
Unlicense, which grants the right to distribute the work "either in source code
form or **as a compiled binary** … for any purpose". These builds are compiled
binaries of that source, so redistributing them here is clean. See `LICENSE`.
