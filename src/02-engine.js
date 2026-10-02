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
        rnb: { id: "rnb", name: { en: "R&B", ru: "R&B" }, desc: { en: "Contemporary & Classic R&B", ru: "Современный и классический R&B" }, uri: "spotify:playlist:37i9dQZF1DX4SBhb3fqAp5", query: "Are & Be" },
        kpop: { id: "kpop", name: { en: "K-Pop", ru: "K-Pop" }, desc: { en: "Korean Pop & Hits", ru: "Корейский поп и тренды" }, uri: "spotify:playlist:37i9dQZF1DX9tPFwDMOaN1", query: "K-Pop ON!" },
        anime: { id: "anime", name: { en: "Anime", ru: "Аниме" }, desc: { en: "J-Rock, J-Pop & Soundtracks", ru: "Саундтреки и японский рок" }, uri: "spotify:playlist:37i9dQZF1DWT8aqnwgRt92", query: "Anime Now" },
        gaming: { id: "gaming", name: { en: "Gaming", ru: "Гейминг" }, desc: { en: "Video Game Soundtracks & Bass", ru: "Игровая музыка и биты" }, uri: "spotify:playlist:37i9dQZF1DWTyiBJ6yEqeu", query: "Top Gaming Tracks" },
        mood: { id: "mood", name: { en: "Mood", ru: "Настроение" }, desc: { en: "Feel Good & Emotional", ru: "Музыка под настроение" }, uri: "spotify:playlist:37i9dQZF1DX3rxVfibe1L0", query: "Mood Booster" },
        party: { id: "party", name: { en: "Party", ru: "Вечеринка" }, desc: { en: "Party Hits & Dance Anthems", ru: "Танцевальные гимны вечеринок" }, uri: "spotify:playlist:37i9dQZF1DXa2PvU9277JD", query: "Party Hits" },
        workout: { id: "workout", name: { en: "Workout", ru: "Спорт" }, desc: { en: "Energy & Training Beats", ru: "Энергичная музыка для зала" }, uri: "spotify:playlist:37i9dQZF1DX76Wlfdnj7AP", query: "Beast Mode" },
        classical: { id: "classical", name: { en: "Classical", ru: "Классика" }, desc: { en: "Piano & Symphonic Classics", ru: "Фортепиано и оркестровая классика" }, uri: "spotify:playlist:37i9dQZF1DWV0gynK7Pt6W", query: "Classical Essentials" },
        folk: { id: "folk", name: { en: "Folk & Acoustic", ru: "Фолк и Акустика" }, desc: { en: "Acoustic, Indie Folk & Roots", ru: "Акустический инди-фолк" }, uri: "spotify:playlist:37i9dQZF1DX2419TkhN6qf", query: "Folk Pop" },
        ambient: { id: "ambient", name: { en: "Ambient", ru: "Эмбиент" }, desc: { en: "Atmospheric & Space Sounds", ru: "Атмосферные звуковые ландшафты" }, uri: "spotify:playlist:37i9dQZF1DX3Ogo9pFvBkY", query: "Ambient Chill" },
        punk: { id: "punk", name: { en: "Punk", ru: "Панк" }, desc: { en: "Pop-Punk & Post-Punk", ru: "Поп-панк и пост-панк" }, uri: "spotify:playlist:37i9dQZF1DXasneILDRM7B", query: "Pure Pop Punk" },
        soul: { id: "soul", name: { en: "Soul", ru: "Соул" }, desc: { en: "Neo-Soul & Motown", ru: "Нео-соул и мотаун" }, uri: "spotify:playlist:37i9dQZF1DWULEW2RfoSCi", query: "Soul Lounge" },
        lofi: { id: "lofi", name: { en: "Lo-Fi", ru: "Лоу-фай" }, desc: { en: "Lo-Fi Beats & Rainy Vibes", ru: "Лоу-фай биты и чилловый вайб" }, uri: "spotify:playlist:37i9dQZF1DXdLEN7aqioXM", query: "Lo-Fi Beats" },
        country: { id: "country", name: { en: "Country", ru: "Кантри" }, desc: { en: "Country Hits & Americana", ru: "Кантри и американа" }, uri: "spotify:playlist:37i9dQZF1DX1lVhptIYRda", query: "Hot Country" },
        latin: { id: "latin", name: { en: "Latin", ru: "Латина" }, desc: { en: "Reggaeton & Latin Pop", ru: "Реггетон и латиноамериканский поп" }, uri: "spotify:playlist:37i9dQZF1DX10zKzsJ2jva", query: "Viva Latino" },
        instrumental: { id: "instrumental", name: { en: "Instrumental", ru: "Инструментальная" }, desc: { en: "Post-Rock & Acoustic Strings", ru: "Пост-рок и инструментал" }, uri: "spotify:playlist:37i9dQZF1DX7gP9a7B8w2Z", query: "Instrumental Pop" },
        trending: { id: "trending", name: { en: "Trending", ru: "В тренде" }, desc: { en: "Viral & Chart-Topping Hits", ru: "Вирусные треки и чарты" }, uri: "spotify:playlist:37i9dQZF1DX4JAvHpjipBk", query: "New Music Friday" },
        newreleases: { id: "newreleases", name: { en: "New Releases", ru: "Новинки" }, desc: { en: "Fresh Music This Week", ru: "Свежие релизы этой недели" }, query: "New Music Friday" },
        altrock: { id: "altrock", name: { en: "Alternative", ru: "Альтернатива" }, desc: { en: "90s & Modern Alternative", ru: "Альтернативный рок 90-х и современный" }, uri: "spotify:playlist:37i9dQZF1DXkGRe8Z1557d", query: "Modern Rock" },
        synthwave: { id: "synthwave", name: { en: "Synthwave", ru: "Синтвейв" }, desc: { en: "80s Retrowave & Cyberpunk", ru: "Ретровейв 80-х и киберпанк" }, uri: "spotify:playlist:37i9dQZF1DXdLEN7aqioXM", query: "RetroWave" },
        night: { id: "night", name: { en: "Night", ru: "Ночь" }, desc: { en: "Late Night Calm & Drives", ru: "Ночные поездки и спокойствие" }, query: "Night Rain" },
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
                    items = raw.filter(t => !isUnwantedRegionalTrack(t));
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
                    items = mapped.filter(t => !isUnwantedRegionalTrack(t));
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
            return `<button class="sw-chip ${active}" data-genre="${def.id}">${name}</button>`;
        }).join("");
    }

    async function loadComfortPool() {
        if (STATE.comfortPool.length > 0) return;
        try {
            if (Spicetify.Platform?.LibraryAPI?.getTracks) {
                const res = await Spicetify.Platform.LibraryAPI.getTracks({ limit: 150 });
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
        let pool = STATE.comfortPool.filter(t => t.uri !== excludeUri && !STATE.history.has(t.uri));
        if (!pool.length) pool = STATE.comfortPool.filter(t => t.uri !== excludeUri);
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
                    const lib = await Spicetify.Platform.LibraryAPI.getTracks({ limit: 300 });
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
    async function generateCustomTrack(curUri) {
        const tracks = await loadCustomTracksCache();
        if (tracks.length === 0) return null;
        const subMode = STATE.customSubMode || "flow"; // "flow" (50/50), "discovery", "favorite"
        let isComfort = false;
        if (subMode === "favorite") {
            isComfort = true;
        } else if (subMode === "discovery") {
            isComfort = false;
        } else {
            isComfort = Math.random() < 0.5;
        }
        // 1. Track directly from the selected playlists
        if (isComfort) {
            const available = tracks.filter(t => t.uri !== curUri && !STATE.history.has(t.uri) && !STATE.upcomingWave.some(u => u.uri === t.uri));
            const pick = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : pool[Math.floor(Math.random() * pool.length)];
            if (pick) {
                return {
                    uri: pick.uri,
                    title: pick.title,
                    artist: pick.artist,
                    image: pick.image,
                    duration: pick.duration,
                    seedUri: pick.artistUri,
                    seedArtist: pick.artist
                };
            }
        }
        // 2. Discoveries based on artists from the selected playlists
        const artists = STATE.customArtistsCache;
        if (artists.length > 0) {
            const seed = artists[Math.floor(Math.random() * artists.length)];
            const graph = await getArtistGraph(seed.uri);
            if (graph?.related?.length > 0) {
                const randomRelated = graph.related[Math.floor(Math.random() * graph.related.length)];
                const relatedGraph = await getArtistGraph(randomRelated.uri);
                if (relatedGraph?.topTracks?.length > 0) {
                    const availableTracks = relatedGraph.topTracks.filter(t => t.uri !== curUri && !STATE.history.has(t.uri) && !STATE.upcomingWave.some(u => u.uri === t.uri));
                    const pick = availableTracks.length > 0
                        ? availableTracks[Math.floor(Math.random() * availableTracks.length)]
                        : moodTracks.find(t => t.uri !== curUri);
                    if (pick) {
                        return {
                            ...pick,
                            seedUri: randomRelated.uri,
                            seedArtist: randomRelated.name
                        };
                    }
                }
            }
        }
        // Fallback: random track from playlists
        const fallback = tracks[Math.floor(Math.random() * tracks.length)];
        return {
            uri: fallback.uri,
            title: fallback.title,
            artist: fallback.artist,
            image: fallback.image,
            duration: fallback.duration,
            seedUri: fallback.artistUri,
            seedArtist: fallback.artist
        };
    }
    // Instant start of the first track of a fresh queue (no penalty to the artist — this is not a dislike)
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
        STATE.history.add(nextTrack.uri);
        if (nextTrack.seedUri) {
            STATE.currentSeedUri = nextTrack.seedUri;
            STATE.currentSeedArtist = nextTrack.seedArtist;
        }
        STATE.currentTrackStartTime = Date.now();
        resetProgressUI();
        await ensureWaveQueue();
        updateUI();
        renderUpNextList();
        syncNativeQueue();
    }
        async function regenerateQueue(autoPlay = true) {
        STATE.isQueueing = false;
        STATE.upcomingWave = [];
        renderUpNextList();
        // Guaranteed queue fill
        await ensureWaveQueue(true);
        if (autoPlay && STATE.upcomingWave.length > 0) {
            await playFirstOfQueue();
        }
        updateUI();
    }
        // =========================================================================
    // RECOMMENDATION ENGINE: CLUSTER SPACE
    // =========================================================================
    const TASTE_CLUSTERS = {
        electronic: {
            label: "Electronic & Ambient Slowed",
            ruLabel: "Электроника и Slowed",
            keywords: ["slowed", "reverb", "speed up", "ambient", "synth", "mac quayle", "lonown", "13aurora", "oneheart", "ost", "soundtrack", "crystal castles", "pastel ghost", "downtempo", "wave", "cyberpunk", "phonk"],
            defaultSeed: { uri: "spotify:artist:3HLApxqtvULlffnRnW88O8", name: "Mac Quayle" }
        },
        indie: {
            label: "Indie & Dream Pop",
            ruLabel: "Инди и Дрим-поп",
            keywords: ["tv girl", "malcolm todd", "dominic fike", "tame impala", "cults", "fuzzy", "indie", "bedroom", "dream pop", "pop", "mac demarco", "clairo", "boy pablo", "beach house", "men i trust"],
            defaultSeed: { uri: "spotify:artist:0Y6dVaC9DZtPNH4591M42W", name: "TV Girl" }
        },
        shoegaze: {
            label: "Shoegaze & Post-Punk",
            ruLabel: "Шугейз и Пост-панк",
            keywords: ["fermenting", "panchiko", "cigarettes after sex", "shoegaze", "post-punk", "post-rock", "deftones", "have a nice life", "whirr", "slowdive", "duster", "grunge", "rock"],
            defaultSeed: { uri: "spotify:artist:4KEHIUSoWCcqrk8AddTE1O", name: "Panchiko" }
        },
        japanese: {
            label: "J-Alt & Anime Wave",
            ruLabel: "Японский альт и Вокалоид",
            keywords: ["deco*27", "yakui", "tokyo manaka", "shimamiya", "vocaloid", "hatsune", "anime", "touhou", "j-rock", "j-pop", "kanji", "monet"],
            defaultSeed: { uri: "spotify:artist:7zmtMpvftyeW2mTcZlezAi", name: "Yakui The Maid" }
        },
        hiphop: {
            label: "Dark Trap & Hip-Hop",
            ruLabel: "Трэп и Хип-хоп",
            keywords: ["suicideboy", "21 savage", "ghostemane", "trap", "rap", "drill", "hip hop", "hip-hop", "memphis", "carti", "yeat", "bones"],
            defaultSeed: { uri: "spotify:artist:1VPmR4DJC1PlOtd0IADAO0", name: "$uicideboy$" }
        }
    };

    function identifyTrackCluster(track) {
        if (!track) return "indie";
        const title = String(track.title || track.name || "").toLowerCase();
        const artist = String(track.artist || track.artists?.[0]?.name || "").toLowerCase();
        const text = title + " " + artist;

        if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(title + artist)) {
            return "japanese";
        }

        for (const [key, cluster] of Object.entries(TASTE_CLUSTERS)) {
            for (const kw of cluster.keywords) {
                if (text.includes(kw)) return key;
            }
        }
        return "indie";
    }

    let lastActiveCluster = null;

async function generateNextTrack() {
        const curUri = Spicetify.Player?.data?.item?.uri;
        let track = null;

        // Set of all tracks and artists from the user's favorites
        const likedUris = new Set((STATE.comfortPool || []).map(t => t.uri));
        const libraryArtistNames = new Set((STATE.comfortPool || []).map(t => (t.artist || "").toLowerCase()));

        // Recent artists (protection against repeats of the same artist)
        const recentArtists = new Set(
            [STATE.currentTrack?.artist, ...STATE.upcomingWave.slice(-3).map(t => t.artist)].filter(Boolean).map(a => a.toLowerCase())
        );

        // 1. Custom mode (user's own personal collections)
        if (STATE.activeGenre === "custom") {
            const tracks = await loadCustomTracksCache();
            if (tracks && tracks.length > 0) {
                if (STATE.mode === "favorite") {
                    const available = tracks.filter(t => t.uri !== curUri && !STATE.history.has(t.uri));
                    track = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : tracks[0];
                } else if (STATE.mode === "discovery") {
                    const customArtistUris = [...new Set(tracks.map(t => t.artistUri).filter(Boolean))];
                    const seedGraphs = await Promise.all(customArtistUris.slice(0, 4).map(u => getArtistGraph(u).catch(() => null)));
                    const relUris = [];
                    for (const g of seedGraphs) {
                        for (const rel of (g?.related || []).slice(0, 4)) {
                            if (libraryArtistNames.has(rel.name?.toLowerCase())) continue;
                            relUris.push(rel);
                        }
                    }
                    const relGraphs = await Promise.all(relUris.slice(0, 8).map(r => getArtistGraph(r.uri).catch(() => null)));
                    for (let ri = 0; ri < relGraphs.length && !track; ri++) {
                        const rg = relGraphs[ri];
                        const fresh = (rg?.topTracks || []).filter(t => t.uri !== curUri && !likedUris.has(t.uri) && !STATE.history.has(t.uri));
                        if (fresh.length > 0) {
                            track = { ...fresh[Math.floor(Math.random() * fresh.length)], seedUri: relUris[ri].uri, seedArtist: relUris[ri].name };
                        }
                    }
                } else {
                    if (Math.random() < 0.35) {
                        const available = tracks.filter(t => t.uri !== curUri && !STATE.history.has(t.uri));
                        track = available.length > 0 ? available[Math.floor(Math.random() * available.length)] : null;
                    }
                }
            }
            if (track && !isUnwantedRegionalTrack(track)) return track;
        }

        // 2. Selected Browse genre mode (Chill, Focus, Indie, Electronic, Rock, Hip-Hop, etc.)
        if (STATE.activeGenre && STATE.activeGenre !== "all" && STATE.activeGenre !== "custom") {
            const genreTracks = await loadGenreTracks(STATE.activeGenre);
            if (genreTracks && genreTracks.length > 0) {
                if (STATE.mode === "favorite") {
                    const matchedLib = STATE.comfortPool.filter(t =>
                        identifyTrackCluster(t) === STATE.activeGenre &&
                        t.uri !== curUri &&
                        !STATE.history.has(t.uri)
                    );
                    if (matchedLib.length > 0) {
                        track = matchedLib[Math.floor(Math.random() * matchedLib.length)];
                    }
                } else if (STATE.mode === "discovery") {
                    const freshPool = genreTracks.filter(t =>
                        t.uri !== curUri &&
                        !likedUris.has(t.uri) &&
                        !STATE.history.has(t.uri) &&
                        !recentArtists.has((t.artist || "").toLowerCase())
                    );
                    if (freshPool.length > 0) {
                        track = freshPool[Math.floor(Math.random() * freshPool.length)];
                    }
                } else {
                    const isFav = Math.random() < 0.35;
                    if (isFav) {
                        const matchedLib = STATE.comfortPool.filter(t =>
                            identifyTrackCluster(t) === STATE.activeGenre &&
                            t.uri !== curUri &&
                            !STATE.history.has(t.uri)
                        );
                        if (matchedLib.length > 0) track = matchedLib[Math.floor(Math.random() * matchedLib.length)];
                    }
                    if (!track) {
                        const available = genreTracks.filter(t => t.uri !== curUri && !STATE.history.has(t.uri) && !recentArtists.has((t.artist || "").toLowerCase()));
                        if (available.length > 0) track = available[Math.floor(Math.random() * available.length)];
                    }
                }
            }
            if (track && !isUnwantedRegionalTrack(track)) return track;
        }

        // 3. "All tracks" mode (global Smart Wave stream)
        const targetClusterKey = STATE.activeCluster || identifyTrackCluster(STATE.currentTrack || { artist: STATE.currentSeedArtist });
        const clusterDef = TASTE_CLUSTERS[targetClusterKey] || TASTE_CLUSTERS.indie;

        const isComfort = STATE.mode === "favorite" ? true :
                          STATE.mode === "discovery" ? false :
                          Math.random() < 0.35;

        if (!isComfort && STATE.currentSeedUri) {
            const graph = await getArtistGraph(STATE.currentSeedUri);
            if (graph?.related?.length > 0) {
                const unplayedRelated = graph.related.filter(a => {
                    const aName = (a.name || "").toLowerCase();
                    if (recentArtists.has(aName)) return false;
                    if (STATE.mode === "discovery" && libraryArtistNames.has(aName)) return false;
                    return true;
                });
                const clusterMatched = unplayedRelated.filter(a => identifyTrackCluster({ artist: a.name }) === targetClusterKey);
                const pool = clusterMatched.length > 0 ? clusterMatched : unplayedRelated;

                const candidates = pool.slice(0, 5);
                // Parallel fetch: latency = slowest request instead of the sum of all five
                const graphs = await Promise.all(candidates.map(c => getArtistGraph(c.uri).catch(() => null)));
                for (let ci = 0; ci < candidates.length && !track; ci++) {
                    const rGraph = graphs[ci];
                    if (!rGraph?.topTracks?.length) continue;

                    const freshTracks = rGraph.topTracks.filter(t =>
                        t.uri !== curUri &&
                        !STATE.history.has(t.uri) &&
                        (STATE.mode !== "discovery" || !likedUris.has(t.uri))
                    );

                    if (freshTracks.length > 0) {
                        track = {
                            ...freshTracks[Math.floor(Math.random() * freshTracks.length)],
                            seedUri: candidates[ci].uri,
                            seedArtist: candidates[ci].name,
                        };
                    }
                }
            }
        }

        if (STATE.mode === "favorite" && !track) {
            const clusterComfort = STATE.comfortPool.filter(t =>
                identifyTrackCluster(t) === targetClusterKey &&
                t.uri !== curUri &&
                !STATE.history.has(t.uri)
            );
            track = clusterComfort.length > 0
                ? clusterComfort[Math.floor(Math.random() * clusterComfort.length)]
                : pickComfortTrack(curUri);
        }

        if (STATE.mode === "stream" && !track) {
            const clusterComfort = STATE.comfortPool.filter(t =>
                identifyTrackCluster(t) === targetClusterKey &&
                t.uri !== curUri &&
                !STATE.history.has(t.uri) &&
                !recentArtists.has((t.artist || "").toLowerCase())
            );
            if (clusterComfort.length > 0) {
                track = clusterComfort[Math.floor(Math.random() * clusterComfort.length)];
            }
        }

        if (!track) {
            if (STATE.mode === "discovery") {
                const seedGraph = await getArtistGraph(clusterDef.defaultSeed?.uri);
                const fresh = (seedGraph?.topTracks || []).filter(t => t.uri !== curUri && !likedUris.has(t.uri) && !STATE.history.has(t.uri));
                if (fresh.length > 0) track = fresh[Math.floor(Math.random() * fresh.length)];
            } else {
                track = pickComfortTrack(curUri);
            }
        }

        return track;
    }

    // Background graph pre-warm: at startup fill the artist-graph cache (7-day TTL)
    // so "All tracks" builds instantly. Concurrency-limited, fully silent, runs once per session.
    let graphPrewarmStarted = false;
    async function prewarmArtistGraph() {
        if (graphPrewarmStarted) return;
        graphPrewarmStarted = true;
        try {
            await loadComfortPool();
            if (!STATE.comfortPool.length) return;
            // Most frequent library artists first
            const freq = new Map();
            for (const t of STATE.comfortPool) {
                if (t?.artistUri) freq.set(t.artistUri, (freq.get(t.artistUri) || 0) + 1);
            }
            const seedUris = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([u]) => u);
            const runWithLimit = async (uris, limit) => {
                const queue = [...uris];
                await Promise.all(Array.from({ length: limit }, async () => {
                    while (queue.length) {
                        const uri = queue.shift();
                        try { await getArtistGraph(uri); } catch {}
                    }
                }));
            };
            await runWithLimit(seedUris, 3);
            // Second hop: related artists of library seeds (feeds Discovery mode)
            const level2 = new Set();
            for (const uri of seedUris) {
                const g = memoryArtistCache.get(uri);
                for (const rel of (g?.related || []).slice(0, 5)) if (rel?.uri) level2.add(rel.uri);
            }
            await runWithLimit([...level2].slice(0, 40), 3);
            console.log("[SmartWave] Artist graph pre-warmed");
        } catch (err) {
            console.warn("[SmartWave] prewarm failed:", err);
        }
    }

    let queueDebounceTimer = null;
    function triggerEnsureWaveQueue() {
        if (queueDebounceTimer) clearTimeout(queueDebounceTimer);
        queueDebounceTimer = setTimeout(async () => {
            await ensureWaveQueue();
            renderUpNextList();
            syncNativeQueue();
        }, 300);
    }
    // Sync the Smart Wave queue with Spotify's real internal queue
    async function syncNativeQueue() {
        if (!STATE.active) return;
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
    async function playUpcomingIndex(index) {
        if (!STATE.upcomingWave || index < 0 || index >= STATE.upcomingWave.length) return;
        const target = STATE.upcomingWave[index];
        if (!target || !target.uri) return;
        STATE.upcomingWave.splice(0, index + 1);
        if (STATE.currentTrack) {
            STATE.historyStack.push(STATE.currentTrack);
            if (STATE.historyStack.length > 50) STATE.historyStack.shift();
        }
        try {
            if (Spicetify.Player?.playUri) await Spicetify.Player.playUri(target.uri, {});
        } catch (err) {
            console.warn("[SmartWave] playUri skipped (player not ready)");
        }
        STATE.currentTrack = target;
        STATE.history.add(target.uri);
        if (target.seedUri) {
            STATE.currentSeedUri = target.seedUri;
            STATE.currentSeedArtist = target.seedArtist;
        }
        STATE.currentTrackStartTime = Date.now();
        resetProgressUI();
        await ensureWaveQueue();
        updateUI();
        renderUpNextList();
        syncNativeQueue();
    }
        async function ensureWaveQueue(force = false) {
        if (!STATE.active || (STATE.isQueueing && !force)) return;
        STATE.isQueueing = true;
        try {
            let diversityRetries = 0;
            while (STATE.upcomingWave.length < CONFIG.MIN_QUEUE) {
                const nextTrk = await generateNextTrack();
                const dupe = nextTrk && (
                    STATE.upcomingWave.some(t => t.uri === nextTrk.uri) ||
                    (nextTrk.artist && STATE.upcomingWave.some(t => t.artist === nextTrk.artist)) ||
                    (nextTrk.artist && STATE.currentTrack?.artist === nextTrk.artist)
                );
                if (nextTrk && !dupe) {
                    STATE.upcomingWave.push(nextTrk);
                    STATE.history.add(nextTrk.uri);
                } else {
                    diversityRetries++;
                    if (diversityRetries > 10) break;
                }
            }
        } finally {
            STATE.isQueueing = false;
            renderUpNextList();
            syncNativeQueue();
        }
    }
    // -------------------------------------------------------------------------
    // PLAYBACK CONTROL (ACTIVE ONLY INSIDE THE SCREEN)
    // -------------------------------------------------------------------------
    async function startWave() {
        STATE.active = true;
        updateNavButtonActive(true);
        await loadComfortPool();
        const cur = Spicetify.Player?.data?.item;
        if (cur && cur.uri) {
            const curArtist = fixMojibake(cur.artists?.[0]?.name) || "Artist";
            const curArtistUri = cur.artists?.[0]?.uri || null;
            if (curArtistUri) {
                STATE.currentSeedUri = curArtistUri;
                STATE.currentSeedArtist = curArtist;
            }
            STATE.currentTrack = {
                uri: cur.uri,
                title: fixMojibake(cur.name) || "Track",
                artist: curArtist,
                image: getTrackImages(cur).image || resolveImageUrl(cur.metadata?.image_url || ""),
                thumb: getTrackImages(cur).thumb || resolveImageUrl(cur.metadata?.image_url || ""),
                duration: cur.duration?.milliseconds || safeGetDuration(),
            };
            STATE.history.add(cur.uri);
            STATE.currentTrackStartTime = Date.now();
        } else {
            let first = pickComfortTrack(null);
            if (!first) {
                first = { uri: "spotify:track:2nMeu6UenVvwUktBCpLMK9", title: "Young And Beautiful", artist: "Lana Del Rey" };
            }
            STATE.currentTrack = first;
            STATE.history.add(first.uri);
            if (first.artistUri) {
                STATE.currentSeedUri = first.artistUri;
                STATE.currentSeedArtist = first.artist;
            }
            STATE.currentTrackStartTime = Date.now();
            try {
                if (Spicetify.Player?.playUri) await Spicetify.Player.playUri(first.uri, {});
            } catch (err) {
                console.warn("[SmartWave] startWave playUri skipped (player not ready)");
            }
        }
        STATE.upcomingWave = [];
        await ensureWaveQueue();
        syncNativeQueue();
        updateUI();
    }
    function stopWave() {
        STATE.active = false;
        updateNavButtonActive(false);
    }
    // Skip forward (Skip)
    async function skipWaveTrack(isDislike = false) {
        const curUri = Spicetify.Player?.data?.item?.uri;
        if (STATE.currentTrack) {
            STATE.historyStack.push(STATE.currentTrack);
            if (STATE.historyStack.length > 50) STATE.historyStack.shift();
            // Block the artist ONLY on an explicit Dislike press!
            if (isDislike && STATE.currentTrack.artist) {
                STATE.dislikedArtists.add(STATE.currentTrack.artist.toLowerCase());
                
            }
        }
        let nextTrack = null;
        while (STATE.upcomingWave.length > 0) {
            const candidate = STATE.upcomingWave.shift();
            if (candidate?.uri && candidate.uri !== curUri) {
                nextTrack = candidate;
                break;
            }
        }
        if (!nextTrack) {
            nextTrack = await generateNextTrack();
        }
        if (nextTrack?.uri && nextTrack.uri !== curUri) {
            try {
                if (Spicetify.Player?.playUri) await Spicetify.Player.playUri(nextTrack.uri, {});
            } catch (err) {
                console.warn("[SmartWave] playUri skipped (player not ready)");
            }
            STATE.currentTrack = nextTrack;
            STATE.history.add(nextTrack.uri);
            if (nextTrack.seedUri) {
                STATE.currentSeedUri = nextTrack.seedUri;
                STATE.currentSeedArtist = nextTrack.seedArtist;
            }
            STATE.currentTrackStartTime = Date.now();
            resetProgressUI();
        } else {
            try { Spicetify.Player?.next?.(); } catch (err) {}
        }
        await ensureWaveQueue();
        renderUpNextList();
        syncNativeQueue();
        updateUI();
    }
    async function prevWaveTrack() {
        if (STATE.historyStack.length > 0) {
            const prev = STATE.historyStack.pop();
            if (prev?.uri) {
                if (STATE.currentTrack) {
                    STATE.upcomingWave.unshift(STATE.currentTrack);
                }
                try {
                    if (Spicetify.Player?.playUri) await Spicetify.Player.playUri(prev.uri, {});
                } catch (err) {}
                STATE.currentTrack = prev;
                if (prev.seedUri) {
                    STATE.currentSeedUri = prev.seedUri;
                    STATE.currentSeedArtist = prev.seedArtist;
                }
                STATE.currentTrackStartTime = Date.now();
                updateUI();
                return;
            }
        }
        try { Spicetify.Player?.back?.(); } catch (err) {}
    }
    // =========================================================================
    // RECOMMENDATION ENGINE: CLUSTER SPACE AND ORTHOGONAL SHIFT
