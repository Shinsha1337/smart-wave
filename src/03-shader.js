    // =========================================================================
    async function shakeWave() {
        await loadComfortPool();
        const likedUris = new Set((STATE.comfortPool || []).map(t => t.uri));

        let anchorTrack = null;
        let toastLabel = "";

        // 1. If a specific genre from Browse is active (Chill, Focus, Indie...)
        if (STATE.activeGenre && STATE.activeGenre !== "all" && STATE.activeGenre !== "custom") {
            const genreTracks = await loadGenreTracks(STATE.activeGenre);
            const def = BROWSE_GENRES[STATE.activeGenre];
            toastLabel = def?.name || STATE.activeGenre;

            if (genreTracks && genreTracks.length > 0) {
                if (STATE.mode === "discovery") {
                    const freshPool = genreTracks.filter(t => !likedUris.has(t.uri) && !STATE.history.has(t.uri));
                    if (freshPool.length > 0) anchorTrack = freshPool[Math.floor(Math.random() * freshPool.length)];
                } else if (STATE.mode === "favorite") {
                    const favPool = STATE.comfortPool.filter(t => identifyTrackCluster(t) === STATE.activeGenre && !STATE.history.has(t.uri));
                    if (favPool.length > 0) anchorTrack = favPool[Math.floor(Math.random() * favPool.length)];
                } else {
                    const pool = genreTracks.filter(t => !STATE.history.has(t.uri));
                    if (pool.length > 0) anchorTrack = pool[Math.floor(Math.random() * pool.length)];
                }
            }
        }
        // 2. If Custom mode is active
        else if (STATE.activeGenre === "custom") {
            const tracks = await loadCustomTracksCache();
            toastLabel = t('modeCustom');
            if (tracks && tracks.length > 0) {
                const pool = tracks.filter(t => !STATE.history.has(t.uri));
                anchorTrack = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : tracks[0];
            }
        }
        // 3. "All tracks" mode: orthogonal cluster jump
        else {
            const curCluster = identifyTrackCluster(STATE.currentTrack || { artist: STATE.currentSeedArtist });
            const clusterKeys = Object.keys(TASTE_CLUSTERS);

            const otherClusters = clusterKeys.filter(k => k !== curCluster && k !== lastActiveCluster);
            const targetClusterKey = otherClusters.length > 0
                ? otherClusters[Math.floor(Math.random() * otherClusters.length)]
                : clusterKeys.find(k => k !== curCluster) || "indie";

            lastActiveCluster = targetClusterKey;
            STATE.activeCluster = targetClusterKey;
            const targetCluster = TASTE_CLUSTERS[targetClusterKey];
            toastLabel = getLang() === "ru" ? targetCluster.ruLabel : targetCluster.label;

            if (STATE.mode === "discovery") {
                const seed = targetCluster.defaultSeed;
                const graph = await getArtistGraph(seed?.uri);
                for (const rel of (graph?.related || []).slice(0, 5)) {
                    if (anchorTrack) break;
                    const rg = await getArtistGraph(rel.uri);
                    const fresh = (rg?.topTracks || []).filter(t => !likedUris.has(t.uri) && !STATE.history.has(t.uri));
                    if (fresh.length > 0) anchorTrack = { ...fresh[0], seedUri: rel.uri, seedArtist: rel.name };
                }
            } else {
                const clusterPool = STATE.comfortPool.filter(t => identifyTrackCluster(t) === targetClusterKey && !STATE.history.has(t.uri));
                if (clusterPool.length > 0) {
                    anchorTrack = clusterPool[Math.floor(Math.random() * clusterPool.length)];
                }
            }
        }

        // Show a concise status, strictly without emoji
        

        STATE.upcomingWave = [];
        if (anchorTrack) {
            STATE.currentSeedUri = anchorTrack.artistUri || anchorTrack.seedUri || STATE.currentSeedUri;
            STATE.currentSeedArtist = anchorTrack.artist || anchorTrack.seedArtist || STATE.currentSeedArtist;
        }

        if (anchorTrack && anchorTrack.uri) {
            if (STATE.currentTrack) {
                STATE.historyStack.push(STATE.currentTrack);
                if (STATE.historyStack.length > 50) STATE.historyStack.shift();
            }
            try {
                if (Spicetify.Player?.playUri) await Spicetify.Player.playUri(anchorTrack.uri, {});
            } catch (err) {}
            STATE.currentTrack = anchorTrack;
            STATE.history.add(anchorTrack.uri);
            resetProgressUI();
            updateUI();
            await ensureWaveQueue(true);
            renderUpNextList();
            syncNativeQueue();
        } else {
            await skipWaveTrack(false);
        }
    }

    function likeCurrentBranch() {
        const heartBtn = overlayEl?.querySelector("#sw-btn-heart");
        const wasLiked = heartBtn?.classList.contains("heart-active");
        const willBeLiked = !wasLiked;
        if (heartBtn) {
            if (willBeLiked) {
                heartBtn.classList.add("heart-active");
                heartBtn.innerHTML = `
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                `;
            } else {
                heartBtn.classList.remove("heart-active");
                heartBtn.innerHTML = `
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                `;
            }
        }
        Spicetify.Player?.toggleHeart?.();
        if (STATE.currentTrack) {
            if (willBeLiked) {
                addLikedTrack(STATE.currentTrack, 2);
                if (!STATE.comfortPool.some(t => t.uri === STATE.currentTrack.uri)) {
                    STATE.comfortPool.unshift(STATE.currentTrack);
                }
            } else {
                penalizeTrack(STATE.currentTrack, 2);
                STATE.comfortPool = STATE.comfortPool.filter(t => t.uri !== STATE.currentTrack.uri);
            }
        }
    }
    // Song change listener
    async function onSongChange() {
        if (!STATE.active) return;
        const now = Date.now();
        const prevTrack = STATE.currentTrack;
        const elapsed = (now - STATE.currentTrackStartTime) / 1000;
        const trackDur = prevTrack?.duration || 0;
        const lastProg = STATE.lastObservedProgress || 0;
        const reachedEnd = trackDur > 0 && (
            (lastProg / trackDur >= 0.85) ||
            (trackDur - lastProg <= 15000)
        );

        if (prevTrack && STATE.currentTrackStartTime > 0 && elapsed > 2) {
            if (reachedEnd || elapsed >= CONFIG.LIKE_THRESHOLD_SEC) {
                // Listened to >= 90s (1m 30s) or naturally completed: +1 point to this track!
                addLikedTrack(prevTrack, 1);
            } else if (elapsed < CONFIG.SKIP_THRESHOLD_SEC) {
                // Fast skip under 30s: -1 point penalty to this track, artist is NOT penalized!
                // Real library favorites (and scored tracks) are NEVER penalized by skips.
                const isLibrary = (STATE.comfortPool || []).some(t => t.uri === prevTrack.uri);
                if (!isLibrary && !STATE.likedTracks.has(prevTrack.uri)) {
                    penalizeTrack(prevTrack, 1);
                }
            }
            // 30s to 90s: neutral (0 points)
        }
        STATE.lastObservedProgress = 0;
        const cur = Spicetify.Player?.data?.item;
        if (cur) {
            const curArtist = fixMojibake(cur.artists?.[0]?.name) || "Artist";
            const curArtistUri = cur.artists?.[0]?.uri || null;
            const curTitle = fixMojibake(cur.name) || "Untitled";
            const curImages = getTrackImages(cur);
            const curImage = curImages.image || resolveImageUrl(cur.metadata?.image_url || "");
            STATE.currentTrack = {
                uri: cur.uri,
                title: curTitle,
                artist: curArtist,
                artistUri: curArtistUri,
                image: curImage,
                thumb: curImages.thumb || curImage,
                duration: cur.duration?.milliseconds || safeGetDuration(),
            };
            STATE.currentTrackStartTime = now;
            STATE.history.add(cur.uri);
            // Immediately start color extraction for the new track
            if (curImage && STATE.lastExtractedImg !== curImage) {
                STATE.lastExtractedImg = curImage;
                extractAdaptiveWaveTheme(curImage).then(theme => {
                    if (theme && theme.colorA && theme.colorB) {
                        STATE.extractedColorA = theme.colorA;
                        STATE.extractedColorB = theme.colorB;
                        STATE.extractedOpacity = theme.opacity || 1.0;
                        STATE.cornerGlow = theme.cornerGlow;
                        applyCoverGlow();
                    }
                });
            }
            if (curArtistUri) {
                STATE.currentSeedUri = curArtistUri;
                STATE.currentSeedArtist = curArtist;
            }
            STATE.upcomingWave = STATE.upcomingWave.filter(t => t.uri !== cur.uri);
        }
        resetProgressUI();
        updateUI();
        triggerEnsureWaveQueue();
    }
    // -------------------------------------------------------------------------
    // HARDWARE WEBGL LIQUID-WAVE SHADER (FLUID LIQUID-WAVE STYLE, 60-144 FPS)
    // -------------------------------------------------------------------------
    let glContext = null;
    let glProgram = null;
    let glLocations = null;
        function initWebGL(canvas) {
        if (!canvas) return;
        const gl = canvas.getContext("webgl", { alpha: true, antialias: true, depth: false });
        if (!gl) return;
        glContext = gl;
        const vsSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;
        // Single cover-color shader (v0.1) with silky sheen (Sine Waves) and thin needle rays
        const fsSource = `
            precision mediump float;
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec3 u_color;       // Single color extracted from the cover
            uniform float u_playState;  // 0 = pause, 1 = play
            uniform float u_zoom;       // Zoom scale (0.70)
            uniform float u_warp;       // Warp strength (0.85)
            uniform float u_godRays;    // Light rays (1.20)
            uniform float u_glow;       // Aura glow (0.55)
            float hash(vec2 p) {
                p = fract(p * vec2(123.34, 456.21));
                p += dot(p, p + 45.32);
                return fract(p.x * p.y);
            }
            float vnoise(vec2 p) {
                vec2 i = floor(p), f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                           mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
            }
            float fbm(vec2 p) {
                float v = 0.0;
                v += 0.500 * vnoise(p); p = p * 2.02 + vec2(1.3, 2.7);
                v += 0.250 * vnoise(p); p = p * 2.03 + vec2(3.5, 1.1);
                v += 0.125 * vnoise(p);
                return v / 0.875;
            }
            // Directional wave crests (folds and plasma streams inside the blob)
            float waveCrest(vec2 p, float angle, float freq, float speed, float t) {
                vec2 dir = vec2(cos(angle), sin(angle));
                float phase = dot(p, dir) * freq - t * speed;
                float w = 0.5 + 0.5 * sin(phase);
                return pow(w, 2.4);
            }
            // Soft sinusoidal caustics (silky iridescence / light sheen without singularities or division by 0)
            float sineCaustics(vec2 uv, float t) {
                vec2 p = uv * 3.6;
                vec2 i = p;
                float c = 0.0;
                for (int n = 0; n < 3; n++) {
                    float nt = t * (0.85 + float(n) * 0.22);
                    i = p + vec2(cos(nt - i.x) + sin(nt + i.y), sin(nt - i.y) + cos(nt + i.x));
                    // Safe sinusoidal interference: 0% divisions, 0% NaN flashes
                    float w = sin(i.x + nt) * cos(i.y - nt);
                    c += pow(0.5 + 0.5 * w, 2.2);
                }
                c /= 3.0;
                return pow(clamp(c, 0.0, 1.0), 2.5);
            }
            // Ultra-thin needle ray (protected against pow(0.0) and domain error)
            float needleRay(float angle, float targetAngle, float powExponent, float life, float reachExp, float dBlob, float dist) {
                float diff = cos(angle - targetAngle);
                float rayProfile = diff > 0.0001 ? pow(diff, powExponent) : 0.0;
                float originFade = smoothstep(-0.15, 0.08, dBlob);
                float reach = exp(-max(0.0, dist - 0.25) * reachExp);
                return rayProfile * life * originFade * reach;
            }
            void main() {
                vec2 rawP = (gl_FragCoord.xy - 0.5 * u_resolution) / (0.5 * min(u_resolution.x, u_resolution.y));
                float r = length(rawP);
                if (r > 0.995) { gl_FragColor = vec4(0.0); return; }
                float zoomFactor = max(0.5, u_zoom * mix(0.90, 1.0, u_playState));
                vec2 p = rawP / zoomFactor;
                float dist = length(p);
                float t = u_time * 0.70;
                // Domain Warping: organic distortion of 2D space
                vec2 q = vec2(
                    fbm(p * 1.5 + vec2(0.0, t * 0.16)),
                    fbm(p * 1.5 + vec2(5.2, 1.3) + vec2(t * 0.13, 0.0))
                ) - 0.5;
                vec2 r_warp = vec2(
                    fbm(p * 1.7 + 2.4 * q + vec2(1.7, 9.2) + vec2(0.0, t * 0.15)),
                    fbm(p * 1.7 + 2.4 * q + vec2(8.3, 2.8) + vec2(t * 0.12, 0.0))
                ) - 0.5;
                // Asymmetric plume protrusion toward the upper right
                float plumeAngle = dot(normalize(p + vec2(0.0001)), normalize(vec2(0.85, 0.75)));
                float plume = smoothstep(0.0, 0.95, plumeAngle) * 0.22;
                // Protective cushion around the cover: softer warp near the center so the wave is guaranteed to wrap all corners
                float warpCushion = smoothstep(0.18, 0.62, dist);
                float warpAmt = u_warp * 0.52;
                vec2 warpedP = p + (r_warp * (warpAmt * (0.65 + 0.35 * warpCushion))) - (vec2(0.10, 0.08) * plume);
                float waveDist = length(warpedP);
                // === LIVING WAVES IN THE MIDDLE (WAVE SWELLS & FOLDS) ===
                // 1. Radial-spiral wave swells rolling from the center outward
                float swell = sin(waveDist * 8.0 - t * 1.5 + q.x * 3.0);
                float waveSwell = pow(0.5 + 0.5 * swell, 1.8);
                // 2. Diagonal folds of flowing plasma
                float ridge1 = waveCrest(warpedP + q * 0.4, 0.85, 5.5, 1.4, t);
                float ridge2 = waveCrest(warpedP - q * 0.3, -0.65, 4.8, 1.1, t);
                float waveFolds = (waveSwell * 0.40 + ridge1 * 0.38 + ridge2 * 0.22);
                // Base blob radius (0.60 guarantees full coverage of all 4 cover corners in any phase)
                float targetRadius = (0.60 + plume * 0.55 + waveFolds * 0.07) * mix(0.88, 1.0, u_playState);
                float d = waveDist - targetRadius;
                // SINGLE WAVE COLOR FROM THE COVER
                vec3 baseColor = u_color;
                // Light volumetric sheen on wave crests of the same tone
                vec3 sheenColor = mix(u_color, vec3(1.0), 0.40);
                // Deep shade in wave troughs
                vec3 depthColor = u_color * 0.60;
                // Inner light iridescence and caustic sheen
                float inside = smoothstep(0.03, -0.22, d);
                float caust = sineCaustics(warpedP * 1.1 + q * 0.35, t);
                // Inner volume: light play on waves and folds (a living medium, not a flat fill!)
                vec3 interiorColor = mix(depthColor, baseColor, smoothstep(0.1, 0.8, waveFolds));
                interiorColor += sheenColor * (waveFolds * 0.38 * inside);
                interiorColor += sheenColor * (caust * 0.45 * inside);
                // Soft edges and neon haze of the single color
                float edgeAlpha = smoothstep(0.03, -0.06, d);
                float glow = exp(-max(d, 0.0) * 5.6) * (1.0 - edgeAlpha);
                float halo = exp(-max(d, 0.0) * 2.3) * 0.28 * (1.0 - edgeAlpha);
                float effGlow = (u_glow / 0.45) * mix(0.40, 1.0, u_playState);
                vec3 bodyCol = interiorColor * edgeAlpha + baseColor * (glow * 0.75 * effGlow + halo * 0.45);
                // Ultra-thin inscribed rays in the wave color with a delicate sheen
                float warpAngle = atan(warpedP.y, warpedP.x + 0.00001);
                float l1 = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(t * 0.55 + 0.4));
                float ray1 = needleRay(warpAngle, 0.85, 450.0, l1, 1.1, d, dist) * 1.4;
                float l2 = smoothstep(0.15, 0.85, 0.5 + 0.5 * cos(t * 0.75 + 1.8));
                float ray2 = needleRay(warpAngle, 1.85, 600.0, l2, 3.2, d, dist) * 0.8;
                float l3 = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(t * 0.45 + 3.1));
                float ray3 = needleRay(warpAngle, 2.80, 400.0, l3, 1.3, d, dist) * 1.2;
                float l4 = smoothstep(0.15, 0.85, 0.5 + 0.5 * cos(t * 0.65 + 4.5));
                float ray4 = needleRay(warpAngle, 3.75, 550.0, l4, 2.0, d, dist) * 0.9;
                float l5 = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(t * 0.50 + 2.2));
                float ray5 = needleRay(warpAngle, 5.15, 380.0, l5, 1.2, d, dist) * 1.3;
                float l6 = smoothstep(0.15, 0.85, 0.5 + 0.5 * cos(t * 0.80 + 0.9));
                float ray6 = needleRay(warpAngle, 6.10, 650.0, l6, 2.8, d, dist) * 0.85;
                float l7 = smoothstep(0.15, 0.85, 0.5 + 0.5 * sin(t * 0.70 + 5.0));
                float ray7 = needleRay(warpAngle, 4.45, 750.0, l7, 1.8, d, dist) * 1.0;
                float totalRays = (ray1 + ray2 + ray3 + ray4 + ray5 + ray6 + ray7) * smoothstep(1.05, 0.75, dist);
                vec3 rayColor = mix(baseColor, sheenColor, 0.25);
                vec3 rays = rayColor * (totalRays * u_godRays * 0.85 * mix(0.35, 1.0, u_playState));
                vec3 finalColor = bodyCol + rays;
                float finalAlpha = edgeAlpha * 0.95 + glow * 0.82 * effGlow + halo * 0.50 + totalRays * 0.40;
                float edgeFade = smoothstep(0.96, 0.55, r);
                finalColor *= edgeFade;
                finalAlpha *= edgeFade;
                gl_FragColor = vec4(finalColor, clamp(finalAlpha, 0.0, 1.0));
            }`;
        function createShader(gl, type, source) {
            const s = gl.createShader(type);
            gl.shaderSource(s, source);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.error("[SmartWave WebGL]", gl.getShaderInfoLog(s));
                return null;
            }
            return s;
        }
        const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) return;
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("[SmartWave WebGL link]", gl.getProgramInfoLog(program));
            return;
        }
        glProgram = program;
        // Fullscreen quad
        const quadBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1,
        ]), gl.STATIC_DRAW);
        glLocations = {
            position: gl.getAttribLocation(program, "position"),
            u_resolution: gl.getUniformLocation(program, "u_resolution"),
            u_time: gl.getUniformLocation(program, "u_time"),
            u_color: gl.getUniformLocation(program, "u_color"),
            u_playState: gl.getUniformLocation(program, "u_playState"),
            u_zoom: gl.getUniformLocation(program, "u_zoom"),
            u_warp: gl.getUniformLocation(program, "u_warp"),
            u_godRays: gl.getUniformLocation(program, "u_godRays"),
            u_glow: gl.getUniformLocation(program, "u_glow"),
        };
        gl.enableVertexAttribArray(glLocations.position);
        gl.vertexAttribPointer(glLocations.position, 2, gl.FLOAT, false, 0, 0);
    }
    let cachedWaveCanvas = null;
    function renderWebGLWave(timestamp) {
        if (!cachedWaveCanvas) cachedWaveCanvas = document.querySelector("#sw-wave-canvas");
        const canvas = cachedWaveCanvas;
        if (!canvas || !glContext || !glProgram || !STATE.pageVisible || !STATE.waveEffectEnabled) return;
        STATE.animFrameId = requestAnimationFrame(renderWebGLWave);
        if (timestamp && STATE.lastFrameTime && (timestamp - STATE.lastFrameTime < 16.0)) {
            return;
        }
        STATE.lastFrameTime = timestamp || performance.now();
        const gl = glContext;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(glProgram);
        const isPlaying = isPlayerPlaying();
        // Fast, lively wave flow speed (0.020)
        STATE.waveTime += isPlaying ? 0.020 : 0.0018;
        const targetPlayState = isPlaying ? 1.0 : 0.0;
        STATE.currentPlayState += (targetPlayState - STATE.currentPlayState) * 0.06;
        gl.uniform2f(glLocations.u_resolution, canvas.width, canvas.height);
        gl.uniform1f(glLocations.u_time, STATE.waveTime);
        gl.uniform1f(glLocations.u_playState, STATE.currentPlayState);
        // Locked user parameters:
        gl.uniform1f(glLocations.u_zoom, 0.70);
        gl.uniform1f(glLocations.u_warp, 0.85);
        gl.uniform1f(glLocations.u_godRays, 1.20);
        gl.uniform1f(glLocations.u_glow, 0.55);
        // Smooth interpolation of the single cover color
        const targetColor = isPlaying ? (STATE.extractedColorA || [0.91, 0.12, 0.18]) : [0.94, 0.94, 0.97];
        for (let ch = 0; ch < 3; ch++) {
            STATE.currentColorA[ch] += (targetColor[ch] - STATE.currentColorA[ch]) * 0.07;
        }
        gl.uniform3f(glLocations.u_color, STATE.currentColorA[0], STATE.currentColorA[1], STATE.currentColorA[2]);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
function startWaveAnimation() {
        const canvas = document.querySelector("#sw-wave-canvas");
        if (!glContext && canvas) {
            initWebGL(canvas);
        }
        if (STATE.animFrameId) cancelAnimationFrame(STATE.animFrameId);
        STATE.animFrameId = requestAnimationFrame(renderWebGLWave);
    }
    function stopWaveAnimation() {
        if (STATE.animFrameId) {
            cancelAnimationFrame(STATE.animFrameId);
            STATE.animFrameId = null;
        }
    }

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopWaveAnimation();
        } else if (STATE.pageVisible && STATE.waveEffectEnabled) {
            startWaveAnimation();
        }
    });
    // -------------------------------------------------------------------------
    // PURE BLACK DESIGN: CENTERED SCREEN
