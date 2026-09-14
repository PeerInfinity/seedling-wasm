# The pin policy

> **A build lives here iff a tracked file of Archipelago-CC names it — OR it is a DEMO:
> `demo: true` in its manifest entry AND a link to `<name>/game.html` in this repository's
> README.**

⚖ **The second clause arrived on 2026-09-07** (user ruling, SEEDLING ORIGINAL WASM slice W1)
and it exists because `seedling_original` cannot satisfy the first. Every other build here is
pinned because an instrument DRIVES it; nothing in Archipelago-CC names the original game and
nothing should — it is here to be played, by a person, at a URL. So a demo build is admitted
by a different pair of facts, and the README link is the load-bearing half of it: `demo: true`
on its own would be the manifest admitting itself, whereas the link is the thing a reader
actually follows, in a file the gate does not write. A `demo: true` that the README links
nowhere is reported as a problem in its own right — a demo nobody can reach — rather than as
"retire it". `check-seedling-wasm-pins.mjs` prints WHICH of the two reasons admitted each
build on every run.

## Enforced four ways at once

| Where | What it says |
|---|---|
| `.gitignore` | a **whitelist** — `/*` then one `!/<name>/` line per pinned build |
| `builds.json` | one manifest entry per pinned build, with md5s and *who names it* |
| this repository's `README.md` | the demo clause's other half — the link a reader follows |
| Archipelago-CC's `scripts/procgen/check-seedling-wasm-pins.mjs` | reds unless the admitted set, the whitelist, `git ls-tree` here, and `builds.json` all agree |

The whitelist exists because the working copy is not the repository. Builds nobody pins any
more stay on a developer's disk in this same directory and stay reachable as
`SEEDLING_PAGE=<name>`; they are simply invisible to git. A blocklist could not promise that
— a new historical build would silently become trackable.

## What counts as a reference, and how it is spelled

A reference is a reference however it is spelled, and that has now been the finding three
separate times. The gate enumerates **four** spellings, over a text in which adjacent string
literals have been joined first, because every one of those forms occurs in the consuming
tree:

1. the literal `wasm/<name>` path — including `../flashPanel/wasm/<name>/…` and a full
   `http://localhost:8000/…` URL, none of which the first version of this scan could see,
   because it excluded a leading `/`;
2. a preset's `"wasm": "<name>/game.html"`;
3. a script's `process.env.SEEDLING_PAGE || '<name>'` **default** — the default is the pin,
   the environment variable is just an override;
4. a bare `PAGE_NAME = '<name>'` constant.

An env EXAMPLE in a docblock is deliberately *not* a pin — that is the rule keeping the
historical builds out — so spelling 4 is scoped to `PAGE_NAME` rather than matching any
quoted name. `check-seedling-wasm-pins.mjs --self-test` gates all of this with one
seen/not-seen case per spelling.

⚠ **A name the scan cannot see is a build the gate clears for retirement while an instrument
still loads it.** Measured: a name in its own `const` with the path assembled by
`join(REPO, 'frontend', 'modules', …)` matches **none** of the four spellings above. So does
a bare `const BUILD = '<name>'` — `check-seedling-wasm-pages.mjs` writes exactly that
(measured 2026-09-07), so the scan's count for the default build is a LOWER BOUND on the
files that really load it. Where a tracked file must pin a build, write the whole literal
path.

## `<name>` is not always the directory name

⛔ All four builds pinned today happen to agree, so the rule needs its evidence stated rather
than demonstrated: `seedling_bot_ap_phase3/`, pinned until 2026-08-19, carried
`seedling_bot_ap.{js,wasm}` — the directory had been renamed and the build had not.
`builds.json`'s `js` / `wasm` fields are the authority, and `game.html`'s own `<script src>`
is where they come from. Anything that resolves a payload filename from the directory name is
wrong for such a build — and so is anything that assumes the directory name, which is the
OTHER half and cost the consuming repo a silently-skipping check row.

## What a build directory holds

```
<build>/
  game.html            the iframe surface — names its own js in a <script src>
  swf_bridge_avm2.js   the AVM2 ExternalInterface shim (installs __swfBridge)
  <name>.js            emscripten glue (~100-148 KB)
  <name>.wasm          the recompiled game (~31-34 MB)
```

⛔ Not `test.swf`, `test_info.json`, `.demo_type` or `index.html`; nothing loads them, and
`index.html` is a redirect to an SWFRecomp-CC path that does not exist in the consuming tree.

## Retiring a build

Delete the whitelist line and the manifest entry — and only once **nothing tracked in
Archipelago-CC names it any more**, because the gate checks that direction too. The directory
may stay on disk; git will ignore it.

## The manifest-prose exemption

⚖ Ruled by the user on 2026-08-30 (EDITOR INTEGRATION slice P4), AS RULED: *a gitlink bump
whose submodule diff touches ONLY `builds.json` AND whose per-build payload md5s are
byte-identical owes the pins gate plus the bounded reach, NOT the full-tier drive — the md5
identity is QUOTED in the outer commit as the licence.* ⛔ Its boundary is the premise, and it
is all three clauses: a build directory, an `.gitignore` whitelist line or any other file in
the same submodule commit, or an md5 that moved, and it does not apply — a payload that moved
is a different game, which is exactly what only the 143-minute full tier can see. The rule
lives where the gate that PRICES the tier reads it, `Archipelago-CC
scripts/procgen/check-seedling-full-tier-owed.mjs`, and is restated in this repository's
`builds.json` `$comment`.

⚠ **2026-09-07, SEEDLING ORIGINAL WASM slice W2 — the commit that created this file claimed
the exemption WITHOUT satisfying clause 1**, and says so rather than quietly widening the
rule. Its submodule diff is `builds.json`, `README.md`, `.gitignore` (one `!/docs/` line) and
these two documents: no build directory, no md5 field, no build whitelist line, and the four
payload md5s byte-identical to the parent commit's, quoted in the outer commit. That is the
exemption's own REASONING — *no byte the game runs is in it, and no byte the game runs moved*
— without its letter. ⛓ And `check-seedling-full-tier-owed.mjs` still reds on the gitlink,
deliberately: what the exemption licenses is the DISCHARGE, not a green row.
