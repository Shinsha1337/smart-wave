    // =========================================================================
    // REGIONAL FILTER (configurable, regions are selected in settings)
    // =========================================================================
    function isUnwantedRegionalTrack(track) {
        if (!track) return false;
        const regions = STATE.excludedRegions || [];
        if (!regions.length) return false;
        const title = String(track.title || track.name || "");
        const artist = String(track.artist || track.artists?.[0]?.name || "");
        const full = (title + " " + artist).toLowerCase();
        for (const rid of regions) {
            const preset = REGION_PRESETS[rid];
            if (!preset) continue;
            if (preset.chars && (preset.chars.test(title) || preset.chars.test(artist))) return true;
            for (const kw of preset.keywords) {
                if (full.includes(kw)) return true;
            }
        }
        return false;
    }

    // =========================================================================
    // OFFICIAL SPOTIFY BROWSE CATALOG (100% INTERNATIONAL EDITORIAL PLAYLISTS)
    // =========================================================================
    const BROWSE_GENRES = {
        pop: { id: "pop", name: { en: "Pop", ru: "Поп" }, desc: { en: "Top Pop & Hits", ru: "Поп-хиты и новинки" }, uri: "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M", query: "Today's Top Hits" },
        hiphop: { id: "hiphop", name: { en: "Hip-Hop", ru: "Хип-хоп" }, desc: { en: "Rap, Trap & Drill", ru: "Рэп, трэп и хип-хоп" }, uri: "spotify:playlist:37i9dQZF1DX0XUsuxWHRQd", query: "RapCaviar" },
        rock: { id: "rock", name: { en: "Rock", ru: "Рок" }, desc: { en: "Classic & Modern Rock", ru: "Классический и современный рок" }, uri: "spotify:playlist:37i9dQZF1DWXRqgorJj26U", query: "Rock Classics" },
        indie: { id: "indie", name: { en: "Indie", ru: "Инди" }, desc: { en: "Indie Rock & Bedroom Pop", ru: "Инди-рок и бэдрум-поп" }, uri: "spotify:playlist:37i9dQZF1DX2Nc3B70tvx0", query: "Ultimate Indie" },
        electronic: { id: "electronic", name: { en: "Dance & EDM", ru: "Электроника" }, desc: { en: "Electronic, Club & House", ru: "Электронная и клубная музыка" }, uri: "spotify:playlist:37i9dQZF1DX4dyzvuaRJ0n", query: "mint" },
        chill: { id: "chill", name: { en: "Chill", ru: "Чилл" }, desc: { en: "Chillout, Relax & Ambient", ru: "Расслабляющая музыка" }, uri: "spotify:playlist:37i9dQZF1DX4WYpdgoIcn6", query: "Chill Hits" },
        focus: { id: "focus", name: { en: "Focus", ru: "Фокус" }, desc: { en: "Deep Focus & Study", ru: "Музыка для работы и учёбы" }, uri: "spotify:playlist:37i9dQZF1DWZeKCadgRdKQ", query: "Deep Focus" },
        sleep: { id: "sleep", name: { en: "Sleep", ru: "Сон" }, desc: { en: "Sleep Sounds & Ambient", ru: "Спокойный сон и звуки природы" }, uri: "spotify:playlist:37i9dQZF1DWZd79rJ6a7lp", query: "Sleep" },
        metal: { id: "metal", name: { en: "Metal", ru: "Метал" }, desc: { en: "Heavy, Nu & Thrash Metal", ru: "Хэви-метал и альтернатива" }, uri: "spotify:playlist:37i9dQZF1DX9qNs32fujYe", query: "Heavy Metal" },
        jazz: { id: "jazz", name: { en: "Jazz", ru: "Джаз" }, desc: { en: "Smooth & Classic Jazz", ru: "Классический и мягкий джаз" }, uri: "spotify:playlist:37i9dQZF1DXbITWG1ZJKYt", query: "Jazz Classics" },
        rnb: { id: "rnb", name: { en: "R&B", ru: "R&B" }, desc: { en: "Contemporary & Classic R&B", ru: "Современный и классический R&B" }, uri: "spotify:playlist:37i9dQZF1DWUzFXarNiofw", query: "R&B Weekly" },
        kpop: { id: "kpop", name: { en: "K-Pop", ru: "K-Pop" }, desc: { en: "Korean Pop & Hits", ru: "Корейский поп и тренды" }, uri: "spotify:playlist:37i9dQZF1DX9tPFwDMOaN1", query: "K-Pop ON!" },
        anime: { id: "anime", name: { en: "Anime", ru: "Аниме" }, desc: { en: "J-Rock, J-Pop & Soundtracks", ru: "Саундтреки и японский рок" }, uri: "spotify:playlist:37i9dQZF1DWT8aqnwgRt92", query: "Anime Now" },
        gaming: { id: "gaming", name: { en: "Gaming", ru: "Гейминг" }, desc: { en: "Video Game Soundtracks & Bass", ru: "Игровая музыка и биты" }, uri: "spotify:playlist:37i9dQZF1DWTyiBJ6yEqeu", query: "Top Gaming Tracks" },
        mood: { id: "mood", name: { en: "Mood", ru: "Настроение" }, desc: { en: "Feel Good & Emotional", ru: "Музыка под настроение" }, uri: "spotify:playlist:37i9dQZF1DX3rxVfibe1L0", query: "Mood Booster" },
        party: { id: "party", name: { en: "Party", ru: "Вечеринка" }, desc: { en: "Party Hits & Dance Anthems", ru: "Танцевальные гимны вечеринок" }, uri: "spotify:playlist:37i9dQZF1DXa2PvUpywmrr", query: "Party Hits" },
        workout: { id: "workout", name: { en: "Workout", ru: "Спорт" }, desc: { en: "Energy & Training Beats", ru: "Энергичная музыка для зала" }, uri: "spotify:playlist:37i9dQZF1DX76Wlfdnj7AP", query: "Beast Mode" },
        classical: { id: "classical", name: { en: "Classical", ru: "Классика" }, desc: { en: "Piano & Symphonic Classics", ru: "Фортепиано и оркестровая классика" }, uri: "spotify:playlist:37i9dQZF1DWWEJlAGA9gs0", query: "Classical Essentials" },
        folk: { id: "folk", name: { en: "Folk & Acoustic", ru: "Фолк и Акустика" }, desc: { en: "Acoustic, Indie Folk & Roots", ru: "Акустический инди-фолк" }, uri: "spotify:playlist:37i9dQZF1DWXJyjYpHunCf", query: "Folk Pop" },
        ambient: { id: "ambient", name: { en: "Ambient", ru: "Эмбиент" }, desc: { en: "Atmospheric & Space Sounds", ru: "Атмосферные звуковые ландшафты" }, uri: "spotify:playlist:37i9dQZF1DX3Ogo9pFvBkY", query: "Ambient Chill" },
        punk: { id: "punk", name: { en: "Punk", ru: "Панк" }, desc: { en: "Pop-Punk & Post-Punk", ru: "Поп-панк и пост-панк" }, uri: "spotify:playlist:37i9dQZF1DXasneILDRM7B", query: "Pure Pop Punk" },
        soul: { id: "soul", name: { en: "Soul", ru: "Соул" }, desc: { en: "Neo-Soul & Motown", ru: "Нео-соул и мотаун" }, uri: "spotify:playlist:37i9dQZF1DWULEW2RfoSCi", query: "Soul Lounge" },
        lofi: { id: "lofi", name: { en: "Lo-Fi", ru: "Лоу-фай" }, desc: { en: "Lo-Fi Beats & Rainy Vibes", ru: "Лоу-фай биты и чилловый вайб" }, uri: "spotify:playlist:37i9dQZF1DWWQRwui0ExPn", query: "lofi beats" },
        country: { id: "country", name: { en: "Country", ru: "Кантри" }, desc: { en: "Country Hits & Americana", ru: "Кантри и американа" }, uri: "spotify:playlist:37i9dQZF1DX1lVhptIYRda", query: "Hot Country" },
        latin: { id: "latin", name: { en: "Latin", ru: "Латина" }, desc: { en: "Reggaeton & Latin Pop", ru: "Реггетон и латиноамериканский поп" }, uri: "spotify:playlist:37i9dQZF1DX10zKzsJ2jva", query: "Viva Latino" },
        instrumental: { id: "instrumental", name: { en: "Instrumental", ru: "Инструментальная" }, desc: { en: "Peaceful Piano & Instrumental", ru: "Спокойный фортепианный инструментал" }, uri: "spotify:playlist:37i9dQZF1DX4sWSpwq3LiO", query: "Peaceful Piano" },
        trending: { id: "trending", name: { en: "Trending", ru: "В тренде" }, desc: { en: "Viral & Chart-Topping Hits", ru: "Вирусные треки и чарты" }, uri: "spotify:playlist:37i9dQZF1DX2L0iB23Enbq", query: "Viral Hits" },
        newreleases: { id: "newreleases", name: { en: "New Releases", ru: "Новинки" }, desc: { en: "Fresh Music This Week", ru: "Свежие релизы этой недели" }, uri: "spotify:playlist:37i9dQZF1DX4JAvHpjipBk", query: "New Music Friday" },
        altrock: { id: "altrock", name: { en: "Alternative", ru: "Альтернатива" }, desc: { en: "New Alternative & Rock", ru: "Новая альтернатива и рок" }, uri: "spotify:playlist:37i9dQZF1DWT2jS7NwYPVI", query: "New Noise" },
        synthwave: { id: "synthwave", name: { en: "Synthwave", ru: "Синтвейв" }, desc: { en: "80s Retrowave & Cyberpunk", ru: "Ретровейв 80-х и киберпанк" }, uri: "spotify:playlist:37i9dQZF1DXdLEN7aqioXM", query: "Retrowave Outrun" },
        night: { id: "night", name: { en: "Night", ru: "Ночь" }, desc: { en: "Late Night Calm & Drives", ru: "Ночные поездки и спокойствие" }, uri: "spotify:playlist:37i9dQZF1DX5DYkVgiO6RF", query: "Night Drive" },
        blues: { id: "blues", name: { en: "Blues", ru: "Блюз" }, desc: { en: "Delta & Electric Blues", ru: "Электрический и дельта-блюз" }, uri: "spotify:playlist:37i9dQZF1DXd9rSDyQguIk", query: "Blues Classics" }
    };

    const genreTracksCache = new Map();

    async function loadGenreTracks(genreId) {
        if (!genreId || genreId === "all" || genreId === "custom") return [];
        if (genreTracksCache.has(genreId) && genreTracksCache.get(genreId).length > 0) {
            return genreTracksCache.get(genreId);
        }
        const def = BROWSE_GENRES[genreId];
        if (!def) return [];

        let items = [];

        // 1. Priority: global Spotify editorial playlists (0% regional junk in them)
        if (def.uri) {
            try {
                const pAPI = Spicetify.Platform?.PlaylistAPI;
                if (pAPI?.getPlaylist) {
                    const pl = await pAPI.getPlaylist(def.uri);
                    const raw = (pl?.contents?.items || []).map(i => ({
                        uri: i.uri,
                        title: i.name,
                        artist: i.artists?.[0]?.name,
                        image: resolveImageUrl(i.album?.images?.[0]?.url),
                        duration: i.duration?.milliseconds || 180000,
                        genres: [genreId]
                    })).filter(t => t.uri);
                    items = raw.filter(t => !isUnwantedRegionalTrack(t) && !STATE.dislikedTracks.has(t.uri));
                }
            } catch (err) {
                console.warn("[SmartWave] Editorial playlist fetch error:", err);
            }
        }

        // 2. Fallback: international search via GraphQL (with mandatory filtering)
        if (items.length === 0) {
            try {
                const query = def.query || `genre:${genreId}`;
                const defGql = Spicetify.GraphQL?.Definitions?.searchTracks;
                if (defGql) {
                    const res = await Spicetify.GraphQL.Request(defGql, {
                        searchTerm: query,
                        limit: 30,
                        offset: Math.floor(Math.random() * 20)
                    });
                    const rawItems = res?.data?.searchV2?.tracksV2?.items || [];
                    const mapped = rawItems.map(i => {
                        const d = i?.item?.data;
                        if (!d?.uri) return null;
                        return {
                            uri: d.uri,
                            title: d.name,
                            artist: d.artists?.items?.[0]?.profile?.name || "",
                            artistUri: d.artists?.items?.[0]?.uri,
                            image: resolveImageUrl(d.albumOfTrack?.coverArt?.sources?.[0]?.url),
                            duration: d.trackDuration?.milliseconds || 180000,
                            genres: [genreId]
                        };
                    }).filter(Boolean);
                    items = mapped.filter(t => !isUnwantedRegionalTrack(t) && !STATE.dislikedTracks.has(t.uri));
                }
            } catch (err) {}
        }

        if (items.length > 0) {
            genreTracksCache.set(genreId, items);
        }
        return items;
    }

    function renderPinnedGenreChipsHTML() {
        const pinned = STATE.pinnedGenres || ["chill", "focus", "indie", "electronic", "rock", "hiphop"];
        const lang = getLang();
        return pinned.map(gid => {
            const def = BROWSE_GENRES[gid];
            if (!def) return "";
            const active = STATE.activeGenre === gid ? "active" : "";
            const name = def.name?.[lang] || def.name?.en || def.id;
            return `<button class="sw-chip ${active}" data-genre="${def.id}" draggable="true">${name}</button>`;
        }).join("");
    }

    async function loadComfortPool() {
        if (STATE.comfortPool.length > 0) return;
        try {
            if (Spicetify.Platform?.LibraryAPI?.getTracks) {
                const res = await Spicetify.Platform.LibraryAPI.getTracks({ limit: 1000 });
                if (res?.items?.length) {
                    STATE.comfortPool = res.items
                        .filter(t => t.isPlayable !== false && t.uri)
                        .map(t => ({
                            uri: t.uri,
                            title: t.name || "Favorite track",
                            artist: t.artists?.[0]?.name || "From library",
                            artistUri: t.artists?.[0]?.uri,
                            image: resolveImageUrl(t.album?.images?.[0]?.url),
                            duration: t.duration?.milliseconds || 180000,
                        }));
                }
            }
        } catch (err) {
            console.warn("[SmartWave] loadComfortPool error:", err);
        }
    }
    function pickComfortTrack(excludeUri) {
        if (!STATE.comfortPool.length) return null;
        let pool = STATE.comfortPool.filter(t => t.uri !== excludeUri && !STATE.history.has(t.uri) && !STATE.dislikedTracks.has(t.uri));
        if (!pool.length) pool = STATE.comfortPool.filter(t => t.uri !== excludeUri && !STATE.dislikedTracks.has(t.uri));
        if (!pool.length) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }
    async function loadCustomTracksCache(force = false) {
        if (!force && STATE.customTracksCache.length > 0) return STATE.customTracksCache;
        const selectedUris = STATE.customPlaylists || [];
        if (selectedUris.length === 0) {
            STATE.customTracksCache = [];
            STATE.customArtistsCache = [];
            return [];
        }
        const allTracks = [];
        const artistMap = new Map();
        const likedSongsUri = Spicetify.Platform?.LibraryAPI?._likedSongsUri || "spotify:collection:tracks";
        const pushTrack = (item) => {
            if (!item || !item.uri) return;
            const imgs = getTrackImages(item);
            allTracks.push({
                uri: item.uri,
                title: item.name || "Track",
                artist: item.artists?.[0]?.name || "Unknown Artist",
                artistUri: item.artists?.[0]?.uri || null,
                image: imgs.image,
                thumb: imgs.thumb || imgs.image,
                duration: item.duration?.milliseconds || item.duration_ms || item.duration || 180000
            });
            if (item.artists && item.artists[0]?.uri) {
                artistMap.set(item.artists[0].uri, item.artists[0].name || "Artist");
            }
        };
        for (let plUri of selectedUris) {
            const isLikedSongs = plUri === "spotify:collection:tracks" || plUri === likedSongsUri;
            try {
                if (isLikedSongs) {
                    plUri = likedSongsUri;
                }
                let items = [];
                if (Spicetify.Platform?.PlaylistAPI?.getPlaylist) {
                    try {
                        const pl = await Spicetify.Platform.PlaylistAPI.getPlaylist(plUri);
                        items = pl?.contents?.items || [];
                    } catch (playlistErr) {
                        if (!isLikedSongs) throw playlistErr;
                    }
                }
                // Fallback for Liked Songs on older/other Spotify builds where the system playlist is not readable as a regular playlist URI
                if (isLikedSongs && items.length === 0 && Spicetify.Platform?.LibraryAPI?.getTracks) {
                    const lib = await Spicetify.Platform.LibraryAPI.getTracks({ limit: 1000 });
                    items = lib?.items || [];
                }
                for (const item of items) pushTrack(item);
            } catch (err) {
                console.warn("[SmartWave] Error loading playlist tracks", plUri, err);
            }
        }
        STATE.customTracksCache = allTracks;
        STATE.customArtistsCache = Array.from(artistMap.entries()).map(([uri, name]) => ({ uri, name }));
        return allTracks;
    }
    // =========================================================================
    // NATIVE SPOTIFY STATION ENGINE
    // =========================================================================

    // Resolves and plays a native Spotify station context
    async function playStationContext(seedTrackId = null) {
        let stationUri = null;
        const cur = Spicetify.Player?.data?.item;

        // 1. Explicit seed provided (e.g. from Shake / Встряхнуть) -> highest priority
        if (seedTrackId) {
            stationUri = `spotify:station:track:${seedTrackId}`;
        }
        // 2. Browse genre selected (e.g. Rock, Indie, Lo-Fi, EDM)
        else if (STATE.activeGenre && STATE.activeGenre !== "all" && STATE.activeGenre !== "custom") {
            const def = BROWSE_GENRES[STATE.activeGenre];
            if (def && def.uri) {
                const playlistId = def.uri.split(":").pop();
                stationUri = `spotify:station:playlist:${playlistId}`;
            }
        }
        // 3. Custom mode (user selected personal playlists)
        else if (STATE.activeGenre === "custom") {
            const customTracks = await loadCustomTracksCache();
            if (customTracks.length > 0) {
                const pick = customTracks[Math.floor(Math.random() * customTracks.length)];
                if (pick?.uri) {
                    stationUri = `spotify:station:track:${pick.uri.split(":").pop()}`;
                }
            }
        }

        // 4. All tracks stream (Song Radio from current track or favorite track)
        if (!stationUri) {
            let trackId = null;
            if (cur?.uri && !STATE.dislikedTracks.has(cur.uri)) {
                trackId = cur.uri.split(":").pop();
            } else if (STATE.comfortPool && STATE.comfortPool.length > 0) {
                const fav = STATE.comfortPool[Math.floor(Math.random() * STATE.comfortPool.length)];
                trackId = fav.uri.split(":").pop();
            } else {
                trackId = "4cOdK2wGLETKBW3PvgPWqT"; // Universal fallback
            }
            stationUri = `spotify:station:track:${trackId}`;
        }

        try {
            await Spicetify.Platform?.PlayerAPI?.play?.(
                { uri: stationUri },
                { featureIdentifier: "station" }
            );
        } catch (err) {
            console.warn("[SmartWave] Station play failed:", err);
        }
    }

    // Pull upcoming tracks directly from Spotify's native queue
    async function syncUpcomingWaveFromNativeQueue() {
        if (!STATE.active) return;
        try {
            const q = await Spicetify.Platform?.PlayerAPI?.getQueue?.();
            const nextUp = q?.nextUp || [];
            STATE.upcomingWave = nextUp.map(t => {
                const meta = t.metadata || {};
                const imgs = t.images || [];
                return {
                    uri: t.uri,
                    title: t.name || meta.title || "Track",
                    artist: t.artists?.[0]?.name || meta.artist_name || "Artist",
                    image: imgs[0]?.url || resolveImageUrl(meta.image_large_url || meta.image_url || ""),
                    thumb: imgs[1]?.url || imgs[0]?.url || resolveImageUrl(meta.image_small_url || meta.image_url || ""),
                    duration: t.duration?.milliseconds || Number(meta.duration) || 180000
                };
            }).filter(t => t.uri && !STATE.dislikedTracks.has(t.uri) && !isUnwantedRegionalTrack(t));
            renderUpNextList();
        } catch (err) {
            console.warn("[SmartWave] syncUpcomingWaveFromNativeQueue error:", err);
        }
    }

    // Strict favorites mode: purely from user's library
    async function ensureFavoritesQueue(autoPlay = true) {
        if (!STATE.comfortPool || STATE.comfortPool.length === 0) {
            await loadComfortPool();
        }
        let pool = (STATE.comfortPool || []).filter(t => !STATE.dislikedTracks.has(t.uri) && !isUnwantedRegionalTrack(t));
        if (STATE.activeGenre && STATE.activeGenre !== "all" && STATE.activeGenre !== "custom") {
            const genreTracks = await loadGenreTracks(STATE.activeGenre);
            const genreUris = new Set(genreTracks.map(t => t.uri));
            const matched = pool.filter(t => genreUris.has(t.uri));
            if (matched.length > 0) pool = matched;
        } else if (STATE.activeGenre === "custom") {
            const customTracks = await loadCustomTracksCache();
            const customUris = new Set(customTracks.map(t => t.uri));
            const matched = pool.filter(t => customUris.has(t.uri));
            if (matched.length > 0) pool = matched;
        }

        if (!pool.length) {
            STATE.mode = "stream";
            Spicetify.LocalStorage.set("smartWave_mode", "stream");
            if (typeof updateModeChipsUI === "function") updateModeChipsUI();
            if (typeof showNotice === "function") showNotice(t("noFavoritesInGenre"));
            return playStationContext();
        }

        const curUri = Spicetify.Player?.data?.item?.uri;
        const available = pool.filter(t => t.uri !== curUri);
        const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 15);
        STATE.upcomingWave = shuffled;
        renderUpNextList();
        syncNativeQueue();

        if (autoPlay && STATE.upcomingWave.length > 0) {
            await playFirstOfQueue();
        }
    }

    async function playFirstOfQueue() {
        const nextTrack = STATE.upcomingWave.shift();
        if (!nextTrack?.uri) return;
        if (STATE.currentTrack) {
            STATE.historyStack.push(STATE.currentTrack);
            if (STATE.historyStack.length > 50) STATE.historyStack.shift();
        }
        try {
            if (Spicetify.Player?.playUri) await Spicetify.Player.playUri(nextTrack.uri, {});
        } catch (err) {}
        STATE.currentTrack = nextTrack;
        addHistory(nextTrack.uri);
        STATE.currentTrackStartTime = Date.now();
        resetProgressUI();
        updateUI();
        renderUpNextList();
        syncNativeQueue();
    }

    async function syncNativeQueue() {
        if (!STATE.active || STATE.mode !== "favorite") return;
        try {
            const pAPI = Spicetify.Platform?.PlayerAPI;
            if (!pAPI?.clearQueue || !pAPI?.addToQueue) return;
            await pAPI.clearQueue();
            if (STATE.upcomingWave.length > 0) {
                await pAPI.addToQueue(STATE.upcomingWave.map(t => ({ uri: t.uri })));
            }
        } catch (err) {
            console.warn("[SmartWave] syncNativeQueue error:", err);
        }
    }

    async function regenerateQueue(autoPlay = true) {
        STATE.isQueueing = false;
        STATE.upcomingWave = [];
        renderUpNextList();

        if (STATE.mode === "favorite") {
            await ensureFavoritesQueue(autoPlay);
        } else {
            await playStationContext();
            setTimeout(syncUpcomingWaveFromNativeQueue, 1500);
        }
        updateUI();
    }

    async function playUpcomingIndex(index) {
        if (!STATE.upcomingWave || index < 0 || index >= STATE.upcomingWave.length) return;
        const target = STATE.upcomingWave[index];
        if (!target || !target.uri) return;

        if (STATE.mode === "favorite") {
            STATE.upcomingWave.splice(0, index + 1);
            try { await Spicetify.Player?.playUri?.(target.uri, {}); } catch {}
            renderUpNextList();
            syncNativeQueue();
        } else {
            try {
                await Spicetify.Player?.playUri?.(target.uri, {});
                setTimeout(syncUpcomingWaveFromNativeQueue, 1500);
            } catch {}
        }
    }

    async function startWave() {
        STATE.active = true;
        updateNavButtonActive(true);
        await loadComfortPool();
        const cur = Spicetify.Player?.data?.item;
        if (cur && cur.uri) {
            const curArtist = fixMojibake(cur.artists?.[0]?.name) || "Artist";
            const curArtistUri = cur.artists?.[0]?.uri || null;
            STATE.currentTrack = {
                uri: cur.uri,
                title: fixMojibake(cur.name) || "Track",
                artist: curArtist,
                artistUri: curArtistUri,
                image: getTrackImages(cur).image || resolveImageUrl(cur.metadata?.image_url || ""),
                thumb: getTrackImages(cur).thumb || resolveImageUrl(cur.metadata?.image_url || ""),
                duration: cur.duration?.milliseconds || safeGetDuration(),
            };
            addHistory(cur.uri);
            STATE.currentTrackStartTime = Date.now();
        } else {
            STATE.currentTrack = null;
            STATE.currentTrackStartTime = 0;
        }
        STATE.upcomingWave = [];
        if (STATE.mode === "favorite") {
            await ensureFavoritesQueue(false);
        } else {
            await playStationContext();
            setTimeout(syncUpcomingWaveFromNativeQueue, 1500);
        }
        updateUI();
    }

    function stopWave() {
        STATE.active = false;
        updateNavButtonActive(false);
    }

    async function skipWaveTrack(isDislike = false) {
        const curUri = Spicetify.Player?.data?.item?.uri;
        if (isDislike && curUri) {
            addDislikedTrack(curUri, STATE.currentTrack?.artist);
            console.log(`[SmartWave] Track banned via dislike: ${curUri}`);
            if (typeof showNotice === "function") showNotice(t("trackBanned") || "Трек забанен");
        }

        if (STATE.mode === "favorite") {
            let nextTrack = null;
            while (STATE.upcomingWave.length > 0) {
                const candidate = STATE.upcomingWave.shift();
                if (candidate?.uri && candidate.uri !== curUri) {
                    nextTrack = candidate;
                    break;
                }
            }
            if (!nextTrack) {
                await ensureFavoritesQueue(false);
                nextTrack = STATE.upcomingWave.shift();
            }
            if (nextTrack?.uri) {
                try {
                    if (Spicetify.Player?.playUri) await Spicetify.Player.playUri(nextTrack.uri, {});
                } catch (err) {}
                STATE.currentTrack = nextTrack;
                STATE.currentTrackStartTime = Date.now();
                resetProgressUI();
                renderUpNextList();
                syncNativeQueue();
                updateUI();
            }
        } else {
            try {
                await Spicetify.Player?.next?.();
                setTimeout(syncUpcomingWaveFromNativeQueue, 1000);
            } catch (err) {
                console.warn("[SmartWave] skip error:", err);
            }
        }
    }

    async function prevWaveTrack() {
        if (STATE.mode === "favorite" && STATE.historyStack.length > 0) {
            const prev = STATE.historyStack.pop();
            if (prev?.uri) {
                if (STATE.currentTrack) STATE.upcomingWave.unshift(STATE.currentTrack);
                try {
                    if (Spicetify.Player?.playUri) await Spicetify.Player.playUri(prev.uri, {});
                } catch (err) {}
                STATE.currentTrack = prev;
                STATE.currentTrackStartTime = Date.now();
                updateUI();
                return;
            }
        }
        try { Spicetify.Player?.back?.(); } catch (err) {}
    }
