# Why this is a repository, and what has been retired from it

## Why a repository

The builds are ~33 MB of binary each and were previously copied by hand into a gitignored
directory. That worked for a developer with the artifacts on disk and failed for everyone
else: Archipelago-CC's GitHub Pages site could not serve the game at all, and its
`watch.html` printed *"…/game.html is missing"* to every visitor. A submodule at exactly the
path the loaders already use fixes that with **zero code change** — `actions/checkout` with
`submodules: recursive` (which that repo's workflows already pass) puts the files where every
existing path expects them.

## The retirements of 2026-08-19

⛓ **The pin set was four builds on the morning of 2026-08-19 and was ONE by its end.**
`seedling_bot_ap`, `seedling_bot_ap_phase3` and `seedling_teleport_ap` all retired on
MEASUREMENT rather than on tidiness, and each was earned by the gate that had pinned it — see
their commits. All three are still on developers' disks, untracked under the whitelist, and
still reachable as `SEEDLING_PAGE=<name>`.

⛓⛓ `seedling_teleport_ap` was the variant that skips the preloader and the title screen, and
the flash panel loaded it because that is what was on hand when the panel was written.
`verify-seedling-wasm-bridge.mjs` — the row that pinned it — reads **ALL PASS 12/12** with the
presets, `regionAtlasCompiler` and both verify rows pointed at `seedling_bot_ap_p4b`,
**including the arm the variant is named for** (*"teleport new_instance applied by
BridgeGeneric"*). The different boot path costs nothing: the panel already waits for the
user's ▶ Start and for the bridge handshake to reach `ready` before it configures anything, so
a build that shows a title screen first arrives at the same place a little later.
⇒ **63 MB of checkout became 33 MB.**

⛓ `seedling_bot_ap` itself was absorbed by `seedling_bot_ap_p4b`, whose bridge surface is a
strict superset of that build's eight verbs (it adds `botForgeSaveStamp`, `botLevelSet`,
`botLoadLevels`). That retirement was earned too: the R8 tape gate, comparing against
`seedling_bot_ap`'s OWN oracle recordings, read **534 PASS / 0 FAIL / 67 SKIP on both builds**,
run back to back with nothing edited in between, and all 602 check lines agree in order and in
text but for 13 — each a free-running clock whose control arm, the same build re-run, moved at
least as far. No expectation, tape or battery byte moved.

## The rebuild of 2026-09-12

⛓ **Two of the four builds were rebuilt on a newer SWFRecomp-CC runtime, and the AS3 did not
move.** `seedling_bot_ap_p4d` (the default) and `seedling_original` (the demo) were recompiled on
runtime `254145a5b`; `seedling_bot_ap_p4b` and `seedling_bot_ap_p4c` were deliberately NOT — they
are the `arm` and `apitem` negative controls, and whether the tests that drive them are worth
keeping multiple runtimes for is a review the repository owner has reserved. So this repository now
holds builds from two runtimes on purpose, and each entry's `source.recompiler` says which.

⛓ **What it bought.** The previous runtime lost its WebGPU device at the first canvas present on
headless SwiftShader and then parked every other frame for ~4.4 s, and its 283-layer bitmap texture
array was over SwiftShader's 256-layer limit, so the canvas was black even when the device
survived. Measured on the same box, 40 s runs, old build against new: "WebGPU error" console lines
**3279 → 0**, canvas distinct colours **1 → 44** on the bot build, and — on the demo — the whole
opening sequence readable by screenshot for the first time headless: the Newgrounds intro at 5 s,
the *"A GAME BY CONNOR ULLMANN"* splash at 20 s, and *"Seedling — press any key to play"* at 60 s.
The 2026-09-07 entry for that build records the opposite result ("THE HEADLESS ARM CANNOT ANSWER
THIS": 46 frames in 95 s, 46 page errors, an all-black screenshot) and had to move its boot proof
to real-GPU Windows Chrome. That is the measurement this rebuild changed.

⛓ **Two headless modes now, and which is faster flipped.** Without `--use-vulkan=swiftshader` and
the `Vulkan` feature the device is still lost — but the new runtime SURVIVES it: every WebGPU call
becomes a valid no-op, `window.__swfGpu` reads `{lost:1, stalls:0}`, and the game ticks at ~26
frames/s with no pixels and no frame over one second. WITH those two flags the device stays alive
and SwiftShader rasterises on the CPU, which is real pixels at roughly half the rate. Neither is a
mode of the wasm; both are Chromium.

⛔ **The md5s in `builds.json` pin artifacts, not sources.** A control build at the identical AS3
commit, minutes apart, produced a SWF 55 bytes different and — after the AP injection, which yields
exactly the same total length — **467,446 of 9,743,894 bytes** different. mxmlc is not
reproducible, and that number is measured here rather than asserted.

## Which build was the default, and when

The DEFAULT is whichever build `WASM_PAGE` and the `SEEDLING_PAGE` defaults name; the table in
the README reads it out of `builds.json` rather than out of anyone's memory. The moves so far:

- `seedling_bot_ap_p4b` held every default until **2026-08-26**;
- `seedling_bot_ap_p4c` held them from then until **2026-08-30**, when EDITOR INTEGRATION
  slice P2 moved them (⚖ user: *"I want to make p4d the default"*);
- `seedling_bot_ap_p4d` has held them since.

⛓ A default flip is a DERIVED list and never a typed one — P2's moved **53 tracked files / 69
lines**. Both of the older builds stayed pinned afterwards, and not out of sentiment: each is
the negative half of a pair, which is what the `role` column in the README's table records.
`builds.json`'s per-build `namedBy` carries the measured detail, with the command that produced
each number beside it.

## History size

Every commit that changes a `.wasm` adds ~33 MB to this repository forever; nothing rewrites
history today. If it grows uncomfortable, the stated remedy is to shed it deliberately —
commit the current tree as an orphan commit and force-push, keeping the working files and
dropping the old bytes. That is a policy, not something already done: the full history is
intact.
