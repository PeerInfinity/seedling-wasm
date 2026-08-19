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

⛔ **`<name>` is not always the directory name.** `seedling_bot_ap_phase3/`
carries `seedling_bot_ap.{js,wasm}` — the directory was renamed, the build was
not. `builds.json`'s `js` / `wasm` fields are the authority, and `game.html`'s
own `<script src>` is where they come from. Anything that resolves a payload
filename from the directory name is wrong for that build.

The page needs **WebGPU**. It comes up headless on
`--enable-unsafe-webgpu --ignore-gpu-blocklist --enable-unsafe-swiftshader
--use-angle=swiftshader`, at software-rendering speed. There is no
`SharedArrayBuffer` and no pthread use (measured: 0 occurrences in the glue),
so a host does **not** need COOP/COEP headers — plain GitHub Pages serves it.

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

That is the whole rule, and it is enforced three ways at once:

| Where | What it says |
|---|---|
| `.gitignore` | a **whitelist** — `/*` then one `!/<name>/` line per pinned build |
| `builds.json` | one manifest entry per pinned build, with md5s and *who names it* |
| Archipelago-CC's `scripts/procgen/check-seedling-wasm-pins.mjs` | reds unless the tracked-reference set, the whitelist, `git ls-tree` here, and `builds.json` all agree |

A reference is a reference however it is spelled. That gate enumerates three
spellings, because all three occur in the consuming tree: the literal
`wasm/<name>` path, a preset's `"wasm": "<name>/game.html"`, and a script's
`const PAGE_NAME = process.env.SEEDLING_PAGE || '<name>'` **default** (the
default is the pin — the environment variable is just an override).

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
