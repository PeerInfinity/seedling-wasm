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
