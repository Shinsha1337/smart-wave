    // -------------------------------------------------------------------------
    let overlayEl = null;
    let updateVolumeUI = () => {};
    let applyCoverGlow = () => {};
    function formatTime(ms) {
        if (!ms || isNaN(ms)) return "0:00";
        const totalSec = Math.floor(ms / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    }


    function createOverlayDOM() {
        if (overlayEl) return;
        const style = document.createElement("style");
        style.id = "sw-pure-black-clean-v13-css";
        style.textContent = `
            #sw-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 999999;
                background-color: #000000;
                color: #ffffff;
                display: none;
                flex-direction: column;
                box-sizing: border-box;
                font-family: CircularSp, CircularSp-Arab, CircularSp-Hebr, CircularSp-Cyrl, CircularSp-Grek, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                user-select: none;
                overflow: hidden;
            }
            #sw-overlay.visible {
                display: flex;
            }
            /* Top bar: fixed margins (80px left, 80px right), independent of window size */
            .sw-top-bar {
                width: 100%;
                height: 72px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 140px 0 80px;
                box-sizing: border-box;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 10;
                -webkit-app-region: drag;
            }
            .sw-top-left {
                display: flex;
                align-items: center;
            }
            .sw-top-right {
                display: flex;
                align-items: center;
            }
            .sw-top-bar button {
                -webkit-app-region: no-drag;
            }
            .sw-back-circle {
                background: rgba(255, 255, 255, 0.06);
                border: none;
                border-radius: 50%;
                width: 44px;
                height: 44px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #b3b3b3;
                cursor: pointer;
                transition: color 0.15s, transform 0.15s, background-color 0.15s, opacity 0.15s;
            }
            .sw-back-circle:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.14);
                transform: scale(1.08);
            }
            .sw-wave-toggle-btn {
                margin-left: 12px;
            }
            .sw-wave-toggle-btn.disabled {
                opacity: 0.35;
                color: #777777;
            }
            .sw-wrap {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                max-width: min(94vw, 1500px);
                width: 100%;
                margin: 0 auto;
                position: relative;
                padding: 72px 24px 72px 24px;
                box-sizing: border-box;
            }
            /* Centered player: perfect vertical and horizontal centering */
            .sw-hero-center {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                text-align: center;
                width: 100%;
                margin: auto 0;
                flex-shrink: 0;
            }
            /* Cover art and WebGL shader container (compact, fine-tuned spacing) */
            .sw-art-wrapper {
                position: relative;
                width: clamp(280px, min(47vh, 50vw), 880px);
                height: clamp(280px, min(47vh, 50vw), 880px);
                margin-bottom: clamp(-78px, -5.5vh, -28px);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            /* Hardware WebGL canvas for the live wave (smooth trail without clipping) */
            #sw-wave-canvas {
                position: absolute;
                width: 175%;
                height: 175%;
                z-index: 1;
                pointer-events: none;
            }
            /* Square cover with rounded corners */
            .sw-cover-card {
                position: relative;
                z-index: 2;
                width: clamp(130px, min(20vh, 22vw), 380px);
                height: clamp(130px, min(20vh, 22vw), 380px);
                border-radius: clamp(16px, 2.5vmin, 30px);
                overflow: hidden;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
                background: #121212;
                cursor: pointer;
                transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s;
                flex-shrink: 0;
            }
            .sw-cover-card:hover {
                transform: scale(1.05);
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.95);
            }
            /* Inner Glow: takes the color of the wave gradient's inner core */
            .sw-cover-card::after {
                content: "";
                position: absolute;
                inset: 0;
                border-radius: inherit;
                box-shadow: var(--sw-inner-glow, inset 0 0 22px 3px rgba(255, 255, 255, 0.25));
                border: var(--sw-inner-glow-border, 1px solid rgba(255, 255, 255, 0.12));
                pointer-events: none;
                z-index: 3;
                transition: box-shadow 0.5s ease, border-color 0.5s ease;
            }
            .sw-cover-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }
            /* Title and artist (larger and more readable) */
            .sw-title-text {
                font-size: clamp(32px, 3.8vw, 56px);
                font-weight: 850;
                color: #ffffff;
                text-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 1px 4px rgba(0, 0, 0, 0.25);
                letter-spacing: -0.03em;
                max-width: min(88vw, 950px);
                white-space: nowrap;
                overflow: hidden;
                /* Padding creates room for the text-shadow inside the overflow:hidden box;
                   compensating negative margins keep the visual layout identical */
                padding: 6px 10px 16px;
                margin: -6px -10px calc(clamp(2px, 0.4vh, 4px) - 16px);
                text-overflow: ellipsis;
                position: relative;
                z-index: 2;
                line-height: 1.15;
            }
            .sw-artist-text {
                font-size: clamp(18px, 2.0vw, 28px);
                font-weight: 500;
                color: #b3b3b3;
                text-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 1px 4px rgba(0, 0, 0, 0.25);
                position: relative;
                z-index: 2;
                line-height: 1.25;
                padding: 4px 10px 14px;
                margin: -4px -10px calc(clamp(10px, 1.4vh, 16px) - 14px);
            }
            /* Reference horizontal scrolling for long titles */
            .sw-marquee-inner {
                display: inline-block;
                white-space: nowrap;
                will-change: transform;
            }
            .sw-marquee-active .sw-marquee-inner {
                animation: sw-marquee-scroll var(--sw-marquee-duration, 10s) ease-in-out infinite;
            }
            @keyframes sw-marquee-scroll {
                0%, 18% { transform: translateX(0); }
                46%, 54% { transform: translateX(calc(-1 * var(--sw-marquee-distance, 0px))); }
                82%, 100% { transform: translateX(0); }
            }
            /* Music control panel (raised higher and balanced) */
            .sw-ctrl-wrap {
                width: 100%;
                max-width: clamp(520px, 62vw, 860px);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                margin-top: 2px;
                position: relative;
                z-index: 2;
            }
            /* Player buttons */
            .sw-btn-bar {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: clamp(10px, 1.5vw, 18px);
            }
            .sw-icon-btn {
                background: rgba(255, 255, 255, 0.06);
                border: none;
                color: #b3b3b3;
                width: clamp(48px, 5.5vmin, 64px);
                height: clamp(48px, 5.5vmin, 64px);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: color 0.15s, transform 0.15s, background-color 0.15s;
            }
            .sw-icon-btn:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.14);
                transform: scale(1.06);
            }
            .sw-icon-btn:active {
                transform: scale(0.95);
            }
            .sw-icon-btn.heart-active {
                color: #1ed760;
                background: rgba(30, 215, 96, 0.15);
            }
            .sw-icon-btn.dislike-btn:hover {
                color: #ff4d4d;
                background: rgba(255, 77, 77, 0.15);
            }
            .sw-play-circle {
                background: #ffffff;
                border: none;
                border-radius: 50%;
                width: clamp(62px, 7.2vmin, 82px);
                height: clamp(62px, 7.2vmin, 82px);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #000000;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(255, 255, 255, 0.25);
                transition: transform 0.15s, background-color 0.15s, box-shadow 0.15s;
            }
            .sw-play-circle:hover {
                transform: scale(1.06);
                background: #f5f5f5;
                box-shadow: 0 6px 28px rgba(255, 255, 255, 0.35);
            }
            /* Wide progress bar: spacious, comfortable, far from the buttons */
            .sw-timeline {
                width: 100% !important;
                align-self: stretch !important;
                display: flex;
                align-items: center;
                gap: 7px;
                font-size: 13px;
                color: #a7a7a7;
                position: relative;
                box-sizing: border-box;
            }
            .sw-time-num {
                width: 42px;
                min-width: 42px;
                flex-shrink: 0;
                font-variant-numeric: tabular-nums;
                font-feature-settings: "tnum";
                font-weight: 500;
            }
            #sw-cur-time {
                text-align: left;
                padding: 0;
            }
            #sw-tot-time {
                text-align: right;
                padding: 0;
            }
            .sw-bar-bg {
                flex: 1;
                height: 6px;
                background: rgba(255, 255, 255, 0.18);
                border-radius: 9999px;
                position: relative;
                cursor: pointer;
                transition: height 0.15s;
            }
            .sw-bar-bg:hover {
                height: 8px;
            }
            .sw-bar-fill {
                height: 100%;
                background: #ffffff;
                border-radius: 9999px;
                width: 0%;
                transition: background 0.1s;
                pointer-events: none;
            }
            .sw-bar-bg:hover .sw-bar-fill {
                background: #1ed760;
            }
            /* Volume: placed at the right edge of the wide bar (free space) */
            .sw-vol-popup-wrap {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-left: 6px;
            }
            .sw-vol-icon-btn {
                background: none;
                border: none;
                color: #b3b3b3;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: color 0.15s, transform 0.15s;
            }
            .sw-vol-icon-btn:hover {
                color: #ffffff;
                transform: scale(1.15);
            }
            /* Popup vertical volume slider: compact, does not reach the buttons */
            .sw-vol-panel {
                position: absolute;
                bottom: 22px;
                left: 50%;
                transform: translateX(-50%) translateY(4px);
                width: 28px;
                height: 110px;
                background: none;
                border: none;
                box-shadow: none;
                backdrop-filter: none;
                -webkit-backdrop-filter: none;
                display: flex;
                align-items: center;
                justify-content: center;
                padding-bottom: 6px;
                box-sizing: border-box;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.15s ease, transform 0.15s ease;
                z-index: 100;
            }
            .sw-vol-popup-wrap:hover .sw-vol-panel,
            .sw-vol-popup-wrap.dragging .sw-vol-panel {
                opacity: 1;
                pointer-events: auto;
                transform: translateX(-50%) translateY(0);
            }
            .sw-vol-track {
                width: 6px;
                height: 94px;
                background: rgba(255, 255, 255, 0.22);
                border-radius: 3px;
                position: relative;
                cursor: pointer;
                transition: width 0.15s;
            }
            .sw-vol-track:hover {
                width: 8px;
            }
            .sw-vol-fill {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 80%;
                background: #ffffff;
                border-radius: 3px;
                transition: background-color 0.15s;
                pointer-events: none;
            }
            .sw-vol-track:hover .sw-vol-fill {
                background: #1ed760;
            }

            /* Bottom bar: smart wave settings separated and pinned to the bottom edge */
            .sw-bottom-bar {
                position: absolute;
                bottom: clamp(16px, 2.8vh, 32px);
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: clamp(6px, 0.8vh, 10px);
                z-index: 15;
                width: 100%;
                max-width: 90vw;
                pointer-events: auto;
            }
            /* Filter chips */
            .sw-chips-row {
                display: flex;
                align-items: center;
                gap: clamp(8px, 1.2vw, 14px);
                flex-wrap: wrap;
                justify-content: center;
            }
            .sw-settings-row {
                display: flex;
                align-items: center;
                justify-content: flex-start;
                gap: 12px;
                padding: 4px 0;
            }
            .sw-settings-row-label {
                font-size: 14.5px;
                font-weight: 500;
                color: #ffffff;
            }
            .sw-toggle {
                position: relative;
                width: 44px;
                height: 24px;
                border-radius: 9999px;
                border: none;
                background: rgba(255, 255, 255, 0.18);
                cursor: pointer;
                transition: background 0.2s;
                flex-shrink: 0;
            }
            .sw-toggle .sw-toggle-knob {
                position: absolute;
                top: 3px;
                left: 3px;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                background: #ffffff;
                transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .sw-toggle.on {
                background: #1ed760;
            }
            .sw-toggle.on .sw-toggle-knob {
                transform: translateX(20px);
            }
            .sw-settings-io {
                display: flex;
                gap: 10px;
            }
            .sw-io-btn {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.14);
                border-radius: 9999px;
                color: #d6d6d6;
                font-size: 13px;
                font-weight: 600;
                padding: 8px 18px;
                cursor: pointer;
                transition: background 0.15s, color 0.15s, border-color 0.15s;
            }
            .sw-io-btn:hover {
                background: rgba(255, 255, 255, 0.12);
                color: #ffffff;
                border-color: rgba(255, 255, 255, 0.3);
            }
            .sw-settings-danger {
                margin-top: 22px;
                padding-top: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.08);
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            .sw-reset-btn {
                background: transparent;
                border: 1px solid rgba(226, 33, 52, 0.6);
                border-radius: 9999px;
                color: #e22134;
                font-size: 13px;
                font-weight: 600;
                padding: 8px 18px;
                cursor: pointer;
                transition: background 0.15s, border-color 0.15s, color 0.15s;
            }
            .sw-reset-btn:hover {
                background: rgba(226, 33, 52, 0.12);
                border-color: #e22134;
            }
            .sw-reset-btn.confirm {
                background: #e22134;
                border-color: #e22134;
                color: #ffffff;
            }
            .sw-settings-regions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            .sw-region-chip {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid transparent;
                border-radius: 9999px;
                padding: 7px 14px;
                font-size: 13.5px;
                font-weight: 500;
                color: #d6d6d6;
                cursor: pointer;
                transition: background 0.15s, color 0.15s, border-color 0.15s;
            }
            .sw-region-chip:hover { background: rgba(255, 255, 255, 0.12); }
            .sw-region-chip.active {
                background: #ffffff;
                color: #000000;
                border-color: #ffffff;
            }
            .sw-chip {
                background: rgba(255, 255, 255, 0.06);
                border: none;
                border-radius: 9999px;
                color: #b3b3b3;
                font-size: clamp(12px, 1.2vw, 15px);
                font-weight: 700;
                padding: clamp(6px, 0.8vh, 10px) clamp(14px, 1.5vw, 24px);
                cursor: pointer;
                transition: color 0.15s, transform 0.15s, background-color 0.15s;
            }
            .sw-chip:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.14);
                transform: scale(1.04);
            }
            .sw-chip.active {
                background: #ffffff;
                color: #000000;
                border: none;
            }
            .sw-chip.active:hover {
                background: #ffffff;
                color: #000000;
                transform: scale(1.04);
            }
            .sw-chip.shake {
                background: rgba(255, 255, 255, 0.06);
                border: none;
                color: #b3b3b3;
            }
            .sw-chip.shake:hover {
                color: #ffffff;
                background: rgba(255, 255, 255, 0.14);
                transform: scale(1.04);
            }
            /* "Up Next" panel (right of the wave, aligned strictly under the right buttons: right 80px) */
            .sw-upnext-panel {
                position: absolute;
                right: 16px;
                top: 76px;
                width: clamp(280px, min(24vw, 30vh), 420px);
                height: auto;
                max-height: clamp(380px, 65vh, 720px);
                background: rgba(18, 18, 18, 0.88);
                backdrop-filter: blur(28px);
                -webkit-backdrop-filter: blur(28px);
                border-radius: clamp(12px, 1.2vmin, 18px);
                box-shadow: 0 16px 40px rgba(0, 0, 0, 0.85);
                padding: clamp(14px, 1.6vh, 22px);
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                z-index: 50;
                transform: translateX(40px);
                opacity: 0;
                pointer-events: none;
                transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.22s ease;
            }
            .sw-upnext-panel.open {
                transform: translateX(0);
                opacity: 1;
                pointer-events: auto;
            }
            .sw-upnext-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-bottom: 12px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                margin-bottom: 10px;
            }
            .sw-upnext-title {
                font-size: 14px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: -0.01em;
            }
            .sw-upnext-count {
                background: rgba(255, 255, 255, 0.1);
                color: #b3b3b3;
                font-size: 11px;
                font-weight: 700;
                padding: 2px 8px;
                border-radius: 9999px;
            }
            .sw-upnext-list {
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 6px;
                padding-right: 4px;
            }
            .sw-upnext-list::-webkit-scrollbar {
                width: 4px;
            }
            .sw-upnext-list::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }
            .sw-upnext-empty {
                color: #888888;
                font-size: 13px;
                text-align: center;
                padding: 30px 0;
            }
            .sw-upnext-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 10px;
                border-radius: 10px;
                cursor: pointer;
                background: transparent;
                transition: background-color 0.15s, transform 0.1s;
            }
            .sw-upnext-item:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateX(-2px);
            }
            .sw-upnext-thumb {
                width: 42px;
                height: 42px;
                border-radius: 8px;
                object-fit: cover;
                background: #202020;
                flex-shrink: 0;
            }
            .sw-upnext-meta {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }
            .sw-upnext-item-title {
                font-size: 13px;
                font-weight: 600;
                color: #ffffff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .sw-upnext-item-artist {
                font-size: 12px;
                color: #888888;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .sw-upnext-num {
                font-size: 12px;
                color: #555555;
                font-variant-numeric: tabular-nums;
                flex-shrink: 0;
            }
/* --- SPOTIFY-STYLE CUSTOM MODAL & CHIPS (FLUID RESPONSIVE SCALING) --- */
            .sw-custom-modal-backdrop {
                position: fixed !important;
                inset: 0 !important;
                background: rgba(0, 0, 0, 0.72) !important;
                backdrop-filter: blur(14px);
                -webkit-backdrop-filter: blur(14px);
                z-index: 1000005 !important;
                display: none;
                align-items: center;
                justify-content: center;
            }
            .sw-custom-modal-backdrop.open {
                display: flex !important;
            }
            .sw-custom-modal-card {
                width: clamp(480px, min(56vw, 75vh), 840px);
                max-height: clamp(520px, 82vh, 880px);
                background: #101010;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: clamp(8px, 0.9vmin, 14px);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.85);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .sw-custom-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: clamp(16px, 2.2vh, 26px) clamp(20px, 2.2vw, 32px) clamp(14px, 1.8vh, 20px) clamp(20px, 2.2vw, 32px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .sw-custom-modal-title {
                font-size: clamp(18px, 1.45vw, 24px);
                font-weight: 700;
                color: #ffffff;
                letter-spacing: -0.02em;
            }
            .sw-custom-modal-close {
                background: transparent;
                border: none;
                color: #a7a7a7;
                width: clamp(32px, 2.8vmin, 40px);
                height: clamp(32px, 2.8vmin, 40px);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: color 0.15s, background-color 0.15s;
            }
            .sw-custom-modal-close:hover {
                color: #ffffff;
                background-color: rgba(255, 255, 255, 0.1);
            }
            .sw-custom-modal-body {
                padding: clamp(16px, 2vh, 26px) clamp(20px, 2.2vw, 32px);
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: clamp(14px, 2vh, 22px);
            }
            .sw-modal-section-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 4px;
            }
            .sw-modal-section-title {
                font-size: clamp(11px, 0.85vw, 13px);
                font-weight: 700;
                color: #b3b3b3;
                text-transform: uppercase;
                letter-spacing: 0.06em;
            }
            .sw-modal-actions {
                display: flex;
                align-items: center;
                gap: clamp(8px, 0.8vw, 14px);
            }
            .sw-text-btn {
                background: none;
                border: none;
                color: #b3b3b3;
                cursor: pointer;
                font-size: clamp(11px, 0.85vw, 13px);
                font-weight: 600;
                padding: 2px 4px;
                transition: color 0.15s;
            }
            .sw-text-btn:hover {
                color: #ffffff;
                text-decoration: underline;
            }
            .sw-dot-sep {
                color: #555555;
            }
            .sw-custom-submode-row {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: clamp(8px, 1vw, 14px);
            }
            .sw-submode-pill {
                background: #121212;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: clamp(8px, 0.8vmin, 12px);
                padding: clamp(12px, 1.6vh, 18px) clamp(12px, 1.2vw, 18px);
                cursor: pointer;
                transition: background-color 0.15s, border-color 0.15s;
                text-align: left;
            }
            .sw-submode-pill:hover {
                background: #1e1e1e;
            }
            .sw-submode-pill.active {
                background: #ffffff;
                border-color: #ffffff;
            }
            .sw-submode-name {
                font-size: clamp(13px, 1.05vw, 16px);
                font-weight: 700;
                color: #ffffff;
                margin-bottom: 4px;
            }
            .sw-submode-pill.active .sw-submode-name {
                color: #000000;
            }
            .sw-submode-desc {
                font-size: clamp(11px, 0.85vw, 13px);
                line-height: 1.4;
                color: #a7a7a7;
            }
            .sw-submode-pill.active .sw-submode-desc {
                color: #404040;
            }
            .sw-playlists-scroll {
                max-height: clamp(220px, 36vh, 460px);
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 3px;
                padding-right: 4px;
            }
            .sw-playlists-scroll::-webkit-scrollbar {
                width: 6px;
            }
            .sw-playlists-scroll::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
            }
            .sw-pl-item {
                display: flex;
                align-items: center;
                gap: clamp(10px, 1.1vw, 16px);
                padding: clamp(8px, 1vh, 12px) clamp(10px, 1vw, 14px);
                border-radius: 6px;
                cursor: pointer;
                transition: background-color 0.12s;
                user-select: none;
            }
            .sw-pl-item:hover {
                background-color: rgba(255, 255, 255, 0.08);
            }
            .sw-pl-item.selected {
                background-color: rgba(255, 255, 255, 0.12);
            }
            .sw-pl-checkbox {
                width: clamp(18px, 1.4vmin, 22px);
                height: clamp(18px, 1.4vmin, 22px);
                border-radius: 4px;
                border: 2px solid #727272;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                transition: border-color 0.12s, background-color 0.12s;
            }
            .sw-pl-item.selected .sw-pl-checkbox {
                background-color: #1ed760;
                border-color: #1ed760;
                color: #000000;
            }
            .sw-pl-check-svg {
                display: none;
            }
            .sw-pl-item.selected .sw-pl-check-svg {
                display: block;
            }
            .sw-pl-thumb {
                width: clamp(40px, 3.2vw, 54px);
                height: clamp(40px, 3.2vw, 54px);
                border-radius: 4px;
                object-fit: cover;
                background-color: #282828;
                flex-shrink: 0;
            }
            .sw-pl-thumb-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                color: #727272;
            }
            .sw-pl-info {
                display: flex;
                flex-direction: column;
                justify-content: center;
                overflow: hidden;
                min-width: 0;
                flex: 1;
            }
            .sw-pl-name {
                font-size: 15px;
                font-weight: 600;
                color: #ffffff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                line-height: 1.3;
            }
            .sw-custom-modal-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: clamp(14px, 1.8vh, 22px) clamp(20px, 2.2vw, 32px);
                border-top: 1px solid rgba(255, 255, 255, 0.08);
            }
            .sw-pl-count-info {
                font-size: clamp(13px, 0.95vw, 15px);
                font-weight: 500;
                color: #a7a7a7;
            }
            .sw-modal-apply-btn {
                background-color: #1ed760;
                border: none;
                border-radius: 500px;
                padding: clamp(10px, 1.3vh, 14px) clamp(28px, 2.4vw, 42px);
                color: #000000;
                font-size: clamp(14px, 1.05vw, 16px);
                font-weight: 700;
                cursor: pointer;
                transition: transform 0.12s, background-color 0.12s;
            }
            .sw-modal-apply-btn:hover {
                transform: scale(1.04);
                background-color: #1fdf64;
            }
            .sw-preset-row {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                min-height: 30px;
            }
            .sw-preset-chip {
                background: #121212;
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #e0e0e0;
                border-radius: 500px;
                padding: 7px 16px;
                font-size: clamp(12px, 0.9vw, 13px);
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.15s, color 0.15s;
                display: inline-flex;
                align-items: center;
            }
            .sw-preset-chip:hover { background: #1e1e1e; }
            .sw-preset-chip.active {
                background: #ffffff;
                color: #000000;
                border-color: #ffffff;
            }
            .sw-preset-input {
                background: #1e1e1e;
                border: 1px solid transparent;
                box-shadow: 0 0 0 2px #1ed760;
                border-radius: 500px;
                color: #ffffff;
                font-size: clamp(12px, 0.9vw, 13px);
                font-weight: 600;
                padding: 6px 15px;
                outline: none;
                min-width: 110px;
                text-align: center;
                caret-color: #1ed760;
            }
            .sw-text-btn.sw-danger:hover { color: #ff5555; }
            

            /* Top center group: mode switch + "Shake" button */
            .sw-top-center {
                display: flex;
                align-items: center;
                gap: 8px;
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                z-index: 12;
            }
            .sw-top-chips-row {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            /* "Shake" button (universally recognizable Dice icon in Spotify style) */
            .sw-shake-icon-btn {
                background: rgba(255, 255, 255, 0.06);
                border: none;
                border-radius: 50%;
                width: 38px;
                height: 38px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                color: #b3b3b3;
                cursor: pointer;
                transition: color 0.15s, transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.15s;
                margin-left: 4px;
                outline: none;
            }
            .sw-shake-icon-btn:hover {
                color: #1ed760;
                background: rgba(255, 255, 255, 0.16);
                transform: scale(1.12) rotate(15deg);
            }
            .sw-shake-icon-btn:active {
                transform: scale(0.92) rotate(180deg);
            }
            .sw-shake-icon-btn svg {
                flex-shrink: 0;
            }

            /* Browse icon from Spotify (no background) */
            .sw-browse-icon-btn {
                background: transparent !important;
                border: none !important;
                outline: none !important;
                color: #a7a7a7;
                width: 36px;
                height: 36px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                border-radius: 50%;
                transition: color 0.15s, transform 0.15s;
                padding: 0;
                flex-shrink: 0;
            }
            .sw-browse-icon-btn:hover {
                color: #ffffff;
                transform: scale(1.15);
            }
            .sw-browse-icon-btn:active {
                transform: scale(0.92);
            }

            /* Browse button in the bottom row */
            .sw-chip.sw-browse-btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(255, 255, 255, 0.09);
                border: 1px dashed rgba(255, 255, 255, 0.22);
            }
            .sw-chip.sw-browse-btn:hover {
                background: rgba(255, 255, 255, 0.18);
                border-color: rgba(255, 255, 255, 0.40);
                color: #ffffff;
            }
            .sw-chip.sw-browse-btn svg {
                color: #1ed760;
            }

            /* Category grid in the Browse modal */
            .sw-browse-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 12px;
                padding: 10px 0;
            }
            .sw-browse-card {
                background: #181818;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 14px 16px;
                cursor: pointer;
                transition: all 0.15s ease;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }
            .sw-browse-card:hover {
                background: #242424;
                border-color: rgba(255, 255, 255, 0.20);
                transform: translateY(-2px);
            }
            .sw-browse-card.active {
                border-color: #1ed760;
                background: rgba(30, 215, 96, 0.08);
            }
            .sw-browse-card-name {
                font-size: 15px;
                font-weight: 700;
                color: #ffffff;
            }
            .sw-browse-card-desc {
                font-size: 12px;
                color: #888888;
            }

            
        `;
document.head.appendChild(style);
        overlayEl = document.createElement("div");
        overlayEl.id = "sw-overlay";
        overlayEl.innerHTML = `
            <!-- Popup notification inside the overlay -->
            <!-- Top bar: Back and Wave on the left, "Up Next" on the right -->

            <div class="sw-top-bar">
                <div class="sw-top-left">
                    <button class="sw-back-circle" id="sw-btn-back" title="${t('backTitle')}">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                    </button>
                    <button class="sw-back-circle" id="sw-btn-settings" title="${t('settingsTitle')}" style="margin-left: 12px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                    </button>
                </div>

                <!-- Top bar center: mode chips (Spotify style, like the bottom ones) + Shake icon -->
                <div class="sw-top-center">
                    <div class="sw-top-chips-row" id="sw-mode-chips-row">
                        <button class="sw-chip ${STATE.mode === 'favorite' ? 'active' : ''}" data-mode="favorite">${t('modeFavorite')}</button>
                        <button class="sw-chip ${STATE.mode === 'stream' ? 'active' : ''}" data-mode="stream">${t('modeStream')}</button>
                        <button class="sw-chip ${STATE.mode === 'discovery' ? 'active' : ''}" data-mode="discovery">${t('modeDiscovery')}</button>
                    </div>
                    <button class="sw-shake-icon-btn" id="sw-btn-shake" title="${t('btnShake')}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="4" ry="4"/>
                            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                            <circle cx="16" cy="8" r="1.5" fill="currentColor"/>
                            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                            <circle cx="8" cy="16" r="1.5" fill="currentColor"/>
                            <circle cx="16" cy="16" r="1.5" fill="currentColor"/>
                        </svg>
                    </button>
                </div>

                <div class="sw-top-right">
                    <button class="sw-back-circle ${STATE.upNextOpen ? 'active' : ''}" id="sw-btn-upnext-toggle" title="${t('upNextTitle')}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="8" y1="6" x2="21" y2="6"></line>
                            <line x1="8" y1="12" x2="21" y2="12"></line>
                            <line x1="8" y1="18" x2="21" y2="18"></line>
                            <line x1="3" y1="6" x2="3.01" y2="6"></line>
                            <line x1="3" y1="12" x2="3.01" y2="12"></line>
                            <line x1="3" y1="18" x2="3.01" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <!-- "Up Next" queue side panel -->
            <aside class="sw-upnext-panel ${STATE.upNextOpen ? 'open' : ''}" id="sw-upnext-panel">
                <div class="sw-upnext-header">
                    <div class="sw-upnext-title">${t('upNextHeader')}</div>
                    <span class="sw-upnext-count" id="sw-upnext-count">0</span>
                </div>
                <div class="sw-upnext-list" id="sw-upnext-list">
                    <div class="sw-upnext-empty">${t('upNextEmpty')}</div>
                </div>
            </aside>
            <div class="sw-wrap">
                <!-- Centered player -->
                <div class="sw-hero-center">
                    <div class="sw-art-wrapper" id="sw-art-wrapper">
                        <canvas id="sw-wave-canvas" width="640" height="640"></canvas>
                        <!-- Square 220x220 cover; click opens the track in Spotify -->
                        <div class="sw-cover-card" id="sw-cover-card">
                            <img class="sw-cover-img" id="sw-cover-img" src="" alt="" />
                        </div>
                    </div>
                    <!-- Title and artist -->
                    <div class="sw-title-text" id="sw-hero-name">${t('waveTitle')}</div>
                    <div class="sw-artist-text" id="sw-hero-by">${t('waveSubtitle')}</div>
                    <div class="sw-ctrl-wrap">
                        <!-- Player buttons (no annoying popup tooltips) -->
                        <div class="sw-btn-bar">
                            <button class="sw-icon-btn" id="sw-btn-heart" aria-label="Like">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>
                            <!-- Back button (Previous) -->
                            <button class="sw-icon-btn" id="sw-btn-prev" aria-label="Previous">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="6,6 6,18 8,18 8,6"/>
                                    <polygon points="18,6 10,12 18,18"/>
                                </svg>
                            </button>
                            <!-- Play/Pause -->
                            <button class="sw-play-circle" id="sw-btn-play" aria-label="Play/Pause">
                                <svg id="sw-play-svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="6,4 20,12 6,20"/>
                                </svg>
                            </button>
                            <!-- Forward button (Next) -->
                            <button class="sw-icon-btn" id="sw-btn-next" aria-label="Next">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="6,6 14,12 6,18"/>
                                    <polygon points="16,6 18,6 18,18 16,18"/>
                                </svg>
                            </button>
                            <!-- Dislike button (Not for me) -->
                            <button class="sw-icon-btn dislike-btn" id="sw-btn-dislike" aria-label="Dislike">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                </svg>
                            </button>
                        </div>
                        <!-- Scrubber with timers and a volume icon on the right -->
                        <div class="sw-timeline">
                            <span class="sw-time-num" id="sw-cur-time">0:00</span>
                            <div class="sw-bar-bg" id="sw-bar-bg">
                                <div class="sw-bar-fill" id="sw-bar-fill"></div>
                            </div>
                            <span class="sw-time-num" id="sw-tot-time">0:00</span>
                            <!-- Volume icon without a background, right of the total time; bottom-up scale -->
                            <div class="sw-vol-popup-wrap" id="sw-vol-popup-wrap">
                                <button class="sw-vol-icon-btn" id="sw-btn-vol" aria-label="Volume">
                                    <svg id="sw-vol-icon" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                        <path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.64 3.64 0 0 1-1.33-4.967 3.64 3.64 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.14 2.14 0 0 0 0 3.7l5.8 3.35V2.8zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88"></path>
                                        <path d="M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127z"></path>
                                    </svg>
                                </button>
                                <div class="sw-vol-panel" id="sw-vol-panel">
                                    <div class="sw-vol-track" id="sw-vol-bar-bg">
                                        <div class="sw-vol-fill" id="sw-vol-bar-fill"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Bottom bar: smart wave settings separated and pinned to the bottom edge -->
                <div class="sw-bottom-bar" id="sw-bottom-bar">
                    <div class="sw-chips-row" id="sw-genre-chips-row">
                        <button class="sw-chip ${STATE.activeGenre === 'all' ? 'active' : ''}" data-genre="all">${t('allTracks')}</button>
                        <button class="sw-chip ${STATE.activeGenre === 'custom' ? 'active' : ''}" data-genre="custom" id="sw-btn-custom">${t('modeCustom')}</button>
                        
                        <button class="sw-browse-icon-btn" id="sw-btn-browse" title="${t('browseTitle')}">
                            <svg role="img" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                                <path d="M4 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4H4zM1.513 9.37A1 1 0 0 1 2.291 9H21.71a1 1 0 0 1 .978 1.208l-2.17 10.208A2 2 0 0 1 18.562 22H5.438a2 2 0 0 1-1.956-1.584l-2.17-10.208a1 1 0 0 1 .201-.837zM12 17.834c1.933 0 3.5-1.044 3.5-2.333s-1.567-2.333-3.5-2.333S8.5 14.21 8.5 15.5s1.567 2.333 3.5 2.333z"/>
                            </svg>
                        </button>
                ${renderPinnedGenreChipsHTML()}
                    </div>
                </div>
            </div>

            <!-- Custom wave settings modal in Spotify Dialog style (separate from sw-wrap) -->
            <div class="sw-custom-modal-backdrop" id="sw-custom-modal-backdrop">
                <div class="sw-custom-modal-card">
                    <div class="sw-custom-modal-header">
                        <div class="sw-custom-modal-title" id="sw-modal-title">${t('customModalTitle')}</div>
                        <button class="sw-custom-modal-close" id="sw-custom-modal-close" title="${t('customCloseBtn')}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="sw-custom-modal-body">
                        <div class="sw-modal-section-header">
                            <div class="sw-modal-section-title">${t('presetsSection')}</div>
                            <div class="sw-modal-actions">
                                <button class="sw-text-btn" id="sw-preset-new">${t('presetNew')}</button>
                                <button class="sw-text-btn" id="sw-preset-rename" style="display:none">${t('presetRename')}</button>
                                <button class="sw-text-btn sw-danger" id="sw-preset-delete" style="display:none">${t('presetDelete')}</button>
                            </div>
                        </div>
                        <div class="sw-preset-row" id="sw-preset-row"></div>
                        <div class="sw-modal-section-header">
                            <div class="sw-modal-section-title" id="sw-modal-pl-title">${t('customPlaylistsSection')}</div>
                            <div class="sw-modal-actions">
                                <button class="sw-text-btn" id="sw-pl-select-all">${t('customSelectAll')}</button>
                                <span class="sw-dot-sep">•</span>
                                <button class="sw-text-btn" id="sw-pl-deselect-all">${t('customDeselectAll')}</button>
                            </div>
                        </div>
                        <div class="sw-playlists-scroll" id="sw-playlists-container">
                            <div style="padding: 24px; text-align: center; color: #a7a7a7;">${t('customLoadingPlaylists')}</div>
                        </div>
                    </div>
                    <div class="sw-custom-modal-footer">
                        <div class="sw-pl-count-info" id="sw-pl-count-info"></div>
                        <button class="sw-modal-apply-btn" id="sw-custom-apply">${t('customApplyBtn')}</button>
                    </div>
                </div>
            </div>

            <!-- Spotify Browse modal (section and genre selection) -->
            <div class="sw-custom-modal-backdrop" id="sw-browse-modal-backdrop">
                <div class="sw-custom-modal-card">
                    <div class="sw-custom-modal-header">
                        <div class="sw-custom-modal-title">${t('browseModalTitle')}</div>
                        <button class="sw-custom-modal-close" id="sw-browse-modal-close" title="${t('customCloseBtn')}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="sw-custom-modal-body">
                        <div class="sw-modal-section-title" style="margin-bottom: 12px;">${t('browseModalSubtitle')}</div>
                        <div class="sw-browse-grid" id="sw-browse-grid"></div>
                    </div>
                </div>
            </div>

            <!-- Extension settings modal -->
            <div class="sw-custom-modal-backdrop" id="sw-settings-modal-backdrop">
                <div class="sw-custom-modal-card" style="width: clamp(420px, min(46vw, 60vh), 620px);">
                    <div class="sw-custom-modal-header">
                        <div class="sw-custom-modal-title">${t('settingsTitle')}</div>
                        <button class="sw-custom-modal-close" id="sw-settings-modal-close" title="${t('customCloseBtn')}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="sw-custom-modal-body">
                        <div class="sw-settings-row">
                            <span class="sw-settings-row-label">${t('settingsWaveEffect')}</span>
                            <button class="sw-toggle" id="sw-settings-wave-toggle" role="switch" aria-checked="true" title="${t('waveToggleOff')}">
                                <span class="sw-toggle-knob"></span>
                            </button>
                        </div>
                        <div class="sw-modal-section-title" style="margin: 18px 0 6px;">${t('settingsRegions')}</div>
                        <div style="font-size: 12.5px; color: #8a8a8a; margin-bottom: 14px; line-height: 1.45;">${t('settingsRegionsHint')}</div>
                        <div class="sw-settings-regions" id="sw-settings-regions"></div>
                        <div class="sw-settings-danger">
                            <div class="sw-settings-io">
                                <button class="sw-io-btn" id="sw-btn-export">${t('settingsExport')}</button>
                                <button class="sw-io-btn" id="sw-btn-import">${t('settingsImport')}</button>
                                <input type="file" id="sw-import-file" accept=".json,application/json" style="display:none" />
                            </div>
                            <button class="sw-reset-btn" id="sw-btn-reset-all">${t('settingsReset')}</button>
                        </div>
                    </div>
                </div>
            </div>

 </div>
        `;
        document.body.appendChild(overlayEl);
        overlayEl.querySelector("#sw-btn-back").onclick = () => hidePage();
        // Neat corner glow for the cover when the wave is off + Inner Glow in the wave core color
        applyCoverGlow = function() {
            const card = overlayEl?.querySelector("#sw-cover-card");
            if (!card) return;
            const ca = STATE.extractedColorA || [0.95, 0.12, 0.55];
            const glowR = Math.round(ca[0] * 255);
            const glowG = Math.round(ca[1] * 255);
            const glowB = Math.round(ca[2] * 255);

            if (STATE.waveEffectEnabled) {
                // Wave on: subtle inner core glow (25% opacity) + soft shadow
                card.style.setProperty('--sw-inner-glow', `inset 0 0 22px 3px rgba(${glowR}, ${glowG}, ${glowB}, 0.25)`);
                card.style.setProperty('--sw-inner-glow-border', `1px solid rgba(${glowR}, ${glowG}, ${glowB}, 0.12)`);
                card.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.25)";
            } else {
                // Wave off: inner glow COMPLETELY DISABLED on the cover
                card.style.setProperty('--sw-inner-glow', 'none');
                card.style.setProperty('--sw-inner-glow-border', 'none');

                const g = STATE.cornerGlow;
                if (g) {
                    card.style.boxShadow = `
                        -36px -36px 96px 12px ${g.tl},
                         36px -36px 96px 12px ${g.tr},
                         36px  36px 96px 12px ${g.br},
                        -36px  36px 96px 12px ${g.bl},
                        0 0 120px 18px ${g.dom},
                        0 14px 40px rgba(0, 0, 0, 0.75)
                    `.trim();
                } else {
                    card.style.boxShadow = "0 0 100px 14px rgba(255, 255, 255, 0.22)";
                }
            }
        };
        // Wave effect toggle (persisted to LocalStorage)
        function setWaveEffect(enabled) {
            STATE.waveEffectEnabled = enabled;
            try {
                Spicetify.LocalStorage?.set?.("smartWave_effect_enabled", enabled ? "true" : "false");
            } catch (err) {}
            const canvas = document.querySelector("#sw-wave-canvas");
            // Sync the settings-modal switch directly via DOM (no TDZ risk: it may not be initialized yet)
            const wt = overlayEl?.querySelector("#sw-settings-wave-toggle");
            if (wt) {
                wt.classList.toggle("on", enabled);
                wt.setAttribute("aria-checked", enabled ? "true" : "false");
                wt.title = enabled ? t("waveToggleOff") : t("waveToggleOn");
            }
            if (canvas) {
                canvas.style.display = enabled ? "block" : "none";
            }
            // Cover and spacing: synchronized equal distance to the title with wave ON and OFF
            const artWrapper = overlayEl?.querySelector("#sw-art-wrapper");
            const coverCard = overlayEl?.querySelector("#sw-cover-card");
            if (coverCard) {
                if (enabled) {
                    coverCard.style.width = "";
                    coverCard.style.height = "";
                    if (artWrapper) artWrapper.style.marginBottom = "";
                } else {
                    coverCard.style.width = "clamp(260px, min(40vh, 44vw), 760px)";
                    coverCard.style.height = "clamp(260px, min(40vh, 44vw), 760px)";
                    if (artWrapper) artWrapper.style.marginBottom = "clamp(32px, 4.5vh, 60px)";
                }
            }
            applyCoverGlow();
            if (enabled && STATE.pageVisible) {
                startWaveAnimation();
            } else {
                stopWaveAnimation();
            }
        }
        // Apply the saved effect state
        setWaveEffect(STATE.waveEffectEnabled);
        // Cover click: jump to the track in regular Spotify
        // Cover click opens the track source (playlist/album) but must not start playback when paused.
        const coverCardEl = overlayEl.querySelector("#sw-cover-card");
        if (coverCardEl) {
            coverCardEl.title = t('coverHint');
            coverCardEl.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const wasPlaying = isPlayerPlaying() || !!Spicetify.Player?.isPlaying?.();
                const item = Spicetify.Player?.data?.item;
                const contextUri = Spicetify.Player?.data?.context_uri
                    || Spicetify.Player?.data?.context?.uri
                    || item?.album?.uri
                    || item?.uri;
                let path = null;
                try { path = Spicetify.URI?.fromString?.(contextUri)?.toURLPath?.(); } catch {}
                if (!path && item?.uri) {
                    try { path = Spicetify.URI?.fromString?.(item.uri)?.toURLPath?.(); } catch {}
                }
                hidePage({ deferMs: 30000 });
                if (path && Spicetify.Platform?.History?.push) {
                    setTimeout(() => {
                        try { Spicetify.Platform.History.push({ pathname: "/" + String(path).replace(/^\/+/, "") }); } catch {}
                    }, 60);
                }
                if (!wasPlaying) {
                    const forcePause = () => {
                        try { if (isPlayerPlaying() || !!Spicetify.Player?.isPlaying?.()) Spicetify.Player?.pause?.(); } catch {}
                    };
                    setTimeout(forcePause, 180);
                    setTimeout(forcePause, 650);
                    setTimeout(forcePause, 1200);
                }
            };
        }
        overlayEl.querySelector("#sw-btn-play").onclick = () => {
            try {
                if (isPlayerPlaying()) Spicetify.Player?.pause?.();
                else Spicetify.Player?.play?.();
            } catch (err) {}
            updateUI();
        };
        overlayEl.querySelector("#sw-btn-next").onclick = () => skipWaveTrack(false);
        overlayEl.querySelector("#sw-btn-prev").onclick = prevWaveTrack;
        overlayEl.querySelector("#sw-btn-dislike").onclick = () => skipWaveTrack(true);
        overlayEl.querySelector("#sw-btn-heart").onclick = likeCurrentBranch;
        overlayEl.querySelector("#sw-btn-shake").onclick = shakeWave;
        // Seek by clicking the bar
        const barBg = overlayEl.querySelector("#sw-bar-bg");
        barBg.onclick = (e) => {
            const rect = barBg.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const dur = safeGetDuration();
            if (dur > 0) Spicetify.Player?.seek?.(Math.round(pct * dur));
        };
        // Volume control: popup vertical slider above the icon
        let lastNonZeroVolume = 0.8;
        function setPlayerVolume(pct) {
            pct = Math.max(0, Math.min(1, pct));
            try {
                const s = Spicetify.Platform?.PlaybackAPI?._playbackService;
                if (s?.setVolume) {
                    s.setVolume({ volume: pct });
                } else if (Spicetify.Player?.setVolume) {
                    Spicetify.Player.setVolume(pct);
                }
            } catch (err) {
                console.warn("[SmartWave] setVolume error:", err);
            }
        }

        updateVolumeUI = function() {
            const vol = Spicetify.Player?.getVolume?.() ?? 1;
            const fill = overlayEl?.querySelector("#sw-vol-bar-fill");
            const icon = overlayEl?.querySelector("#sw-vol-icon");
            if (fill) fill.style.height = `${Math.round(vol * 100)}%`;
            if (icon) {
                if (vol <= 0.005) {
                    icon.innerHTML = `<path d="M13.86 5.47a.75.75 0 0 0-1.061 0l-1.47 1.47-1.47-1.47A.75.75 0 0 0 8.8 6.53L10.269 8l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47 1.47 1.47a.75.75 0 0 0 1.06-1.06L12.39 8l1.47-1.47a.75.75 0 0 0 0-1.06"></path><path d="M10.116 1.5A.75.75 0 0 0 8.991.85l-6.925 4a3.64 3.64 0 0 0-1.33 4.967 3.64 3.64 0 0 0 1.33 1.332l6.925 4a.75.75 0 0 0 1.125-.649v-1.906a4.7 4.7 0 0 1-1.5-.694v1.3L2.817 9.852a2.14 2.14 0 0 1-.781-2.92c.187-.324.456-.594.78-.782l5.8-3.35v1.3c.45-.313.956-.55 1.5-.694z"></path>`;
                } else if (vol < 0.5) {
                    icon.innerHTML = `<path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.64 3.64 0 0 1-1.33-4.967 3.64 3.64 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.14 2.14 0 0 0 0 3.7l5.8 3.35V2.8zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88"></path>`;
                } else {
                    icon.innerHTML = `<path d="M9.741.85a.75.75 0 0 1 .375.65v13a.75.75 0 0 1-1.125.65l-6.925-4a3.64 3.64 0 0 1-1.33-4.967 3.64 3.64 0 0 1 1.33-1.332l6.925-4a.75.75 0 0 1 .75 0zm-6.924 5.3a2.14 2.14 0 0 0 0 3.7l5.8 3.35V2.8zm8.683 4.29V5.56a2.75 2.75 0 0 1 0 4.88"></path><path d="M11.5 13.614a5.752 5.752 0 0 0 0-11.228v1.55a4.252 4.252 0 0 1 0 8.127z"></path>`;
                }
            }
        };
        const volPopupWrap = overlayEl.querySelector("#sw-vol-popup-wrap");
        const volBar = overlayEl.querySelector("#sw-vol-bar-bg");
        if (volBar) {
            let isDraggingVol = false;
            let cachedBarRect = null;
            const setVolFromEvent = (e) => {
                if (!cachedBarRect) cachedBarRect = volBar.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, 1.0 - (e.clientY - cachedBarRect.top) / cachedBarRect.height));
                const fill = overlayEl?.querySelector("#sw-vol-bar-fill");
                if (fill) fill.style.height = `${pct * 100}%`;
                if (pct > 0.05) lastNonZeroVolume = pct;
                setPlayerVolume(pct);
                updateVolumeUI();
            };
            volBar.onmousedown = (e) => {
                e.stopPropagation();
                e.preventDefault();
                isDraggingVol = true;
                cachedBarRect = volBar.getBoundingClientRect();
                volPopupWrap?.classList.add("dragging");
                setVolFromEvent(e);
            };
            volBar.onclick = (e) => {
                e.stopPropagation();
                setVolFromEvent(e);
            };
            window.addEventListener("mousemove", (e) => {
                if (isDraggingVol) {
                    setVolFromEvent(e);
                }
            }, { passive: true });
            window.addEventListener("mouseup", () => {
                if (isDraggingVol) {
                    isDraggingVol = false;
                    cachedBarRect = null;
                    volPopupWrap?.classList.remove("dragging");
                    updateVolumeUI();
                }
            });
        }
        const volBtn = overlayEl.querySelector("#sw-btn-vol");
        if (volBtn) {
            volBtn.onclick = (e) => {
                e.stopPropagation();
                const curVol = Spicetify.Player?.getVolume?.() ?? 1;
                if (curVol > 0.01) {
                    lastNonZeroVolume = curVol;
                    setPlayerVolume(0);
                } else {
                    setPlayerVolume(lastNonZeroVolume || 0.8);
                }
                setTimeout(updateVolumeUI, 50);
            };
        }
        updateVolumeUI();
        // Toggle the "Up Next" side panel
        const upnextBtn = overlayEl.querySelector("#sw-btn-upnext-toggle");
        const upnextPanel = overlayEl.querySelector("#sw-upnext-panel");
        function updateUpNextState(isOpen) {
            STATE.upNextOpen = isOpen;
            Spicetify.LocalStorage.set("smartWave_upnext_open", isOpen ? "true" : "false");
            if (isOpen) {
                upnextPanel?.classList.add("open");
                upnextBtn?.classList.add("active");
                                renderUpNextList();
            } else {
                upnextPanel?.classList.remove("open");
                upnextBtn?.classList.remove("active");
                            }
        }
        if (upnextBtn && upnextPanel) {
            upnextBtn.onclick = () => {
                updateUpNextState(!STATE.upNextOpen);
            };
        }
        let modalSelectedPlaylists = new Set(STATE.customPlaylists || []);
        async function openCustomModal() {
            const modalBackdrop = overlayEl?.querySelector("#sw-custom-modal-backdrop");
            const container = overlayEl?.querySelector("#sw-playlists-container");
            const countInfo = overlayEl?.querySelector("#sw-pl-count-info");
            if (!modalBackdrop || !container) return;
            const storedActive = Spicetify.LocalStorage.get("smartWave_active_preset") || "default";
            modalActivePresetId = (storedActive !== "default" && STATE.customPresets.some(p => p.id === storedActive)) ? storedActive : "default";
            if (modalActivePresetId === "default") {
                const def = STATE.customDefault || { playlists: STATE.customPlaylists || [], subMode: STATE.customSubMode || "flow" };
                modalSelectedPlaylists = new Set(def.playlists || []);
            } else {
                const act = STATE.customPresets.find(p => p.id === modalActivePresetId);
                modalSelectedPlaylists = new Set(act?.playlists || []);
            }
            modalBackdrop.classList.add("open");
            renderPresetChips();
            // Dynamically sync submenu localization to Spotify's language
            const titleEl = overlayEl.querySelector("#sw-modal-title");
            if (titleEl) titleEl.textContent = t('customModalTitle');
            const submodeTitleEl = overlayEl.querySelector("#sw-modal-submode-title");
            if (submodeTitleEl) submodeTitleEl.textContent = t('customSubModeSection');
            const pillFlowName = overlayEl.querySelector("#sw-submode-name-flow");
            if (pillFlowName) pillFlowName.textContent = t('customSubModeFlowTitle');
            const pillFlowDesc = overlayEl.querySelector("#sw-submode-desc-flow");
            if (pillFlowDesc) pillFlowDesc.textContent = t('customSubModeFlowDesc');
            const pillDiscName = overlayEl.querySelector("#sw-submode-name-discovery");
            if (pillDiscName) pillDiscName.textContent = t('customSubModeDiscoveryTitle');
            const pillDiscDesc = overlayEl.querySelector("#sw-submode-desc-discovery");
            if (pillDiscDesc) pillDiscDesc.textContent = t('customSubModeDiscoveryDesc');
            const pillFavName = overlayEl.querySelector("#sw-submode-name-favorite");
            if (pillFavName) pillFavName.textContent = t('customSubModeFavoriteTitle');
            const pillFavDesc = overlayEl.querySelector("#sw-submode-desc-favorite");
            if (pillFavDesc) pillFavDesc.textContent = t('customSubModeFavoriteDesc');
            const plTitleEl = overlayEl.querySelector("#sw-modal-pl-title");
            if (plTitleEl) plTitleEl.textContent = t('customPlaylistsSection');
            const selectAllBtn = overlayEl.querySelector("#sw-pl-select-all");
            if (selectAllBtn) selectAllBtn.textContent = t('customSelectAll');
            const deselectAllBtn = overlayEl.querySelector("#sw-pl-deselect-all");
            if (deselectAllBtn) deselectAllBtn.textContent = t('customDeselectAll');
            const applyBtnEl = overlayEl.querySelector("#sw-custom-apply");
            if (applyBtnEl) applyBtnEl.textContent = t('customApplyBtn');
            // Sync the active mode from the active preset
            const activePresetObj = modalActivePresetId === "default"
                ? (STATE.customDefault || { subMode: STATE.customSubMode || "flow" })
                : STATE.customPresets.find(p => p.id === modalActivePresetId);
            const subMode = activePresetObj?.subMode || "flow";
            overlayEl.querySelectorAll(".sw-submode-pill").forEach(p => {
                if (p.getAttribute("data-submode") === subMode) {
                    p.classList.add("active");
                } else {
                    p.classList.remove("active");
                }
            });
            container.innerHTML = `<div style="padding: 24px; text-align: center; color: #a7a7a7;">${t('customLoadingPlaylists')}</div>`;
            let playlists = [];
            const likedSongsUri = Spicetify.Platform?.LibraryAPI?._likedSongsUri || "spotify:collection:tracks";
            playlists.push({
                uri: likedSongsUri,
                name: t('likedSongsPlaylistName'),
                type: "playlist",
                images: [{ url: "https://misc.scdn.co/liked-songs/liked-songs-300.png" }]
            });
            try {
                if (Spicetify.Platform?.RootlistAPI?.getContents) {
                    const res = await Spicetify.Platform.RootlistAPI.getContents({ limit: 150 });
                    function collectPlaylists(items) {
                        for (const it of (items || [])) {
                            if (it.type === "playlist" && it.uri !== likedSongsUri && it.uri !== "spotify:collection:tracks") {
                                playlists.push(it);
                            } else if (it.type === "folder" && Array.isArray(it.items)) {
                                collectPlaylists(it.items);
                            }
                        }
                    }
                    collectPlaylists(res?.items);
                }
            } catch (e) {
                console.warn("[SmartWave] Rootlist error", e);
            }
            if (playlists.length === 0) {
                container.innerHTML = `<div style="padding: 24px; text-align: center; color: #a7a7a7;">${t('customNoPlaylists')}</div>`;
                return;
            }
            const updateSelectedUI = () => {
                if (countInfo) countInfo.textContent = t('customSelectedCount', modalSelectedPlaylists.size);
                container.querySelectorAll(".sw-pl-item").forEach(item => {
                    const uri = item.getAttribute("data-uri");
                    if (modalSelectedPlaylists.has(uri)) {
                        item.classList.add("selected");
                    } else {
                        item.classList.remove("selected");
                    }
                });
            };
            container.innerHTML = playlists.map(pl => {
                const isSel = modalSelectedPlaylists.has(pl.uri);
                let imgUrl = "";
                if (pl.images && pl.images[0]) {
                    const raw = pl.images[0].url || "";
                    if (raw.startsWith("http")) imgUrl = raw;
                    else if (raw.startsWith("spotify:image:")) imgUrl = "https://i.scdn.co/image/" + raw.replace("spotify:image:", "");
                }
                return `
                    <div class="sw-pl-item ${isSel ? 'selected' : ''}" data-uri="${pl.uri}">
                        <div class="sw-pl-checkbox">
                            <svg class="sw-pl-check-svg" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.985 2.36a.75.75 0 0 1 .129 1.053l-8 10a.75.75 0 0 1-1.139.035l-3.5-4a.75.75 0 0 1 1.125-.996l2.907 3.322 7.425-9.284a.75.75 0 0 1 1.053-.13z"/>
                            </svg>
                        </div>
                        ${imgUrl ? `<img class="sw-pl-thumb" src="${imgUrl}" alt="" />` : `<div class="sw-pl-thumb sw-pl-thumb-placeholder"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15 4v12.18A4 4 0 1 1 12 13V8h-2V6h5z"/></svg></div>`}
                        <div class="sw-pl-info">
                            <div class="sw-pl-name">${pl.name || t('customPlaylistDefault')}</div>
                        </div>
                    </div>
                `;
            }).join("");
            container.querySelectorAll(".sw-pl-item").forEach(item => {
                item.onclick = () => {
                    const uri = item.getAttribute("data-uri");
                    if (modalSelectedPlaylists.has(uri)) {
                        modalSelectedPlaylists.delete(uri);
                    } else {
                        modalSelectedPlaylists.add(uri);
                    }
                    updateSelectedUI();
                };
            });
            if (selectAllBtn) {
                selectAllBtn.onclick = () => {
                    playlists.forEach(pl => modalSelectedPlaylists.add(pl.uri));
                    updateSelectedUI();
                };
            }
            if (deselectAllBtn) {
                deselectAllBtn.onclick = () => {
                    modalSelectedPlaylists.clear();
                    updateSelectedUI();
                };
            }
            updateSelectedUI();
        }
        const closeModal = () => {
            const backdrop = overlayEl?.querySelector("#sw-custom-modal-backdrop");
            backdrop?.classList.remove("open");
        };
        const modalCloseBtn = overlayEl.querySelector("#sw-custom-modal-close");
        if (modalCloseBtn) modalCloseBtn.onclick = closeModal;
        const modalBackdrop = overlayEl.querySelector("#sw-custom-modal-backdrop");
        if (modalBackdrop) {
            modalBackdrop.onclick = (e) => {
                if (e.target === modalBackdrop) closeModal();
            };
        }
        overlayEl.querySelectorAll(".sw-submode-pill").forEach(pill => {
            pill.onclick = () => {
                overlayEl.querySelectorAll(".sw-submode-pill").forEach(p => p.classList.remove("active"));
                pill.classList.add("active");
            };
        });
        const modalApplyBtn = overlayEl.querySelector("#sw-custom-apply");
        if (modalApplyBtn) {
            modalApplyBtn.onclick = async () => {
                const activePill = overlayEl.querySelector(".sw-submode-pill.active");
                const chosenSubMode = activePill?.getAttribute("data-submode") || "flow";
                STATE.customSubMode = chosenSubMode;
                Spicetify.LocalStorage.set("smartWave_custom_submode", chosenSubMode);
                // Apply writes ONLY to the selected preset; the wave's live state = its contents
                if (modalActivePresetId === "default") {
                    STATE.customDefault = { playlists: Array.from(modalSelectedPlaylists), subMode: chosenSubMode };
                    Spicetify.LocalStorage.set("smartWave_custom_default", JSON.stringify(STATE.customDefault));
                } else {
                    const activePreset = STATE.customPresets.find(p => p.id === modalActivePresetId);
                    if (activePreset) {
                        activePreset.playlists = Array.from(modalSelectedPlaylists);
                        activePreset.subMode = chosenSubMode;
                        saveCustomPresets();
                    }
                }
                Spicetify.LocalStorage.set("smartWave_active_preset", modalActivePresetId);
                STATE.customPlaylists = Array.from(modalSelectedPlaylists);
                Spicetify.LocalStorage.set("smartWave_custom_playlists", JSON.stringify(STATE.customPlaylists));
                STATE.customTracksCache = [];
                STATE.customArtistsCache = [];
                closeModal();
                STATE.activeGenre = "custom";
                Spicetify.LocalStorage.set("smartWave_active_genre", "custom");
                overlayEl.querySelectorAll(".sw-chip[data-genre]").forEach(c => c.classList.remove("active"));
                const customBtn = overlayEl.querySelector("#sw-btn-custom");
                customBtn?.classList.add("active");
                // Ensure the top Flow/Favorites/Discoveries chip stays active
                overlayEl.querySelectorAll(".sw-chip[data-mode]").forEach(c => {
                    c.classList.toggle("active", c.getAttribute("data-mode") === STATE.mode);
                });
                await regenerateQueue();
            };
        }
        // --- Custom wave presets ---
        let modalActivePresetId = "default";
        const saveCustomPresets = () => {
            try { Spicetify.LocalStorage.set("smartWave_custom_presets", JSON.stringify(STATE.customPresets)); } catch {}
        };
        const syncSubmodePills = (subMode) => {
            overlayEl.querySelectorAll(".sw-submode-pill").forEach(p => {
                p.classList.toggle("active", p.getAttribute("data-submode") === subMode);
            });
        };
        const syncPlaylistChecks = () => {
            const container = overlayEl.querySelector("#sw-playlists-container");
            const countInfo = overlayEl.querySelector("#sw-pl-count-info");
            container?.querySelectorAll(".sw-pl-item").forEach(item => {
                item.classList.toggle("selected", modalSelectedPlaylists.has(item.getAttribute("data-uri")));
            });
            if (countInfo) countInfo.textContent = t('customSelectedCount', modalSelectedPlaylists.size);
        };
        function renderPresetChips() {
            const row = overlayEl.querySelector("#sw-preset-row");
            if (!row) return;
            const chips = [{ id: "default", name: "Default" }, ...STATE.customPresets];
            row.innerHTML = "";
            for (const p of chips) {
                const chip = document.createElement("button");
                chip.className = "sw-preset-chip" + (modalActivePresetId === p.id ? " active" : "");
                chip.textContent = p.name;
                chip.onclick = () => {
                    modalActivePresetId = p.id;
                    if (p.id === "default") {
                        const def = STATE.customDefault || { playlists: STATE.customPlaylists || [], subMode: STATE.customSubMode || "flow" };
                        modalSelectedPlaylists = new Set(def.playlists || []);
                        syncSubmodePills(def.subMode || "flow");
                    } else {
                        modalSelectedPlaylists = new Set(p.playlists || []);
                        syncSubmodePills(p.subMode || "flow");
                    }
                    syncPlaylistChecks();
                    renderPresetChips();
                };
                if (p.id !== "default") {
                    chip.ondblclick = (e) => { e.stopPropagation(); startRenamePreset(chip, p); };
                }
                row.appendChild(chip);
            }
            const isDefault = modalActivePresetId === "default";
            const renameBtn = overlayEl.querySelector("#sw-preset-rename");
            const deleteBtn = overlayEl.querySelector("#sw-preset-delete");
            if (renameBtn) renameBtn.style.display = isDefault ? "none" : "";
            if (deleteBtn) deleteBtn.style.display = isDefault ? "none" : "";
        }
        const newPresetBtn = overlayEl.querySelector("#sw-preset-new");
        if (newPresetBtn) {
            newPresetBtn.onclick = () => {
                const preset = {
                    id: Date.now().toString(36),
                    name: "Preset " + (STATE.customPresets.length + 1),
                    playlists: Array.from(modalSelectedPlaylists),
                    subMode: overlayEl.querySelector(".sw-submode-pill.active")?.getAttribute("data-submode") || "flow"
                };
                STATE.customPresets.push(preset);
                saveCustomPresets();
                modalActivePresetId = preset.id;
                renderPresetChips();
            };
        }
        function startRenamePreset(chipEl, preset) {
            const input = document.createElement("input");
            input.className = "sw-preset-input";
            input.value = preset.name;
            chipEl.replaceChildren(input);
            chipEl.onclick = null;
            input.focus();
            input.select();
            const commit = () => {
                const v = input.value.trim();
                if (v) preset.name = v;
                saveCustomPresets();
                renderPresetChips();
            };
            input.onkeydown = (e) => {
                e.stopPropagation();
                if (e.key === "Enter") commit();
                if (e.key === "Escape") renderPresetChips();
            };
            input.onblur = commit;
            input.onclick = (e) => e.stopPropagation();
        }
        const renamePresetBtn = overlayEl.querySelector("#sw-preset-rename");
        if (renamePresetBtn) {
            renamePresetBtn.onclick = () => {
                const preset = STATE.customPresets.find(p => p.id === modalActivePresetId);
                if (!preset) return;
                const row = overlayEl.querySelector("#sw-preset-row");
                const idx = STATE.customPresets.indexOf(preset);
                const chipEl = row?.querySelectorAll(".sw-preset-chip")?.[idx + 1];
                if (chipEl) startRenamePreset(chipEl, preset);
            };
        }
        const deletePresetBtn = overlayEl.querySelector("#sw-preset-delete");
        if (deletePresetBtn) {
            deletePresetBtn.onclick = () => {
                const idx = STATE.customPresets.findIndex(p => p.id === modalActivePresetId);
                if (idx === -1) return;
                STATE.customPresets.splice(idx, 1);
                saveCustomPresets();
                modalActivePresetId = "default";
                const def = STATE.customDefault || { playlists: STATE.customPlaylists || [], subMode: STATE.customSubMode || "flow" };
                modalSelectedPlaylists = new Set(def.playlists || []);
                syncSubmodePills(def.subMode || "flow");
                syncPlaylistChecks();
                renderPresetChips();
            };
        }
        // Mode chips
                // --- Top mode switch (Favorites | Stream | Discoveries)
        overlayEl.querySelectorAll(".sw-chip[data-mode]").forEach(chip => {
            chip.onclick = async () => {
                const mode = chip.getAttribute("data-mode");
                if (STATE.mode === mode) return;
                STATE.mode = mode;
                Spicetify.LocalStorage.set("smartWave_mode", mode);
                overlayEl.querySelectorAll(".sw-chip[data-mode]").forEach(c => c.classList.remove("active"));
                chip.classList.add("active");

                if (mode === "discovery") {
                    const curCluster = STATE.activeCluster || identifyTrackCluster(STATE.currentTrack);
                    const defSeed = TASTE_CLUSTERS[curCluster]?.defaultSeed;
                    if (defSeed) {
                        STATE.currentSeedUri = defSeed.uri;
                        STATE.currentSeedArtist = defSeed.name;
                    }
                }

                await regenerateQueue(true);
            };
        });

        // --- Shake button in the top bar
        const topShakeBtn = overlayEl.querySelector("#sw-btn-shake");
        if (topShakeBtn) {
            topShakeBtn.onclick = () => shakeWave();
        }

        // --- Re-render genre chips in the bottom bar
        function refreshGenreChips() {
            const container = overlayEl.querySelector("#sw-genre-chips-row");
            if (!container) return;
            container.innerHTML = `
                <button class="sw-chip ${STATE.activeGenre === 'all' ? 'active' : ''}" data-genre="all">${t('allTracks')}</button>
                <button class="sw-chip ${STATE.activeGenre === 'custom' ? 'active' : ''}" data-genre="custom" id="sw-btn-custom">${t('modeCustom')}</button>
                
                <button class="sw-browse-icon-btn" id="sw-btn-browse" title="${t('browseTitle')}">
                    <svg role="img" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path d="M4 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4H4zM1.513 9.37A1 1 0 0 1 2.291 9H21.71a1 1 0 0 1 .978 1.208l-2.17 10.208A2 2 0 0 1 18.562 22H5.438a2 2 0 0 1-1.956-1.584l-2.17-10.208a1 1 0 0 1 .201-.837zM12 17.834c1.933 0 3.5-1.044 3.5-2.333s-1.567-2.333-3.5-2.333S8.5 14.21 8.5 15.5s1.567 2.333 3.5 2.333z"/>
                    </svg>
                </button>
                ${renderPinnedGenreChipsHTML()}
            `;
            wireGenreChips();
        }

        function wireGenreChips() {
            overlayEl.querySelectorAll(".sw-chip[data-genre]").forEach(chip => {
                chip.onclick = async () => {
                    const genre = chip.getAttribute("data-genre");

                    if (genre === "custom") {
                        if (STATE.activeGenre !== "custom") {
                            STATE.activeGenre = "custom";
                            Spicetify.LocalStorage.set("smartWave_active_genre", "custom");
                            overlayEl.querySelectorAll(".sw-chip[data-genre]").forEach(c => c.classList.remove("active"));
                            chip.classList.add("active");
                            openCustomModal();
                            await regenerateQueue(true);
                            return;
                        }
                        openCustomModal();
                        return;
                    }

                    if (STATE.activeGenre === genre) return;
                    STATE.activeGenre = genre;
                    Spicetify.LocalStorage.set("smartWave_active_genre", genre);
                    overlayEl.querySelectorAll(".sw-chip[data-genre]").forEach(c => c.classList.remove("active"));
                    chip.classList.add("active");

                    await regenerateQueue(true);
                };
            });

            const browseBtn = overlayEl.querySelector("#sw-btn-browse");
            if (browseBtn) {
                browseBtn.onclick = (e) => {
                    e.stopPropagation();
                    openBrowseModal();
                };
            }
        }

        // --- Spotify Browse modal
        function openBrowseModal() {
            const backdrop = overlayEl.querySelector("#sw-browse-modal-backdrop");
            const grid = overlayEl.querySelector("#sw-browse-grid");
            if (!backdrop || !grid) return;

            const lang = getLang();
            grid.innerHTML = Object.values(BROWSE_GENRES).map(cat => {
                const isPinned = (STATE.pinnedGenres || []).includes(cat.id);
                const name = cat.name?.[lang] || cat.name?.en || cat.id;
                const desc = cat.desc?.[lang] || cat.desc?.en || "";
                return `
                    <div class="sw-browse-card ${isPinned ? 'active' : ''}" data-cat-id="${cat.id}">
                        <div class="sw-browse-card-name">${name} ${isPinned ? '✓' : ''}</div>
                        <div class="sw-browse-card-desc">${desc}</div>
                    </div>
                `;
            }).join("");

            grid.querySelectorAll(".sw-browse-card").forEach(card => {
                card.onclick = () => {
                    const catId = card.getAttribute("data-cat-id");
                    let pinned = STATE.pinnedGenres || ["chill", "focus", "indie", "electronic", "rock", "hiphop"];
                    if (pinned.includes(catId)) {
                        pinned = pinned.filter(id => id !== catId);
                    } else {
                        pinned.push(catId);
                    }
                    STATE.pinnedGenres = pinned;
                    Spicetify.LocalStorage.set("smartWave_pinned_genres", JSON.stringify(pinned));
                    refreshGenreChips();
                    openBrowseModal();
                };
            });

            backdrop.classList.add("open");
        }

        const browseCloseBtn = overlayEl.querySelector("#sw-browse-modal-close");
        if (browseCloseBtn) {
            browseCloseBtn.onclick = () => {
                overlayEl.querySelector("#sw-browse-modal-backdrop")?.classList.remove("open");
            };
        }
        const browseBackdrop = overlayEl.querySelector("#sw-browse-modal-backdrop");
        if (browseBackdrop) {
            browseBackdrop.onclick = (e) => {
                if (e.target === browseBackdrop) browseBackdrop.classList.remove("open");
            };
        }

        // --- Settings modal (wave effect + regional filters) ---
        const waveToggle = overlayEl.querySelector("#sw-settings-wave-toggle");
        if (waveToggle) {
            waveToggle.onclick = () => setWaveEffect(!STATE.waveEffectEnabled);
        }
        function renderSettingsRegions() {
            const box = overlayEl.querySelector("#sw-settings-regions");
            if (!box) return;
            const lang = getLang();
            box.innerHTML = Object.entries(REGION_PRESETS).map(([id, p]) =>
                `<button class="sw-region-chip ${STATE.excludedRegions.includes(id) ? "active" : ""}" data-region="${id}">${p.label[lang] || p.label.en}</button>`
            ).join("");
            box.querySelectorAll(".sw-region-chip").forEach(chip => {
                chip.onclick = () => {
                    const rid = chip.getAttribute("data-region");
                    const idx = STATE.excludedRegions.indexOf(rid);
                    if (idx >= 0) STATE.excludedRegions.splice(idx, 1);
                    else STATE.excludedRegions.push(rid);
                    Spicetify.LocalStorage.set("smartWave_excluded_regions", JSON.stringify(STATE.excludedRegions));
                    chip.classList.toggle("active");
                };
            });
        }
        const settingsBtn = overlayEl.querySelector("#sw-btn-settings");
        const settingsBackdrop = overlayEl.querySelector("#sw-settings-modal-backdrop");
        if (settingsBtn && settingsBackdrop) {
            settingsBtn.onclick = () => {
                renderSettingsRegions();
                settingsBackdrop.classList.add("open");
            };
        }
        // Export/import all Smart Wave settings as JSON
        const exportBtn = overlayEl.querySelector("#sw-btn-export");
        const importBtn = overlayEl.querySelector("#sw-btn-import");
        const importFile = overlayEl.querySelector("#sw-import-file");
        if (exportBtn) {
            exportBtn.onclick = async () => {
                const data = {};
                Object.keys(localStorage)
                    .filter(k => k.startsWith("smartWave_"))
                    .forEach(k => { data[k] = localStorage.getItem(k); });
                const json = JSON.stringify(data, null, 2);
                let copied = false;
                try {
                    await navigator.clipboard.writeText(json);
                    copied = true;
                } catch {}
                try {
                    const blob = new Blob([json], { type: "application/json" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "smartwave-settings.json";
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
                } catch {}
                exportBtn.textContent = copied ? "✓" : t("settingsExport");
                setTimeout(() => { exportBtn.textContent = t("settingsExport"); }, 1600);
            };
        }
        if (importBtn && importFile) {
            importBtn.onclick = () => importFile.click();
            importFile.onchange = () => {
                const file = importFile.files?.[0];
                importFile.value = "";
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const data = JSON.parse(String(reader.result || ""));
                        if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("bad shape");
                        const entries = Object.entries(data).filter(([k, v]) => k.startsWith("smartWave_") && typeof v === "string");
                        if (!entries.length) throw new Error("no smartWave keys");
                        entries.forEach(([k, v]) => localStorage.setItem(k, v));
                        window.location.reload();
                    } catch (err) {
                        console.warn("[SmartWave] import failed:", err);
                        importBtn.textContent = t("settingsImportError");
                        setTimeout(() => { importBtn.textContent = t("settingsImport"); }, 2200);
                    }
                };
                reader.readAsText(file);
            };
        }
        // Danger zone: full settings wipe (two-click confirm)
        const resetBtn = overlayEl.querySelector("#sw-btn-reset-all");
        if (resetBtn) {
            let armed = false;
            let armTimer = null;
            resetBtn.onclick = () => {
                if (!armed) {
                    armed = true;
                    resetBtn.classList.add("confirm");
                    resetBtn.textContent = t("settingsResetConfirm");
                    clearTimeout(armTimer);
                    armTimer = setTimeout(() => {
                        armed = false;
                        resetBtn.classList.remove("confirm");
                        resetBtn.textContent = t("settingsReset");
                    }, 3000);
                    return;
                }
                clearTimeout(armTimer);
                try {
                    Object.keys(localStorage)
                        .filter(k => k.startsWith("smartWave_"))
                        .forEach(k => localStorage.removeItem(k));
                } catch (err) {
                    console.warn("[SmartWave] reset failed:", err);
                }
                window.location.reload();
            };
        }
        const settingsCloseBtn = overlayEl.querySelector("#sw-settings-modal-close");
        if (settingsCloseBtn) {
            settingsCloseBtn.onclick = () => settingsBackdrop?.classList.remove("open");
        }
        if (settingsBackdrop) {
            settingsBackdrop.onclick = (e) => {
                if (e.target === settingsBackdrop) settingsBackdrop.classList.remove("open");
            };
        }

        const customBackdrop = overlayEl.querySelector("#sw-custom-modal-backdrop");
        if (customBackdrop) {
            customBackdrop.onclick = (e) => {
                if (e.target === customBackdrop) customBackdrop.classList.remove("open");
            };
        }

        wireGenreChips();

        window.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && STATE.pageVisible) {
                hidePage();
            }
        });
    }
    function escapeHtml(s) {
        if (!s) return "";
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    function renderUpNextList() {
        const listEl = overlayEl?.querySelector("#sw-upnext-list");
        const countEl = overlayEl?.querySelector("#sw-upnext-count");
        if (!listEl) return;
        const tracks = STATE.upcomingWave || [];
        if (countEl) countEl.textContent = String(tracks.length);
        if (tracks.length === 0) {
            listEl.innerHTML = `<div class="sw-upnext-empty">${t('upNextEmpty')}</div>`;
            return;
        }
        listEl.innerHTML = tracks.map((track, idx) => `
            <div class="sw-upnext-item" data-index="${idx}" data-uri="${track.uri}">
                <img class="sw-upnext-thumb" loading="lazy" src="${track.thumb || track.image || ''}" alt="" />
                <div class="sw-upnext-meta">
                    <div class="sw-upnext-item-title">${escapeHtml(track.title || "Track")}</div>
                    <div class="sw-upnext-item-artist">${escapeHtml(track.artist || "Artist")}</div>
                </div>
                <span class="sw-upnext-num">${idx + 1}</span>
            </div>
        `).join("");
        listEl.querySelectorAll(".sw-upnext-item").forEach(itemEl => {
            itemEl.onclick = () => {
                const idx = parseInt(itemEl.getAttribute("data-index"), 10);
                playUpcomingIndex(idx);
            };
            const idx = parseInt(itemEl.getAttribute("data-index"), 10);
            const track = tracks[idx];
            if (track) {
                setMarqueeText(itemEl.querySelector(".sw-upnext-item-title"), track.title || "Track");
                setMarqueeText(itemEl.querySelector(".sw-upnext-item-artist"), track.artist || "Artist");
            }
        });
    }
    // Auto-hide the queue panel in small Spotify windows
    function handleWindowResize() {
        const isCompact = window.innerWidth < 760 || window.innerHeight < 550;
        const panel = overlayEl?.querySelector("#sw-upnext-panel");
        const btn = overlayEl?.querySelector("#sw-btn-upnext-toggle");
        if (isCompact) {
            if (panel?.classList.contains("open")) {
                panel.classList.remove("open");
                btn?.classList.remove("active");
                            }
        } else {
            if (STATE.upNextOpen && panel && !panel.classList.contains("open")) {
                panel.classList.add("open");
                btn?.classList.add("active");
                                renderUpNextList();
            }
        }
        alignTimelineToChips();
        refreshAllMarquees();
    }
    // Sleep-mode handler for Spotify window minimize / switch
    function onVisibilityChange() {
        if (document.hidden) {
            // Window hidden or minimized: immediately enter sleep mode (0% CPU / 0% GPU)
            stopWaveAnimation();
            stopProgressTimer();
        } else {
            // Window active again: instant wake-up (0 ms)
            if (STATE.pageVisible) {
                if (STATE.waveEffectEnabled) {
                    startWaveAnimation();
                }
                startProgressTimer();
                updateUI();
                renderUpNextList();
            }
        }
        alignTimelineToChips();
    }
    // Entering the window: shows the overlay. If the wave is already live (grace after cover navigation) - just resumes the UI without rebuilding the queue.
    function showPage() {
        clearCloseGraceTimer();
        createOverlayDOM();
        overlayEl.classList.add("visible");
        const isCompact = window.innerWidth < 760 || window.innerHeight < 550;
        if (STATE.upNextOpen && !isCompact) {
                    } else {
                    }
        STATE.pageVisible = true;
        if (!STATE.active) {
            startWave();
        } else {
            updateNavButtonActive(true);
        }
        startProgressTimer();
        if (STATE.waveEffectEnabled) {
            startWaveAnimation();
        }
        updateUI();
        renderUpNextList();
    }
    function clearCloseGraceTimer() {
        if (STATE.closeGraceTimer) {
            clearTimeout(STATE.closeGraceTimer);
            STATE.closeGraceTimer = null;
        }
    }
    // Leaving the window: stops the wave immediately by default; with deferMs keeps the mode alive for N more ms.
    function hidePage(options) {
        if (!overlayEl) return;
        const deferMs = Number(options?.deferMs || 0);
        clearCloseGraceTimer();
        overlayEl.classList.remove("visible");
        STATE.pageVisible = false;
        stopProgressTimer();
        stopWaveAnimation();
        if (deferMs > 0) {
            STATE.active = true;
            updateNavButtonActive(true);
            STATE.closeGraceTimer = setTimeout(() => {
                STATE.closeGraceTimer = null;
                stopWave();
            }, deferMs);
        } else {
            stopWave();
        }
    }
    function togglePage() {
        if (STATE.pageVisible) hidePage();
        else showPage();
    }
    function resetProgressUI() {
        const fill = overlayEl?.querySelector("#sw-bar-fill");
        const curT = overlayEl?.querySelector("#sw-cur-time");
        const totT = overlayEl?.querySelector("#sw-tot-time");
        if (fill) fill.style.width = "0%";
        if (curT) curT.textContent = "0:00";
        if (totT) totT.textContent = formatTime(STATE.currentTrack?.duration || safeGetDuration());
    }
    function startProgressTimer() {
        stopProgressTimer();
        const fill = overlayEl?.querySelector("#sw-bar-fill");
        const curT = overlayEl?.querySelector("#sw-cur-time");
        const totT = overlayEl?.querySelector("#sw-tot-time");
        STATE.progressInterval = setInterval(() => {
            if (!STATE.pageVisible) return;
            const trackDuration = STATE.currentTrack?.duration || 0;
            let duration = safeGetDuration();
            if ((!duration || duration <= 0 || (trackDuration > 0 && Math.abs(duration - trackDuration) > 30000)) && trackDuration > 0) {
                duration = trackDuration;
            }
            let progress = safeGetProgress();
            if (trackDuration > 0 && progress > duration + 3000) {
                progress = 0;
            }
            if (duration > 0) {
                const pct = Math.max(0, Math.min(100, (progress / duration) * 100));
                if (fill) fill.style.width = `${pct}%`;
                if (curT) curT.textContent = formatTime(Math.min(progress, duration));
                if (totT) totT.textContent = formatTime(duration);
            }
            // Soft track-change check: run the full onSongChange to reset progress and queue
            const cur = Spicetify.Player?.data?.item;
            if (cur && cur.uri !== STATE.currentTrack?.uri) {
                onSongChange();
            }
        }, 250);
    }
    function stopProgressTimer() {
        if (STATE.progressInterval) {
            clearInterval(STATE.progressInterval);
            STATE.progressInterval = null;
        }
    }
        // Align the progress bar edges strictly to the chip button edges:
    // left part (0:00) exactly above the left edge of "Stream", right part (volume) exactly above the right edge of "Shake"
    function alignTimelineToChips() {
        const firstChip = overlayEl?.querySelector(".sw-chips-row .sw-chip:first-child");
        const lastChip = overlayEl?.querySelector("#sw-btn-shake");
        const timeline = overlayEl?.querySelector(".sw-timeline");
        if (firstChip && lastChip && timeline) {
            const fRect = firstChip.getBoundingClientRect();
            const lRect = lastChip.getBoundingClientRect();
            const targetSpan = lRect.right - fRect.left;
            if (targetSpan > 150) {
                timeline.style.maxWidth = "none";
                timeline.style.width = targetSpan + "px";
            }
        }
    }
    function setMarqueeText(el, value) {
        if (!el) return;
        const plain = String(value ?? "");
        if (el.getAttribute("data-text") !== plain) {
            el.setAttribute("data-text", plain);
            el.innerHTML = `<span class="sw-marquee-inner">${escapeHtml(plain)}</span>`;
        }
        requestAnimationFrame(() => refreshMarquee(el));
    }
    function refreshMarquee(el) {
        if (!el) return;
        const inner = el.querySelector(".sw-marquee-inner");
        if (!inner) return;
        el.classList.remove("sw-marquee-active");
        inner.style.removeProperty("--sw-marquee-distance");
        inner.style.removeProperty("--sw-marquee-duration");
        const distance = inner.scrollWidth - el.clientWidth;
        if (distance > 8) {
            const duration = Math.min(18, Math.max(6, distance / 45));
            inner.style.setProperty("--sw-marquee-distance", `${distance}px`);
            inner.style.setProperty("--sw-marquee-duration", `${duration}s`);
            el.classList.add("sw-marquee-active");
        }
    }
    function refreshAllMarquees() {
        refreshMarquee(overlayEl?.querySelector("#sw-hero-name"));
        overlayEl?.querySelectorAll(".sw-upnext-item-title, .sw-upnext-item-artist").forEach(refreshMarquee);
    }
    async function updateUI() {
        if (!overlayEl) return;
        renderUpNextList();
        alignTimelineToChips();
        // Sync mode chips
        overlayEl.querySelectorAll(".sw-chip[data-mode]").forEach(c => {
            if (c.getAttribute("data-mode") === STATE.mode) {
                c.classList.add("active");
            } else {
                c.classList.remove("active");
            }
        });
        // Play/Pause icon
        const playSvg = overlayEl.querySelector("#sw-play-svg");
        if (isPlayerPlaying()) {
            playSvg.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
        } else {
            playSvg.innerHTML = `<polygon points="6,4 20,12 6,20"/>`;
        }
        // Heart (Like) - sync with the native state
        const heartBtn = overlayEl.querySelector("#sw-btn-heart");
        let isLiked = false;
        try {
            isLiked = Spicetify.Player?.getHeart?.();
        } catch {
            isLiked = false;
        }
        if (isLiked) {
            heartBtn?.classList.add("heart-active");
            if (heartBtn) {
                heartBtn.innerHTML = `
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                `;
            }
        } else {
            heartBtn?.classList.remove("heart-active");
            if (heartBtn) {
                heartBtn.innerHTML = `
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                `;
            }
        }
        // Current track data
        const cur = Spicetify.Player?.data?.item;
        const nameEl = overlayEl.querySelector("#sw-hero-name");
        const artistEl = overlayEl.querySelector("#sw-hero-by");
        const imgEl = overlayEl.querySelector("#sw-cover-img");
        if (cur) {
            const title = fixMojibake(cur.name) || "Untitled";
            const artist = fixMojibake(cur.artists?.[0]?.name) || "Artist";
            const rawImg = cur.metadata?.image_url || "";
            const img = getTrackImages(cur).image || resolveImageUrl(rawImg);
            setMarqueeText(nameEl, title);
            setMarqueeText(artistEl, artist);
            if (img && (imgEl.src !== img || STATE.lastExtractedImg !== img)) {
                imgEl.src = img;
                STATE.lastExtractedImg = img;
                // Extract the two-color palette with caching
                extractAdaptiveWaveTheme(img).then(theme => {
                    if (theme && theme.colorA && theme.colorB) {
                        STATE.extractedColorA = theme.colorA;
                        STATE.extractedColorB = theme.colorB;
                        STATE.extractedOpacity = theme.opacity || 1.0;
                        STATE.cornerGlow = theme.cornerGlow;
                        applyCoverGlow();
                    }
                });
            }
        }
    }
    // -------------------------------------------------------------------------
    // WAVE BUTTON NEXT TO HOME (48x48px)
    // -------------------------------------------------------------------------
    function updateNavButtonActive(isActive) {
        const btn = document.querySelector("#sw-home-nav-btn");
        if (!btn) return;
        btn.style.color = isActive ? "#1ed760" : "";
    }
    function mountNavButton() {
        const home = document.querySelector("[aria-label*='Home' i], [aria-label*='Главная' i]");
        if (!home || !home.parentElement) return;
        if (document.querySelector("#sw-home-nav-btn")) return;
        const btn = document.createElement("button");
        btn.id = "sw-home-nav-btn";
        btn.setAttribute("aria-label", "Smart Wave");
        btn.setAttribute("title", "Smart Wave");
        // Clone the Home button's native classes: color/background/hover inherit from the Spotify theme
        btn.className = home.className.replace(/main-globalNav-navLinkActive/g, "");
        btn.style.border = "none";
        btn.style.color = STATE.active ? "#1ed760" : "";
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M2 12h1.5M6.5 8v8M11 4v16M15.5 7v10M20 9v6"/>
            </svg>
        `;
        btn.onclick = () => {
            togglePage();
        };
        // Smart Wave sits BEFORE the home icon (left of Home)
        home.insertAdjacentElement("beforebegin", btn);
    }    function init() {
        mountNavButton();
        const navMountInterval = setInterval(() => {
            if (document.getElementById("sw-home-nav-btn")) {
                clearInterval(navMountInterval);
                return;
            }
            mountNavButton();
        }, 300);
        let navMountDebounce = null;
        const observer = new MutationObserver(() => {
            if (document.getElementById("sw-home-nav-btn")) return;
            if (navMountDebounce) return;
            navMountDebounce = setTimeout(() => {
                navMountDebounce = null;
                mountNavButton();
            }, 250);
        });
        observer.observe(document.body, { childList: true, subtree: true });
        Spicetify.Player?.addEventListener?.("songchange", onSongChange);
        Spicetify.Player?.addEventListener?.("onplaypause", () => updateUI());
        Spicetify.Player?.addEventListener?.("onvolume", () => updateVolumeUI());
        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("resize", handleWindowResize);
    }
    init();
    setTimeout(prewarmArtistGraph, 5000);
    console.log("[SmartWave] initialized.");
})();