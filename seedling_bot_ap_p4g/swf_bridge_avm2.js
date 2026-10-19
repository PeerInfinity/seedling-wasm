// swf_bridge_avm2.js — the window.__swfBridge contract on a recompiled AVM2
// game page (the AS3/BridgeGeneric counterpart of swf_bridge.js).
//
// Loading this shim is the page's opt-in: the AVM2 runtime's
// flash.external.ExternalInterface checks `window.__swfBridge` once (same gate
// design as the AVM1 handler in action.c) — pages that don't load this keep
// ExternalInterface.available == false and are entirely unaffected.
//
// The AS3 side is flash-ap-api's BridgeGeneric (canonical, injected via DoABC
// into an unmodified game SWF). Its EI usage defines the surface here:
//
//   game → host (outward ExternalInterface.call):
//     stateChanged(pname, pvalue)  — a monitored game property changed
//     getItemQueue()               — poll for host→game work; returns a JSON
//                                    array of queue items, DRAINED on read
//                                    (BridgeGeneric does not dedup invocations)
//     console.log(msg)             — resolved by the runtime's dotted-path
//                                    walk; no shim function needed
//
//   host → game (inbound, via ExternalInterface.addCallback):
//     wireCheck() -> "ok", configure(json) -> "ok"|"error:...", readState() -> json
//     The runtime notifies __registerCallback(name) for each addCallback and
//     this shim creates the wrapper under __swfBridge.game.<name>, funneling
//     into the wasm dispatcher avm2_ei_dispatch (string in / string out).
//     Call these only between frames (any JS task/timer/event is fine — the
//     browser main loop parks at emscripten_sleep between frames).
//
// Host integration points (Archipelago-CC's adapter, a mock host, or a test):
//   __swfBridge.game.<cb>(arg)      — call the game's registered callbacks
//   __swfBridge.queueItems(items)   — enqueue BridgeGeneric queue items
//                                     (property writes / path writes /
//                                     invocations) for the game's next poll
//   __swfBridge.onStateChanged(p,v) — override to receive state reports
//                                     (default: record + console.log)
//   __swfBridge.stateLog            — [{name, value}] of every report seen
//
// Loaded as a plain classic script BEFORE the wasm module glue. No imports.

(function () {
	"use strict";

	// Host→game queue items pending the game's next getItemQueue() poll.
	var itemQueue = [];

	var bridge = {
		// Populated via __registerCallback as the game's AS3 calls addCallback.
		game: {},

		// Every stateChanged report, for hosts/tests that want history.
		stateLog: [],

		// host → game: enqueue BridgeGeneric queue items (objects or a single
		// object). Drained by the game's next getItemQueue() poll.
		queueItems: function (items) {
			if (items == null) return;
			if (!Array.isArray(items)) items = [items];
			for (var i = 0; i < items.length; i++) itemQueue.push(items[i]);
		},

		// game → host: a monitored property changed. Hosts override this.
		onStateChanged: function (pname, pvalue) {
			console.log("[swfBridge] stateChanged (unhandled):", pname, pvalue);
		},

		// Runtime hooks: addCallback(name, fn) landed / was removed in the VM.
		__registerCallback: function (name) {
			bridge.game[name] = function (arg) {
				var M = window.Module;
				if (!M || typeof M.ccall !== "function") return null;
				var hasArg = arg !== undefined && arg !== null;
				// NULL dispatcher result reads back as "" through ccall's
				// 'string' return; none of the bridge callbacks legitimately
				// return "", so normalize it to null.
				var r = M.ccall("avm2_ei_dispatch", "string",
					["string", "string", "number"],
					[name, hasArg ? String(arg) : "", hasArg ? 1 : 0]);
				return r === "" ? null : r;
			};
			console.log("[swfBridge] callback registered:", name);
		},
		__unregisterCallback: function (name) {
			delete bridge.game[name];
		},
	};

	window.__swfBridge = bridge;

	// ── EI-facing window functions BridgeGeneric calls outward ────────────────

	window.stateChanged = function (pname, pvalue) {
		bridge.stateLog.push({ name: pname, value: pvalue });
		try {
			bridge.onStateChanged(pname, pvalue);
		} catch (e) {
			if (window.console) console.error("[swfBridge] onStateChanged failed:", e);
		}
	};

	// Drain-on-read: BridgeGeneric applies every returned item each frame and
	// does not dedup invocations, so returning the same item twice would
	// double-apply it.
	window.getItemQueue = function () {
		if (itemQueue.length === 0) return "";
		var s = JSON.stringify(itemQueue);
		itemQueue = [];
		return s;
	};

	console.log("[swfBridge] avm2 shim installed");
})();
