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

Both pinned builds are served from the consuming repo's GitHub Pages site, at
`https://peerinfinity.github.io/Archipelago-CC/modules/flashPanel/wasm/<build>/game.html`.
These are the pages a person can open and watch the recompiled game run:

| build | live | in the consuming repo |
|---|---|---|
| `seedling_bot_ap_p4b` | [watch.html, a committed tape on the wasm side](https://peerinfinity.github.io/Archipelago-CC/modules/seedlingDemo/watch.html?tape=frontend/modules/seedlingDemo/fixtures/tapes/pit-fall-chain-85.json&side=wasm) — press ▶ Start inside the frame; pick any of the 153 tapes from the roster | `seedlingDemo/watchViewer.js` (`WASM_PAGE`), and the `SEEDLING_PAGE` default of `verify-seedling-bot-differential.mjs`, `check-seedling-{generated-set,save-stamp,vanilla-manifest,wasm-pages}.mjs`, `probe-seedling-level-set-transport.mjs` and ~28 other `scripts/procgen/{probe,plan,solve,run}-seedling-*.mjs` |
| `seedling_teleport_ap` | [the app itself, flash panel, Seedling seed 1](https://peerinfinity.github.io/Archipelago-CC/index.html?mode=flash&game=seedling&seed=1) — the Archipelago panel drives the game over `__swfBridge` | the three seedling presets' `flash_panel.wasm`, `procgenPipeline/regionAtlasCompiler.js` (+ its test), `verify-seedling-wasm-bridge.mjs`, `verify-seedling-atlas-play.mjs` |

The [procgen demo catalogue](https://peerinfinity.github.io/Archipelago-CC/modules/procgenDocs/demos.html)
links further watch.html URLs; they run the JS engine rather than the wasm, so
they exercise the same tapes without loading 33 MB.

⚠ **Both live pages need WebGPU and a real user gesture.** The ▶ Start button
inside the frame has to be clicked by a person (or by a browser automation
tool, whose click is a real input event) — the renderer and the audio context
consume the activation, and the host page deliberately refuses to press it.

⛓ **The pin set was four builds until 2026-08-19 and is two.**
`seedling_bot_ap` and `seedling_bot_ap_phase3` retired on measurement, not on
tidiness — see their commits. Both are still on developers' disks, untracked
under the whitelist, reachable as `SEEDLING_PAGE=<name>`.

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
