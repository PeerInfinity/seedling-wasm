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

## The retirement of 2026-09-12

⛓ **`seedling_bot_ap_p4b` and `seedling_bot_ap_p4c` retired, and so did the tests that existed to
drive them.** They were pinned as NEGATIVE CONTROLS, not by use: p4b declared no `arm` (the build
that armed beside the world swap, so two dead-frame corrections in Archipelago-CC had a build on
which their "does not arm after the swap" branch was taken), and p4c declared no `apitem` (the build
whose XML loop ignores an `<apitem>` element, so a rewritten AP tile read EMPTY there). The
repository owner reviewed whether those tests were worth keeping two more builds — and, since the
rebuild above, two runtimes — for, and ruled:

> *"I'm not aware of any reason to care whether the code behaves correctly with the old wasm
> builds. I think it just needs to behave correctly with the new build."*
>
> *"Yes, let's add the retirement slice to the plan. And let's still keep seedling_original."*

⇒ the host supports ONE bot build, `seedling_bot_ap_p4d`, plus `seedling_original`, which is the
demo and not a test control. Before anything was deleted, each branch that only the controls
reached was proved unreachable on p4d by a mutant in Archipelago-CC (SEEDLING HEADLESS WEBGPU slice
R2); then the branches, the two control roles and the two builds went together. ⛔ **The cost,
stated once:** a host regression in an absent-capability branch is undetectable from here on — by
design, because no shipped build reaches one.

⚠ **Deleting the directories does not shrink this repository.** Every byte of both builds is
still in history (see *History size* below); the tree gets smaller, the clone does not.

## The pins update of 2026-09-13

⛓ **Both builds moved to the recompiler's head, and neither the AS3 nor the SWF moved.**
`seedling_bot_ap_p4d` and `seedling_original` were recompiled on SWFRecomp-CC `bdf734c46`
(`origin/master`), 37 commits past the `254145a5b` runtime of the rebuild above. **Why now:**
shedding this repository's history (below) is delayed by the owner *"until all of the pins are
updated to the latest version"* — this is that update.

⛓ **The same SWF bytes, on purpose.** The rebuild of 2026-09-12 kept its SWFs, and those exact
files went into the new recompiler — `Seedling_bot_ap_r1.swf` (md5 `da451bfb…`, already injected)
and `Seedling_original_r1.swf` (md5 `a543c03a…`). No mxmlc, no injection. Every byte that moved is
therefore the recompiler's and the runtime's, and the previous builds are the control: the same
SWF on the older toolchain.

⛓ **What the delta is.** 21 code commits: AVM1 fixes (linked into these AVM2 builds as dead
weight), a Stage3D backend and display/text probes the game never calls, a bitmap `blend_over`
rounding change (moves the low bit of alpha-blended pixels, nothing else), DefineShape4
EdgeBounds, LINESTYLE2 caps and joins, a JSON.parse precision fix the bot already guards against,
and a font-table fix. The renderer is byte-identical. On these SWFs the recompiled C differs in two
files for the bot build (a character table gains its edge-bounds fields; one stroke's 30 vertices)
and one for the demo; the class, method and body counts read exactly as before.

⛓ **Sizes.** `seedling_bot_ap_p4d.wasm` 33,971,913 → **34,039,926 B**; `seedling_original.wasm`
33,640,375 → **33,712,711 B**. The `.js` files keep their length and differ only in table offsets;
`game.html` and `swf_bridge_avm2.js` are byte-identical. Headless, both modes, both builds read
as their predecessors did — `{lost:1, stalls:0}` without the Vulkan pair; with it, the OverWorld1
room and the demo's whole opening sequence to the title screen by screenshot, 0 WebGPU errors.

## Which build was the default, and when

The DEFAULT is whichever build `WASM_PAGE` and the `SEEDLING_PAGE` defaults name; the table in
the README reads it out of `builds.json` rather than out of anyone's memory. The moves so far:

- `seedling_bot_ap_p4b` held every default until **2026-08-26**;
- `seedling_bot_ap_p4c` held them from then until **2026-08-30**, when EDITOR INTEGRATION
  slice P2 moved them (⚖ user: *"I want to make p4d the default"*);
- `seedling_bot_ap_p4d` held them from then until **2026-09-27**, when R9 slice DEF moved them
  (⚖ user: *"I agree with those recommendations"* — licence: the CI full tier on p4e, 154 tapes
  3745/0/46);
- `seedling_bot_ap_p4e` has held them since. ⛓ **p4d stayed pinned, as `role: control`** — the
  negative arm for `hold` and `tag`, the two capabilities p4e added — held by ONE line of
  Archipelago-CC code and a pins-gate row keyed on the capability, not the name.

⛓ A default flip is a DERIVED list and never a typed one — P2's moved **53 tracked files / 69
lines**. Both of the older builds stayed pinned afterwards, and not out of sentiment: each was
the negative half of a pair — until the retirement of 2026-09-12 above.
`builds.json`'s per-build `namedBy` carries the measured detail, with the command that produced
each number beside it.

## History size

Every commit that changes a `.wasm` adds ~33 MB to this repository forever; nothing rewrites
history today. If it grows uncomfortable, the stated remedy is to shed it deliberately —
commit the current tree as an orphan commit and force-push, keeping the working files and
dropping the old bytes. That is a policy, not something already done: the full history is
intact.

## The shed of 2026-09-14

⛓ **This commit has no parent.** Per "History size" below, the tree at `7ae2d5a9ebdd90432e8570ce298f9430f60ef557`
(the head of 2026-09-13, 17 commits from `f14f7ae` of 2026-08-19) was committed once more as an ORPHAN and `main` was
force-pushed to it, keeping every working file and dropping the bytes behind them. The decision was the repository
owner's (2026-09-13: *"Let's delay the shed until all of the pins are updated to the latest version"* — the pins update
of 2026-09-13 above is that update, both builds on SWFRecomp-CC `bdf734c46`), and the shed followed it.

⛓ **Byte-identical apart from this section.** `git diff --stat 7ae2d5a <this commit> -- . ':!docs/history.md'` is EMPTY;
every tracked file's md5 is unchanged except `docs/history.md`, which only gains these lines. The two builds, their
manifest entries and the README are the ones the pins update recorded.

⛓ **What it cost to keep, measured.** A fresh clone of the 17-commit history was **52 M `.git`, size-pack 51.49 MiB**
(measured at the pins update; the rebuilt wasms added 14.28 MiB of pack for two files, not the ~2–4 MB a pack delta had
been assumed to cost). The number the shed brings a fresh clone down to is in the outer repository's record of this
shed (Archipelago-CC, queue §5w and plan §21.3), measured on a clone of this commit. The prior heads stay reachable by
SHA on GitHub for a while; nothing here was ever private.
