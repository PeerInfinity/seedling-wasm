# seedling-wasm

[Seedling](https://github.com/ConnorUllmann/Seedling) recompiled to WebAssembly with
[SWFRecomp](https://github.com/PeerInfinity/SWFRecomp-CC). Each BUILD directory is a
self-contained game page — load `<build>/game.html` and nothing else is needed.
[Archipelago-CC](https://github.com/PeerInfinity/Archipelago-CC) consumes this repository
as a git submodule at `frontend/modules/flashPanel/wasm/`.

## Play

▶ **[PLAY SEEDLING — the original game](https://peerinfinity.github.io/seedling-wasm/seedling_original/game.html)**

That build is the game as published, recompiled from the pre-fork ActionScript: no bridge,
no bot, no Archipelago. Open it, press ▶ Start, and play with the arrow keys. The others
carry the fork's bot and Archipelago code and are here to be driven, not played — they are
listed because a build nobody can open is a build nobody can check.

<!-- GENERATED:seedling-wasm-builds BEGIN — by scripts/procgen/seedling-wasm-readme.mjs; do not edit; regenerate -->

| build | what it is | play | role | AS3 source | SWFRecomp-CC |
|---|---|---|---|---|---|
| `seedling_original` | the ORIGINAL game — no bridge, no bot, no Archipelago | [▶ play](https://peerinfinity.github.io/seedling-wasm/seedling_original/game.html) | `demo` | [`main@826ba77`](https://github.com/PeerInfinity/Seedling/commit/826ba77d67a4e6cc826204faa8948ecfaa1c00fa) | [`254145a`](https://github.com/PeerInfinity/SWFRecomp-CC/commit/254145a5b61728677da2f19d196541043d98e1e5) |
| `seedling_bot_ap_p4d` | the current bot build — the arm-time fix plus Archipelago’s `APItem` | [▶ play](https://peerinfinity.github.io/seedling-wasm/seedling_bot_ap_p4d/game.html) | `default` | [`ap-m1@a0ec864`](https://github.com/PeerInfinity/Seedling/commit/a0ec86421faa6c2d340135124104c09c473df280) | [`254145a`](https://github.com/PeerInfinity/SWFRecomp-CC/commit/254145a5b61728677da2f19d196541043d98e1e5) |
| `seedling_bot_ap_p4c` | the bot build BEFORE `APItem` — declares `arm`, no `apitem` | [▶ play](https://peerinfinity.github.io/seedling-wasm/seedling_bot_ap_p4c/game.html) | `apitem-control` | [`bot@d4f1f37`](https://github.com/PeerInfinity/Seedling/commit/d4f1f379515a5699aa1219622b6a0cf261943a78) | [`06f3d87`](https://github.com/PeerInfinity/SWFRecomp-CC/commit/06f3d87d295b03b44b94221d38594612ecda4ff5) |
| `seedling_bot_ap_p4b` | the bot build BEFORE the arm-time fix — the only one declaring no `arm` | [▶ play](https://peerinfinity.github.io/seedling-wasm/seedling_bot_ap_p4b/game.html) | `arm-control` | [`bot@c2119e6`](https://github.com/PeerInfinity/Seedling/commit/c2119e6749578aa5eb70e625ac327f3a690e1441) | [`06f3d87`](https://github.com/PeerInfinity/SWFRecomp-CC/commit/06f3d87d295b03b44b94221d38594612ecda4ff5) |

- `demo` — here to be PLAYED, by a person, at a URL — no instrument drives it
- `default` — what the app and the instruments load — `WASM_PAGE` and the `SEEDLING_PAGE` defaults name it
- `apitem-control` — the negative half of the `apitem` pair — pinned so a build WITHOUT Archipelago’s placement pickup exists to compare against
- `arm-control` — the negative half of the `arm` pair — pinned so the dead-frame corrections have a build that does NOT arm after the swap

<!-- GENERATED:seedling-wasm-builds END -->

⚠ **Every page here needs WebGPU and a real user gesture.** The ▶ Start button inside the
frame has to be clicked by a person (or by a browser automation tool, whose click is a real
input event) — the renderer and the audio context consume the activation, and a host page
deliberately refuses to press it. There is no `SharedArrayBuffer` and no pthread use
(measured: 0 occurrences in the glue), so a host does **not** need COOP/COEP headers — plain
GitHub Pages serves these. Headless, they come up on `--enable-unsafe-webgpu
--ignore-gpu-blocklist --enable-unsafe-swiftshader --use-angle=swiftshader`, at
software-rendering speed.

## How Archipelago-CC uses them

That repository loads the `default` build above over a `__swfBridge` host surface from a
same-origin iframe — as [a committed tape replaying beside the JS
engine](https://peerinfinity.github.io/Archipelago-CC/modules/seedlingDemo/watch.html?tape=frontend/modules/seedlingDemo/fixtures/tapes/pit-fall-chain-85.json&side=wasm),
as [a room generated in the page and mounted as a one-room level
set](https://peerinfinity.github.io/Archipelago-CC/modules/seedlingDemo/watch.html?source=generate&seed=1&biome=pre-sword&count=4&tries=8&k=3&anchortries=1&run=1),
and as [the Archipelago app's own flash
panel](https://peerinfinity.github.io/Archipelago-CC/index.html?mode=flash&game=seedling&seed=1&focusPanel=flashPanel)
— press ▶ Start inside the frame in each. The [procgen demo
catalogue](https://peerinfinity.github.io/Archipelago-CC/modules/procgenDocs/demos.html) links
more of them; those run the JS engine instead, so they cost no 33 MB download.

## Adding a build

1. Copy in the four files `builds.json` lists — `game.html`, `swf_bridge_avm2.js`, and the
   `.js` / `.wasm` that `game.html` itself names. ⛔ Not `test.swf`, `test_info.json`,
   `.demo_type` or `index.html`: nothing loads them.
2. Add `!/<name>/` to `.gitignore`, which is a whitelist.
3. Add the `builds.json` entry — `js`, `wasm`, the md5s, `bytes`, `capabilities`, `builtFrom`,
   `namedBy`, and the three fields the table above renders (`summary`, `role`, `source`).
4. Commit and push here; then, in Archipelago-CC, regenerate this README's table with
   `node scripts/procgen/seedling-wasm-readme.mjs --write` and bump the submodule pointer in
   its own commit.

**[`docs/pin-policy.md`](docs/pin-policy.md)** is the law — which builds may live here, the
four ways it is enforced, the four spellings a reference can take, and how to retire a build.
**[`docs/history.md`](docs/history.md)** is why this is a repository at all, what was retired
and on what measurement, and the history-size policy.

## Licence

**The Unlicense** — public domain. Upstream
[ConnorUllmann/Seedling](https://github.com/ConnorUllmann/Seedling) and the
[PeerInfinity/Seedling](https://github.com/PeerInfinity/Seedling) fork are both Unlicense,
which grants the right to distribute the work "either in source code form or **as a compiled
binary** … for any purpose". These builds are compiled binaries of that source, so
redistributing them here is clean. See `LICENSE`.
