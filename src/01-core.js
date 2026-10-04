// NAME: Smart Wave
// AUTHOR: Shinsha
// DESCRIPTION: Endless personalized radio for Spotify with a WebGL fluid wave visualizer: single cover-art color, silk highlights, pure white on pause
(function SmartWave() {
    if (!Spicetify || !Spicetify.Platform || !Spicetify.URI || !Spicetify.GraphQL) {
        setTimeout(SmartWave, 400);
        return;
    }
    const CONFIG = {
        MIN_QUEUE: 4,
        SKIP_THRESHOLD_SEC: 30, // < 30s: fast skip (-1 point to artist, no ban)
        LIKE_THRESHOLD_SEC: 90, // >= 90s (1m 30s): natural listen (+1 point to artist)
    };
    // Multi-language support (i18n): adapts to the Spotify UI language
    function getLang() {
        const docLang = (document.documentElement?.lang || "").toLowerCase();
        const specLang = (Spicetify.Locale?.getLocale?.() || "").toLowerCase();
        const l = (docLang || specLang || "en").split("-")[0];
        return I18N[l] ? l : "en";
    }
    const I18N = {
        ru: {
            waveTitle: "Smart Wave",
            waveSubtitle: "Бесконечный поток музыки",
            navTitle: "Smart Wave",
            backTitle: "Назад в Spotify (Esc)",
            waveToggleOn: "Включить эффект волны",
            waveToggleOff: "Выключить эффект волны",
            upNextTitle: "Очередь",
            upNextHeader: "Очередь",
            upNextEmpty: "Очередь формируется...",
            coverHint: "Открыть альбом/плейлист трека",
            likeHint: "Лайк (закрепить артиста)",
            prevHint: "Предыдущий трек",
            nextHint: "Скип (следующий трек волны)",
            dislikeHint: "Не моё (увести волну от этого стиля)",
            modeDiscovery: "Открытия",
            modeStream: "Поток",
            modeFavorite: "Любимое",
            modeCustom: "Пользовательский",
            btnShake: "Встряхнуть",
            allTracks: "Все треки",
            browseTitle: "Каталог разделов Spotify",
            browseModalTitle: "Разделы и жанры Spotify",
            browseModalSubtitle: "Закрепите нужные жанры в нижнюю панель волны:",
            customModalTitle: "Мои подборки (Пользовательский)",
            customCloseBtn: "Закрыть",
            customApplyBtn: "Применить",
            customSelectAll: "Выбрать все",
            customDeselectAll: "Снять выбор",
            customLoadingPlaylists: "Загрузка плейлистов...",
            presetsSection: "Пресеты",
            presetNew: "+ Новый",
            presetRename: "Переименовать",
            presetDelete: "Удалить",
            customPlaylistsSection: "Плейлисты",
            likedSongsPlaylistName: "Любимые треки",
            customSelectedCount: (n) => `Выбрано: ${n}`,
            customNoPlaylists: "Плейлисты не найдены",
            customPlaylistDefault: "Плейлист",
            settingsTitle: "Настройки",
            settingsWaveEffect: "Эффект волны",
            settingsReset: "Сбросить все настройки",
            settingsResetConfirm: "Нажмите ещё раз для подтверждения",
            settingsClearTaste: "Сбросить память вкуса",
            settingsClearTasteConfirm: "Нажмите ещё раз для подтверждения",
            tasteCleared: "Память вкуса очищена",
            settingsExport: "Экспорт настроек",
            settingsImport: "Импорт настроек",
            settingsImportError: "Неверный файл настроек",
            settingsRegions: "Исключить региональную музыку",
            settingsRegionsHint: "Треки и артисты этих регионов не попадут в волну",
            customSubModeSection: "Режим подборки",
            customSubModeFlowTitle: "Поток",
            customSubModeFlowDesc: "Баланс нового и любимого",
            customSubModeDiscoveryTitle: "Открытия",
            customSubModeDiscoveryDesc: "Только новая музыка",
            customSubModeFavoriteTitle: "Любимое",
            customSubModeFavoriteDesc: "Только из медиатеки",
            noFavoritesInGenre: "В этом жанре нет любимых треков — включён «Поток»",
            noFavoritesInCustom: "В этой подборке нет любимых треков — включён «Поток»",
            genreUnpinned: "Жанр убран с панели"
        },
        en: {
            waveTitle: "My Wave",
            waveSubtitle: "Endless flow of music",
            navTitle: "Smart Wave",
            backTitle: "Back to Spotify (Esc)",
            waveToggleOn: "Enable wave effect",
            waveToggleOff: "Disable wave effect",
            upNextTitle: "Queue",
            upNextHeader: "Queue",
            upNextEmpty: "Loading queue...",
            coverHint: "Open track source",
            likeHint: "Like (pin artist)",
            prevHint: "Previous track",
            nextHint: "Skip (next wave track)",
            dislikeHint: "Dislike (steer wave away)",
            modeDiscovery: "Discoveries",
            modeStream: "Flow",
            modeFavorite: "Favorites",
            modeCustom: "Custom",
            btnShake: "Shake",
            allTracks: "All tracks",
            browseTitle: "Browse Spotify categories",
            browseModalTitle: "Spotify Browse & Genres",
            browseModalSubtitle: "Pin favorite genres to the bottom wave bar:",
            customModalTitle: "My Playlists (Custom)",
            customCloseBtn: "Close",
            customApplyBtn: "Apply",
            customSelectAll: "Select all",
            customDeselectAll: "Deselect all",
            customLoadingPlaylists: "Loading playlists...",
            presetsSection: "Presets",
            presetNew: "+ New",
            presetRename: "Rename",
            presetDelete: "Delete",
            customPlaylistsSection: "Playlists",
            likedSongsPlaylistName: "Liked Songs",
            customSelectedCount: (n) => `Selected: ${n}`,
            customNoPlaylists: "No playlists found",
            customPlaylistDefault: "Playlist",
            settingsTitle: "Settings",
            settingsWaveEffect: "Wave effect",
            settingsReset: "Reset all settings",
            settingsResetConfirm: "Click again to confirm",
            settingsClearTaste: "Clear taste memory",
            settingsClearTasteConfirm: "Click again to confirm",
            tasteCleared: "Taste memory cleared",
            settingsExport: "Export settings",
            settingsImport: "Import settings",
            settingsImportError: "Invalid settings file",
            settingsRegions: "Exclude regional music",
            settingsRegionsHint: "Tracks and artists from these regions will never enter your wave",
            customSubModeSection: "Recommendation mode",
            customSubModeFlowTitle: "Flow",
            customSubModeFlowDesc: "Balance of new and familiar",
            customSubModeDiscoveryTitle: "Discoveries",
            customSubModeDiscoveryDesc: "Only new music",
            customSubModeFavoriteTitle: "Favorites",
            customSubModeFavoriteDesc: "Library only",
            noFavoritesInGenre: "No favorites in this genre — switched to Flow",
            noFavoritesInCustom: "No favorites in this playlist — switched to Flow",
            genreUnpinned: "Genre unpinned from bar"
        },
        de: {
            waveTitle: "Smart Wave",
            waveSubtitle: "Endloser Musikfluss",
            navTitle: "Smart Wave",
            backTitle: "Zurück zu Spotify (Esc)",
            waveToggleOn: "Wellen-Effekt aktivieren",
            waveToggleOff: "Wellen-Effekt deaktivieren",
            upNextTitle: "Warteschlange",
            upNextHeader: "Warteschlange",
            upNextEmpty: "Warteschlange wird erstellt...",
            coverHint: "Track-Quelle öffnen",
            likeHint: "Likеn (Künstler merken)",
            prevHint: "Vorheriger Titel",
            nextHint: "Überspringen (nächster Wave-Titel)",
            dislikeHint: "Nicht meins (Wave davon weglenken)",
            modeDiscovery: "Entdeckungen",
            modeStream: "Flow",
            modeFavorite: "Favoriten",
            modeCustom: "Custom",
            btnShake: "Mischen",
            allTracks: "Alle Titel",
            browseTitle: "Spotify-Kategorien durchsuchen",
            browseModalTitle: "Spotify-Bereiche & Genres",
            browseModalSubtitle: "Genres in der unteren Leiste anpinnen:",
            customModalTitle: "Meine Playlists (Custom)",
            customCloseBtn: "Schließen",
            customApplyBtn: "Anwenden",
            customSelectAll: "Alle auswählen",
            customDeselectAll: "Auswahl aufheben",
            customLoadingPlaylists: "Playlists werden geladen...",
            presetsSection: "Presets",
            presetNew: "+ Neu",
            presetRename: "Umbenennen",
            presetDelete: "Löschen",
            customPlaylistsSection: "Playlists",
            likedSongsPlaylistName: "Lieblingssongs",
            customSelectedCount: (n) => `Ausgewählt: ${n}`,
            customNoPlaylists: "Keine Playlists gefunden",
            customPlaylistDefault: "Playlist",
            customSubModeSection: "Empfehlungsmodus",
            customSubModeFlowTitle: "Flow",
            customSubModeFlowDesc: "Mix aus Neuem und Vertrautem",
            customSubModeDiscoveryTitle: "Entdeckungen",
            customSubModeDiscoveryDesc: "Nur neue Musik",
            customSubModeFavoriteTitle: "Favoriten",
            customSubModeFavoriteDesc: "Nur aus deiner Bibliothek",
            settingsTitle: "Einstellungen",
            settingsWaveEffect: "Wellen-Effekt",
            settingsReset: "Alle Einstellungen zurücksetzen",
            settingsResetConfirm: "Zur Bestätigung erneut klicken",
            settingsClearTaste: "Geschmacksspeicher löschen",
            settingsClearTasteConfirm: "Zur Bestätigung erneut klicken",
            tasteCleared: "Geschmacksspeicher gelöscht",
            settingsExport: "Einstellungen exportieren",
            settingsImport: "Einstellungen importieren",
            settingsImportError: "Ungültige Einstellungsdatei",
            settingsRegions: "Regionale Musik ausschließen",
            settingsRegionsHint: "Titel und Künstler aus diesen Regionen kommen nie in deine Wave"
        },
        es: {
            waveTitle: "Smart Wave",
            waveSubtitle: "Flujo infinito de música",
            navTitle: "Smart Wave",
            backTitle: "Volver a Spotify (Esc)",
            waveToggleOn: "Activar efecto de onda",
            waveToggleOff: "Desactivar efecto de onda",
            upNextTitle: "Cola",
            upNextHeader: "Cola",
            upNextEmpty: "Generando cola...",
            coverHint: "Abrir fuente del tema",
            likeHint: "Me gusta (fijar artista)",
            prevHint: "Tema anterior",
            nextHint: "Saltar (siguiente tema)",
            dislikeHint: "No es lo mío (alejar la onda)",
            modeDiscovery: "Descubrimientos",
            modeStream: "Flow",
            modeFavorite: "Favoritos",
            modeCustom: "Custom",
            btnShake: "Agitar",
            allTracks: "Todos los temas",
            browseTitle: "Explorar categorías de Spotify",
            browseModalTitle: "Secciones y géneros de Spotify",
            browseModalSubtitle: "Fija géneros en la barra inferior:",
            customModalTitle: "Mis playlists (Custom)",
            customCloseBtn: "Cerrar",
            customApplyBtn: "Aplicar",
            customSelectAll: "Seleccionar todo",
            customDeselectAll: "Quitar selección",
            customLoadingPlaylists: "Cargando playlists...",
            presetsSection: "Presets",
            presetNew: "+ Nueva",
            presetRename: "Renombrar",
            presetDelete: "Eliminar",
            customPlaylistsSection: "Playlists",
            likedSongsPlaylistName: "Tus Me Gusta",
            customSelectedCount: (n) => `Seleccionadas: ${n}`,
            customNoPlaylists: "No se encontraron playlists",
            customPlaylistDefault: "Playlist",
            customSubModeSection: "Modo de recomendación",
            customSubModeFlowTitle: "Flow",
            customSubModeFlowDesc: "Equilibrio entre nuevo y conocido",
            customSubModeDiscoveryTitle: "Descubrimientos",
            customSubModeDiscoveryDesc: "Solo música nueva",
            customSubModeFavoriteTitle: "Favoritos",
            customSubModeFavoriteDesc: "Solo de tu biblioteca",
            settingsTitle: "Ajustes",
            settingsWaveEffect: "Efecto de onda",
            settingsReset: "Restablecer todos los ajustes",
            settingsResetConfirm: "Haz clic de nuevo para confirmar",
            settingsClearTaste: "Borrar memoria de gusto",
            settingsClearTasteConfirm: "Haz clic de nuevo para confirmar",
            tasteCleared: "Memoria de gusto borrada",
            settingsExport: "Exportar ajustes",
            settingsImport: "Importar ajustes",
            settingsImportError: "Archivo de ajustes no válido",
            settingsRegions: "Excluir música regional",
            settingsRegionsHint: "Los temas y artistas de estas regiones nunca entrarán en tu wave"
        },
        fr: {
            waveTitle: "Smart Wave",
            waveSubtitle: "Flux infini de musique",
            navTitle: "Smart Wave",
            backTitle: "Retour à Spotify (Échap)",
            waveToggleOn: "Activer l'effet de vague",
            waveToggleOff: "Désactiver l'effet de vague",
            upNextTitle: "File d'attente",
            upNextHeader: "File d'attente",
            upNextEmpty: "Génération de la file...",
            coverHint: "Ouvrir la source du titre",
            likeHint: "Aimer (épingler l'artiste)",
            prevHint: "Titre précédent",
            nextHint: "Passer (titre suivant)",
            dislikeHint: "Pas pour moi (éloigner la vague)",
            modeDiscovery: "Découvertes",
            modeStream: "Flow",
            modeFavorite: "Favoris",
            modeCustom: "Custom",
            btnShake: "Secouer",
            allTracks: "Tous les titres",
            browseTitle: "Parcourir les catégories Spotify",
            browseModalTitle: "Sections et genres Spotify",
            browseModalSubtitle: "Épinglez des genres dans la barre du bas :",
            customModalTitle: "Mes playlists (Custom)",
            customCloseBtn: "Fermer",
            customApplyBtn: "Appliquer",
            customSelectAll: "Tout sélectionner",
            customDeselectAll: "Tout désélectionner",
            customLoadingPlaylists: "Chargement des playlists...",
            presetsSection: "Presets",
            presetNew: "+ Nouveau",
            presetRename: "Renommer",
            presetDelete: "Supprimer",
            customPlaylistsSection: "Playlists",
            likedSongsPlaylistName: "Titres likés",
            customSelectedCount: (n) => `Sélectionnées : ${n}`,
            customNoPlaylists: "Aucune playlist trouvée",
            customPlaylistDefault: "Playlist",
            customSubModeSection: "Mode de recommandation",
            customSubModeFlowTitle: "Flow",
            customSubModeFlowDesc: "Équilibre entre nouveau et connu",
            customSubModeDiscoveryTitle: "Découvertes",
            customSubModeDiscoveryDesc: "Uniquement de la nouvelle musique",
            customSubModeFavoriteTitle: "Favoris",
            customSubModeFavoriteDesc: "Uniquement depuis votre bibliothèque",
            settingsTitle: "Paramètres",
            settingsWaveEffect: "Effet de vague",
            settingsReset: "Réinitialiser tous les paramètres",
            settingsResetConfirm: "Cliquez à nouveau pour confirmer",
            settingsClearTaste: "Effacer la mémoire du goût",
            settingsClearTasteConfirm: "Cliquez à nouveau pour confirmer",
            tasteCleared: "Mémoire du goût effacée",
            settingsExport: "Exporter les paramètres",
            settingsImport: "Importer les paramètres",
            settingsImportError: "Fichier de paramètres invalide",
            settingsRegions: "Exclure la musique régionale",
            settingsRegionsHint: "Les titres et artistes de ces régions n'entreront jamais dans votre vague"
        },
        pt: {
            waveTitle: "Smart Wave",
            waveSubtitle: "Fluxo infinito de música",
            navTitle: "Smart Wave",
            backTitle: "Voltar ao Spotify (Esc)",
            waveToggleOn: "Ativar efeito de onda",
            waveToggleOff: "Desativar efeito de onda",
            upNextTitle: "Fila",
            upNextHeader: "Fila",
            upNextEmpty: "Gerando fila...",
            coverHint: "Abrir fonte da faixa",
            likeHint: "Curtir (fixar artista)",
            prevHint: "Faixa anterior",
            nextHint: "Pular (próxima faixa)",
            dislikeHint: "Não é pra mim (afastar a onda)",
            modeDiscovery: "Descobertas",
            modeStream: "Flow",
            modeFavorite: "Favoritas",
            modeCustom: "Custom",
            btnShake: "Agitar",
            allTracks: "Todas as faixas",
            browseTitle: "Explorar categorias do Spotify",
            browseModalTitle: "Seções e gêneros do Spotify",
            browseModalSubtitle: "Fixe gêneros na barra inferior:",
            customModalTitle: "Minhas playlists (Custom)",
            customCloseBtn: "Fechar",
            customApplyBtn: "Aplicar",
            customSelectAll: "Selecionar tudo",
            customDeselectAll: "Limpar seleção",
            customLoadingPlaylists: "Carregando playlists...",
            presetsSection: "Presets",
            presetNew: "+ Nova",
            presetRename: "Renomear",
            presetDelete: "Excluir",
            customPlaylistsSection: "Playlists",
            likedSongsPlaylistName: "Músicas Curtidas",
            customSelectedCount: (n) => `Selecionadas: ${n}`,
            customNoPlaylists: "Nenhuma playlist encontrada",
            customPlaylistDefault: "Playlist",
            customSubModeSection: "Modo de recomendação",
            customSubModeFlowTitle: "Flow",
            customSubModeFlowDesc: "Equilíbrio entre novo e conhecido",
            customSubModeDiscoveryTitle: "Descobertas",
            customSubModeDiscoveryDesc: "Apenas música nova",
            customSubModeFavoriteTitle: "Favoritas",
            customSubModeFavoriteDesc: "Apenas da sua biblioteca",
            settingsTitle: "Configurações",
            settingsWaveEffect: "Efeito de onda",
            settingsReset: "Redefinir todas as configurações",
            settingsResetConfirm: "Clique novamente para confirmar",
            settingsClearTaste: "Limpar memória de gosto",
            settingsClearTasteConfirm: "Clique novamente para confirmar",
            tasteCleared: "Memória de gosto limpa",
            settingsExport: "Exportar configurações",
            settingsImport: "Importar configurações",
            settingsImportError: "Arquivo de configurações inválido",
            settingsRegions: "Excluir música regional",
            settingsRegionsHint: "Faixas e artistas dessas regiões nunca entrarão na sua wave"
        },
        it: {
            waveTitle: "Smart Wave",
            waveSubtitle: "Flusso infinito di musica",
            navTitle: "Smart Wave",
            backTitle: "Torna a Spotify (Esc)",
            waveToggleOn: "Attiva effetto onda",
            waveToggleOff: "Disattiva effetto onda",
            upNextTitle: "Coda",
            upNextHeader: "Coda",
            upNextEmpty: "Generazione coda...",
            coverHint: "Apri sorgente brano",
            likeHint: "Mi piace (fissa artista)",
            prevHint: "Brano precedente",
            nextHint: "Salta (brano successivo)",
            dislikeHint: "Non fa per me (allontana l'onda)",
            modeDiscovery: "Scoperte",
            modeStream: "Flow",
            modeFavorite: "Preferiti",
            modeCustom: "Custom",
            btnShake: "Scuoti",
            allTracks: "Tutti i brani",
            browseTitle: "Sfoglia categorie Spotify",
            browseModalTitle: "Sezioni e generi Spotify",
            browseModalSubtitle: "Fissa i generi nella barra in basso:",
            customModalTitle: "Le mie playlist (Custom)",
            customCloseBtn: "Chiudi",
            customApplyBtn: "Applica",
            customSelectAll: "Seleziona tutto",
            customDeselectAll: "Deseleziona tutto",
            customLoadingPlaylists: "Caricamento playlist...",
            presetsSection: "Preset",
            presetNew: "+ Nuovo",
            presetRename: "Rinomina",
            presetDelete: "Elimina",
            customPlaylistsSection: "Playlist",
            likedSongsPlaylistName: "Brani che ti piacciono",
            customSelectedCount: (n) => `Selezionate: ${n}`,
            customNoPlaylists: "Nessuna playlist trovata",
            customPlaylistDefault: "Playlist",
            customSubModeSection: "Modalità di consiglio",
            customSubModeFlowTitle: "Flow",
            customSubModeFlowDesc: "Equilibrio tra nuovo e familiare",
            customSubModeDiscoveryTitle: "Scoperte",
            customSubModeDiscoveryDesc: "Solo musica nuova",
            customSubModeFavoriteTitle: "Preferiti",
            customSubModeFavoriteDesc: "Solo dalla tua libreria",
            settingsTitle: "Impostazioni",
            settingsWaveEffect: "Effetto onda",
            settingsReset: "Reimposta tutte le impostazioni",
            settingsResetConfirm: "Clicca di nuovo per confermare",
            settingsClearTaste: "Cancella memoria del gusto",
            settingsClearTasteConfirm: "Clicca di nuovo per confermare",
            tasteCleared: "Memoria del gusto cancellata",
            settingsExport: "Esporta impostazioni",
            settingsImport: "Importa impostazioni",
            settingsImportError: "File di impostazioni non valido",
            settingsRegions: "Escludi musica regionale",
            settingsRegionsHint: "Brani e artisti di queste regioni non entreranno mai nella tua wave"
        },
        pl: {
            waveTitle: "Smart Wave",
            waveSubtitle: "Nieskończony strumień muzyki",
            navTitle: "Smart Wave",
            backTitle: "Wróć do Spotify (Esc)",
            waveToggleOn: "Włącz efekt fali",
            waveToggleOff: "Wyłącz efekt fali",
            upNextTitle: "Kolejka",
            upNextHeader: "Kolejka",
            upNextEmpty: "Tworzenie kolejki...",
            coverHint: "Otwórz źródło utworu",
            likeHint: "Polub (przypnij artystę)",
            prevHint: "Poprzedni utwór",
            nextHint: "Pomiń (następny utwór fali)",
            dislikeHint: "Nie moje (odprowadź falę)",
            modeDiscovery: "Odkrycia",
            modeStream: "Flow",
            modeFavorite: "Ulubione",
            modeCustom: "Custom",
            btnShake: "Wstrząśnij",
            allTracks: "Wszystkie utwory",
            browseTitle: "Przeglądaj kategorie Spotify",
            browseModalTitle: "Sekcje i gatunki Spotify",
            browseModalSubtitle: "Przypnij gatunki do dolnego paska:",
            customModalTitle: "Moje playlisty (Custom)",
            customCloseBtn: "Zamknij",
            customApplyBtn: "Zastosuj",
            customSelectAll: "Zaznacz wszystko",
            customDeselectAll: "Odznacz wszystko",
            customLoadingPlaylists: "Ładowanie playlist...",
            presetsSection: "Presety",
            presetNew: "+ Nowy",
            presetRename: "Zmień nazwę",
            presetDelete: "Usuń",
            customPlaylistsSection: "Playlisty",
            likedSongsPlaylistName: "Polubione utwory",
            customSelectedCount: (n) => `Wybrano: ${n}`,
            customNoPlaylists: "Nie znaleziono playlist",
            customPlaylistDefault: "Playlista",
            customSubModeSection: "Tryb rekomendacji",
            customSubModeFlowTitle: "Flow",
            customSubModeFlowDesc: "Równowaga nowego i znanego",
            customSubModeDiscoveryTitle: "Odkrycia",
            customSubModeDiscoveryDesc: "Tylko nowa muzyka",
            customSubModeFavoriteTitle: "Ulubione",
            customSubModeFavoriteDesc: "Tylko z Twojej biblioteki",
            settingsTitle: "Ustawienia",
            settingsWaveEffect: "Efekt fali",
            settingsReset: "Zresetuj wszystkie ustawienia",
            settingsResetConfirm: "Kliknij ponownie, aby potwierdzić",
            settingsClearTaste: "Wyczyść pamięć gustu",
            settingsClearTasteConfirm: "Kliknij ponownie, aby potwierdzić",
            tasteCleared: "Pamięć gustu wyczyszczona",
            settingsExport: "Eksportuj ustawienia",
            settingsImport: "Importuj ustawienia",
            settingsImportError: "Nieprawidłowy plik ustawień",
            settingsRegions: "Wyklucz muzykę regionalną",
            settingsRegionsHint: "Utwory i artyści z tych regionów nigdy nie trafią do Twojej fali"
        },
        tr: {
            waveTitle: "Smart Wave",
            waveSubtitle: "Sonsuz müzik akışı",
            navTitle: "Smart Wave",
            backTitle: "Spotify'a dön (Esc)",
            waveToggleOn: "Dalga efektini aç",
            waveToggleOff: "Dalga efektini kapat",
            upNextTitle: "Sıra",
            upNextHeader: "Sıra",
            upNextEmpty: "Sıra oluşturuluyor...",
            coverHint: "Parça kaynağını aç",
            likeHint: "Beğen (sanatçıyı sabitle)",
            prevHint: "Önceki parça",
            nextHint: "Atla (sonraki parça)",
            dislikeHint: "Bana göre değil (dalgayı uzaklaştır)",
            modeDiscovery: "Keşifler",
            modeStream: "Flow",
            modeFavorite: "Favoriler",
            modeCustom: "Custom",
            btnShake: "Salla",
            allTracks: "Tüm parçalar",
            browseTitle: "Spotify kategorilerine göz at",
            browseModalTitle: "Spotify bölümleri ve türler",
            browseModalSubtitle: "Alt çubuğa türleri sabitle:",
            customModalTitle: "Çalma listelerim (Custom)",
            customCloseBtn: "Kapat",
            customApplyBtn: "Uygula",
            customSelectAll: "Tümünü seç",
            customDeselectAll: "Seçimi kaldır",
            customLoadingPlaylists: "Çalma listeleri yükleniyor...",
            presetsSection: "Hazır ayarlar",
            presetNew: "+ Yeni",
            presetRename: "Yeniden adlandır",
            presetDelete: "Sil",
            customPlaylistsSection: "Çalma listeleri",
            likedSongsPlaylistName: "Beğenilen Şarkılar",
            customSelectedCount: (n) => `Seçildi: ${n}`,
            customNoPlaylists: "Çalma listesi bulunamadı",
            customPlaylistDefault: "Çalma listesi",
            customSubModeSection: "Öneri modu",
            customSubModeFlowTitle: "Flow",
            customSubModeFlowDesc: "Yeni ve tanıdık dengesi",
            customSubModeDiscoveryTitle: "Keşifler",
            customSubModeDiscoveryDesc: "Sadece yeni müzik",
            customSubModeFavoriteTitle: "Favoriler",
            customSubModeFavoriteDesc: "Sadece kitaplığından",
            settingsTitle: "Ayarlar",
            settingsWaveEffect: "Dalga efekti",
            settingsReset: "Tüm ayarları sıfırla",
            settingsResetConfirm: "Onaylamak için tekrar tıkla",
            settingsClearTaste: "Müzik zevki hafızasını sil",
            settingsClearTasteConfirm: "Onaylamak için tekrar tıkla",
            tasteCleared: "Müzik zevki hafızası silindi",
            settingsExport: "Ayarları dışa aktar",
            settingsImport: "Ayarları içe aktar",
            settingsImportError: "Geçersiz ayar dosyası",
            settingsRegions: "Bölgesel müziği hariç tut",
            settingsRegionsHint: "Bu bölgelerin parçaları ve sanatçıları dalgana asla girmez"
        },
        uk: {
            waveTitle: "Smart Wave",
            waveSubtitle: "Нескінченний потік музики",
            navTitle: "Smart Wave",
            backTitle: "Назад до Spotify (Esc)",
            waveToggleOn: "Увімкнути ефект хвилі",
            waveToggleOff: "Вимкнути ефект хвилі",
            upNextTitle: "Черга",
            upNextHeader: "Черга",
            upNextEmpty: "Черга формується...",
            coverHint: "Відкрити джерело треку",
            likeHint: "Лайк (закріпити артиста)",
            prevHint: "Попередній трек",
            nextHint: "Пропустити (наступний трек)",
            dislikeHint: "Не моє (відвести хвилю)",
            modeDiscovery: "Відкриття",
            modeStream: "Потік",
            modeFavorite: "Улюблене",
            modeCustom: "Custom",
            btnShake: "Струсити",
            allTracks: "Усі треки",
            browseTitle: "Каталог розділів Spotify",
            browseModalTitle: "Розділи та жанри Spotify",
            browseModalSubtitle: "Закріпіть жанри на нижній панелі:",
            customModalTitle: "Мої добірки (Custom)",
            customCloseBtn: "Закрити",
            customApplyBtn: "Застосувати",
            customSelectAll: "Вибрати все",
            customDeselectAll: "Зняти вибір",
            customLoadingPlaylists: "Завантаження плейлистів...",
            presetsSection: "Пресети",
            presetNew: "+ Новий",
            presetRename: "Перейменувати",
            presetDelete: "Видалити",
            customPlaylistsSection: "Плейлисти",
            likedSongsPlaylistName: "Улюблені треки",
            customSelectedCount: (n) => `Вибрано: ${n}`,
            customNoPlaylists: "Плейлисти не знайдені",
            customPlaylistDefault: "Плейлист",
            customSubModeSection: "Режим підбірки",
            customSubModeFlowTitle: "Потік",
            customSubModeFlowDesc: "Баланс нового й улюбленого",
            customSubModeDiscoveryTitle: "Відкриття",
            customSubModeDiscoveryDesc: "Лише нова музика",
            customSubModeFavoriteTitle: "Улюблене",
            customSubModeFavoriteDesc: "Лише з медіатеки",
            settingsTitle: "Налаштування",
            settingsWaveEffect: "Ефект хвилі",
            settingsReset: "Скинути всі налаштування",
            settingsResetConfirm: "Натисніть ще раз для підтвердження",
            settingsClearTaste: "Скинути пам'ять смаку",
            settingsClearTasteConfirm: "Натисніть ще раз для підтвердження",
            tasteCleared: "Пам'ять смаку скинута",
            settingsExport: "Експорт налаштувань",
            settingsImport: "Імпорт налаштувань",
            settingsImportError: "Невірний файл налаштувань",
            settingsRegions: "Виключити регіональну музику",
            settingsRegionsHint: "Треки й артисти цих регіонів ніколи не потраплять у хвилю"
        },
        ja: {
            waveTitle: "Smart Wave",
            waveSubtitle: "終わらない音楽の流れ",
            navTitle: "Smart Wave",
            backTitle: "Spotifyに戻る (Esc)",
            waveToggleOn: "ウェーブエフェクトをオン",
            waveToggleOff: "ウェーブエフェクトをオフ",
            upNextTitle: "キュー",
            upNextHeader: "キュー",
            upNextEmpty: "キューを生成中...",
            coverHint: "トラックのソースを開く",
            likeHint: "お気に入り (アーティストを固定)",
            prevHint: "前のトラック",
            nextHint: "スキップ (次のトラック)",
            dislikeHint: "好みではない (ウェーブを遠ざける)",
            modeDiscovery: "ディスカバリー",
            modeStream: "フロー",
            modeFavorite: "お気に入り",
            modeCustom: "Custom",
            btnShake: "シャッフル",
            allTracks: "すべてのトラック",
            browseTitle: "Spotifyカテゴリを見る",
            browseModalTitle: "Spotifyのセクションとジャンル",
            browseModalSubtitle: "下のバーにジャンルをピン留め:",
            customModalTitle: "マイプレイリスト (Custom)",
            customCloseBtn: "閉じる",
            customApplyBtn: "適用",
            customSelectAll: "すべて選択",
            customDeselectAll: "選択解除",
            customLoadingPlaylists: "プレイリストを読み込み中...",
            presetsSection: "プリセット",
            presetNew: "+ 新規",
            presetRename: "名前を変更",
            presetDelete: "削除",
            customPlaylistsSection: "プレイリスト",
            likedSongsPlaylistName: "お気に入りの曲",
            customSelectedCount: (n) => `選択中: ${n}`,
            customNoPlaylists: "プレイリストが見つかりません",
            customPlaylistDefault: "プレイリスト",
            customSubModeSection: "レコメンドモード",
            customSubModeFlowTitle: "フロー",
            customSubModeFlowDesc: "新規とお気に入りのバランス",
            customSubModeDiscoveryTitle: "ディスカバリー",
            customSubModeDiscoveryDesc: "新しい音楽のみ",
            customSubModeFavoriteTitle: "お気に入り",
            customSubModeFavoriteDesc: "ライブラリからのみ",
            settingsTitle: "設定",
            settingsWaveEffect: "ウェーブエフェクト",
            settingsReset: "すべての設定をリセット",
            settingsResetConfirm: "もう一度クリックして確認",
            settingsClearTaste: "音楽の好みをリセット",
            settingsClearTasteConfirm: "もう一度クリックして確認",
            tasteCleared: "音楽の好みをリセットしました",
            settingsExport: "設定をエクスポート",
            settingsImport: "設定をインポート",
            settingsImportError: "無効な設定ファイル",
            settingsRegions: "地域の音楽を除外",
            settingsRegionsHint: "これらの地域のトラックとアーティストはウェーブに入りません"
        },
        ko: {
            waveTitle: "Smart Wave",
            waveSubtitle: "끝없는 음악 흐름",
            navTitle: "Smart Wave",
            backTitle: "Spotify로 돌아가기 (Esc)",
            waveToggleOn: "웨이브 효과 켜기",
            waveToggleOff: "웨이브 효과 끄기",
            upNextTitle: "대기열",
            upNextHeader: "대기열",
            upNextEmpty: "대기열 생성 중...",
            coverHint: "트랙 소스 열기",
            likeHint: "좋아요 (아티스트 고정)",
            prevHint: "이전 트랙",
            nextHint: "건너뛰기 (다음 트랙)",
            dislikeHint: "취향 아님 (웨이브 멀어지기)",
            modeDiscovery: "디스커버리",
            modeStream: "플로우",
            modeFavorite: "즐겨찾기",
            modeCustom: "Custom",
            btnShake: "흔들기",
            allTracks: "모든 트랙",
            browseTitle: "Spotify 카테고리 둘러보기",
            browseModalTitle: "Spotify 섹션 및 장르",
            browseModalSubtitle: "하단 바에 장르 고정:",
            customModalTitle: "내 플레이리스트 (Custom)",
            customCloseBtn: "닫기",
            customApplyBtn: "적용",
            customSelectAll: "모두 선택",
            customDeselectAll: "선택 해제",
            customLoadingPlaylists: "플레이리스트 로딩 중...",
            presetsSection: "프리셋",
            presetNew: "+ 새로 만들기",
            presetRename: "이름 바꾸기",
            presetDelete: "삭제",
            customPlaylistsSection: "플레이리스트",
            likedSongsPlaylistName: "좋아요 표시한 곡",
            customSelectedCount: (n) => `선택됨: ${n}`,
            customNoPlaylists: "플레이리스트를 찾을 수 없음",
            customPlaylistDefault: "플레이리스트",
            customSubModeSection: "추천 모드",
            customSubModeFlowTitle: "플로우",
            customSubModeFlowDesc: "새 음악과 익숙한 음악의 균형",
            customSubModeDiscoveryTitle: "디스커버리",
            customSubModeDiscoveryDesc: "새 음악만",
            customSubModeFavoriteTitle: "즐겨찾기",
            customSubModeFavoriteDesc: "내 라이브러리에서만",
            settingsTitle: "설정",
            settingsWaveEffect: "웨이브 효과",
            settingsReset: "모든 설정 초기화",
            settingsResetConfirm: "확인하려면 다시 클릭하세요",
            settingsClearTaste: "취향 기록 초기화",
            settingsClearTasteConfirm: "확인하려면 다시 클릭하세요",
            tasteCleared: "취향 기록이 초기화되었습니다",
            settingsExport: "설정 내보내기",
            settingsImport: "설정 가져오기",
            settingsImportError: "잘못된 설정 파일",
            settingsRegions: "지역 음악 제외",
            settingsRegionsHint: "해당 지역의 트랙과 아티스트는 웨이브에 들어오지 않습니다"
        },
        zh: {
            waveTitle: "Smart Wave",
            waveSubtitle: "无尽的音乐流",
            navTitle: "Smart Wave",
            backTitle: "返回 Spotify (Esc)",
            waveToggleOn: "开启波浪效果",
            waveToggleOff: "关闭波浪效果",
            upNextTitle: "队列",
            upNextHeader: "队列",
            upNextEmpty: "正在生成队列...",
            coverHint: "打开曲目来源",
            likeHint: "喜欢 (固定艺人)",
            prevHint: "上一首",
            nextHint: "跳过 (下一首)",
            dislikeHint: "不喜欢 (让波浪远离)",
            modeDiscovery: "发现",
            modeStream: "流动",
            modeFavorite: "最爱",
            modeCustom: "Custom",
            btnShake: "摇一摇",
            allTracks: "全部曲目",
            browseTitle: "浏览 Spotify 分类",
            browseModalTitle: "Spotify 板块与流派",
            browseModalSubtitle: "将流派固定到底部栏:",
            customModalTitle: "我的歌单 (Custom)",
            customCloseBtn: "关闭",
            customApplyBtn: "应用",
            customSelectAll: "全选",
            customDeselectAll: "取消全选",
            customLoadingPlaylists: "正在加载歌单...",
            presetsSection: "预设",
            presetNew: "+ 新建",
            presetRename: "重命名",
            presetDelete: "删除",
            customPlaylistsSection: "歌单",
            likedSongsPlaylistName: "已赞歌曲",
            customSelectedCount: (n) => `已选: ${n}`,
            customNoPlaylists: "未找到歌单",
            customPlaylistDefault: "歌单",
            customSubModeSection: "推荐模式",
            customSubModeFlowTitle: "流动",
            customSubModeFlowDesc: "新旧平衡",
            customSubModeDiscoveryTitle: "发现",
            customSubModeDiscoveryDesc: "仅新音乐",
            customSubModeFavoriteTitle: "最爱",
            customSubModeFavoriteDesc: "仅来自你的音乐库",
            settingsTitle: "设置",
            settingsWaveEffect: "波浪效果",
            settingsReset: "重置所有设置",
            settingsResetConfirm: "再次点击以确认",
            settingsClearTaste: "清除音乐偏好记录",
            settingsClearTasteConfirm: "再次点击以确认",
            tasteCleared: "已清除音乐偏好记录",
            settingsExport: "导出设置",
            settingsImport: "导入设置",
            settingsImportError: "设置文件无效",
            settingsRegions: "排除地区音乐",
            settingsRegionsHint: "这些地区的曲目和艺人不会进入你的 Wave"
        },
        nl: {
            waveTitle: "Smart Wave",
            waveSubtitle: "Eindeloze muziekstroom",
            navTitle: "Smart Wave",
            backTitle: "Terug naar Spotify (Esc)",
            waveToggleOn: "Golfeffect inschakelen",
            waveToggleOff: "Golfeffect uitschakelen",
            upNextTitle: "Wachtrij",
            upNextHeader: "Wachtrij",
            upNextEmpty: "Wachtrij wordt gemaakt...",
            coverHint: "Trackbron openen",
            likeHint: "Liken (artiest vastpinnen)",
            prevHint: "Vorige track",
            nextHint: "Overslaan (volgende track)",
            dislikeHint: "Niet mijn smaak (golf wegsturen)",
            modeDiscovery: "Ontdekkingen",
            modeStream: "Flow",
            modeFavorite: "Favorieten",
            modeCustom: "Custom",
            btnShake: "Schudden",
            allTracks: "Alle tracks",
            browseTitle: "Spotify-categorieën verkennen",
            browseModalTitle: "Spotify-secties en genres",
            browseModalSubtitle: "Pin genres in de onderste balk:",
            customModalTitle: "Mijn playlists (Custom)",
            customCloseBtn: "Sluiten",
            customApplyBtn: "Toepassen",
            customSelectAll: "Alles selecteren",
            customDeselectAll: "Selectie wissen",
            customLoadingPlaylists: "Playlists laden...",
            presetsSection: "Presets",
            presetNew: "+ Nieuw",
            presetRename: "Hernoemen",
            presetDelete: "Verwijderen",
            customPlaylistsSection: "Playlists",
            likedSongsPlaylistName: "Gelikete songs",
            customSelectedCount: (n) => `Geselecteerd: ${n}`,
            customNoPlaylists: "Geen playlists gevonden",
            customPlaylistDefault: "Playlist",
            customSubModeSection: "Aanbevelingsmodus",
            customSubModeFlowTitle: "Flow",
            customSubModeFlowDesc: "Balans tussen nieuw en vertrouwd",
            customSubModeDiscoveryTitle: "Ontdekkingen",
            customSubModeDiscoveryDesc: "Alleen nieuwe muziek",
            customSubModeFavoriteTitle: "Favorieten",
            customSubModeFavoriteDesc: "Alleen uit je bibliotheek",
            settingsTitle: "Instellingen",
            settingsWaveEffect: "Golfeffect",
            settingsReset: "Alle instellingen resetten",
            settingsResetConfirm: "Klik nogmaals om te bevestigen",
            settingsClearTaste: "Smaakgeheugen wissen",
            settingsClearTasteConfirm: "Klik nogmaals om te bevestigen",
            tasteCleared: "Smaakgeheugen gewist",
            settingsExport: "Instellingen exporteren",
            settingsImport: "Instellingen importeren",
            settingsImportError: "Ongeldig instellingenbestand",
            settingsRegions: "Regionale muziek uitsluiten",
            settingsRegionsHint: "Tracks en artiesten uit deze regio's komen nooit in je wave"
        },
        sv: {
            waveTitle: "Smart Wave",
            waveSubtitle: "Ändlöst musikflöde",
            navTitle: "Smart Wave",
            backTitle: "Tillbaka till Spotify (Esc)",
            waveToggleOn: "Aktivera vågeffekt",
            waveToggleOff: "Inaktivera vågeffekt",
            upNextTitle: "Kö",
            upNextHeader: "Kö",
            upNextEmpty: "Skapar kö...",
            coverHint: "Öppna låtens källa",
            likeHint: "Gilla (fäst artisten)",
            prevHint: "Föregående låt",
            nextHint: "Hoppa över (nästa låt)",
            dislikeHint: "Inte min stil (styr bort vågen)",
            modeDiscovery: "Upptäckter",
            modeStream: "Flow",
            modeFavorite: "Favoriter",
            modeCustom: "Custom",
            btnShake: "Skaka",
            allTracks: "Alla låtar",
            browseTitle: "Bläddra i Spotify-kategorier",
            browseModalTitle: "Spotify-sektioner och genrer",
            browseModalSubtitle: "Fäst genrer i nedersta raden:",
            customModalTitle: "Mina spellistor (Custom)",
            customCloseBtn: "Stäng",
            customApplyBtn: "Tillämpa",
            customSelectAll: "Välj alla",
            customDeselectAll: "Avmarkera alla",
            customLoadingPlaylists: "Laddar spellistor...",
            presetsSection: "Förinställningar",
            presetNew: "+ Ny",
            presetRename: "Byt namn",
            presetDelete: "Ta bort",
            customPlaylistsSection: "Spellistor",
            likedSongsPlaylistName: "Gillade låtar",
            customSelectedCount: (n) => `Valda: ${n}`,
            customNoPlaylists: "Inga spellistor hittades",
            customPlaylistDefault: "Spellista",
            customSubModeSection: "Rekommendationsläge",
            customSubModeFlowTitle: "Flow",
            customSubModeFlowDesc: "Balans mellan nytt och bekant",
            customSubModeDiscoveryTitle: "Upptäckter",
            customSubModeDiscoveryDesc: "Bara ny musik",
            customSubModeFavoriteTitle: "Favoriter",
            customSubModeFavoriteDesc: "Bara från ditt bibliotek",
            settingsTitle: "Inställningar",
            settingsWaveEffect: "Vågeffekt",
            settingsReset: "Återställ alla inställningar",
            settingsResetConfirm: "Klicka igen för att bekräfta",
            settingsClearTaste: "Radera smakminne",
            settingsClearTasteConfirm: "Klicka igen för att bekräfta",
            tasteCleared: "Smakminne raderat",
            settingsExport: "Exportera inställningar",
            settingsImport: "Importera inställningar",
            settingsImportError: "Ogiltig inställningsfil",
            settingsRegions: "Exkludera regional musik",
            settingsRegionsHint: "Låtar och artister från dessa regioner hamnar aldrig i din wave"
        }
    };
    // Regional filtering presets (global release, not hardcoded to one country)
    // Regional filter presets (user-configurable; ordered by cheapest Premium regions first)
    const REGION_PRESETS = {
        tr: { label: { en: "Turkish", ru: "Турецкая" }, chars: /[ğışİĞŞçÇ]/, keywords: [
            "türkçe","turkce","turkish","anadolu","arabesk","halay","türk pop","turk pop","türk rap","turk rap",
            "türk rock","turk rock","şarkı","şarkılar","türkiye","turkiye","remix adam","mor ve ötesi","madrigal",
            "pilli bebek","duman","sezen aksu","tarkan","demet akalın","ezhel","lvbel c5","sefo","çakal","reckol",
            "batuflex","cakal","yüzyüzeyken","manga","gripin","barış manço","cem karaca","teoman","haluk levent",
            "feridun düzağaç","şebnem ferah","hayko cepkin","yüksek sadakat","zakkum","kolpa","dedublüman",
            "mavi gri","yaşlı amca","kıraç","kurban","pentagram","ogün sanlısoy","kalben" ] },
        in: { label: { en: "Indian", ru: "Индийская" }, chars: /[\u0900-\u097F]/, keywords: [
            "bollywood","punjabi","tollywood","kollywood","bhojpuri","desi hip hop" ] },
        pk: { label: { en: "Pakistani", ru: "Пакистанская" }, chars: /[\u0600-\u06FF]/, keywords: [
            "lollywood","pakistani pop","pakistani rap" ] },
        eg: { label: { en: "Egyptian / Arabic", ru: "Египетская / Арабская" }, chars: /[\u0600-\u06FF]/, keywords: [
            "mahraganat","mahragan","egyptian pop","khaleeji" ] },
        vn: { label: { en: "Vietnamese", ru: "Вьетнамская" }, chars: /[ăâêôơưĂÂÊÔƠƯ]/, keywords: [
            "v-pop","vpop","vietnamese","nhạc trẻ","nhac tre" ] },
        ph: { label: { en: "Filipino", ru: "Филиппинская" }, chars: null, keywords: [
            "opm","tagalog","pinoy","p-pop","ppop" ] },
        id: { label: { en: "Indonesian", ru: "Индонезийская" }, chars: null, keywords: [
            "dangdut","koplo","indonesian pop","indo pop" ] },
        ng: { label: { en: "Nigerian", ru: "Нигерийская" }, chars: null, keywords: [
            "afrobeats","naija","nigerian" ] },
        ar: { label: { en: "Argentinian", ru: "Аргентинская" }, chars: null, keywords: [
            "cuarteto","tango","trap argentino","rkt " ] },
        za: { label: { en: "South African", ru: "Южноафриканская" }, chars: null, keywords: [
            "amapiano","gqom","afrikaans","maskandi" ] },
        de: { label: { en: "German", ru: "Немецкая" }, chars: null, keywords: [
            "schlager","deutschrap","deutsch rap","deutscher","neue deutsche welle","volksmusik","ndw","deutschpop" ] },
        fr: { label: { en: "French", ru: "Французская" }, chars: null, keywords: [
            "chanson française","chanson francaise","rap français","rap francais","variété française","french touch" ] },
        es: { label: { en: "Spanish / Latin", ru: "Испанская / Латина" }, chars: null, keywords: [
            "reggaeton","reguetón","música mexicana","musica mexicana","corridos tumbados","banda","ranchera","norteña" ] },
        br: { label: { en: "Brazilian", ru: "Бразильская" }, chars: null, keywords: [
            "funk carioca","funk paulista","sertanejo","sertaneja","pagode","forró","bossa nova","mpb brasil" ] },
        kr: { label: { en: "K-Pop", ru: "Корейская" }, chars: /[\uAC00-\uD7AF]/, keywords: [ "k-pop","kpop" ] },
        jp: { label: { en: "Japanese", ru: "Японская" }, chars: /[\u3040-\u30FF\u4E00-\u9FFF]/, keywords: [ "j-pop","jpop","city pop","anison" ] }
    };

    function t(key, ...args) {
        const lang = getLang();
        const val = I18N[lang]?.[key] ?? I18N.en[key] ?? key;
        return typeof val === "function" ? val(...args) : val;
    }

    let showNotice = () => {};
    let updateModeChipsUI = () => {};

    // Clean slate by default: reset old saved states on first launch
    if (!Spicetify.LocalStorage.get("smartWave_clean_v2")) {
        [
            "smartWave_mode", "smartWave_active_genre", "smartWave_pinned_genres",
            "smartWave_mood", "smartWave_custom_presets", "smartWave_custom_default",
            "smartWave_custom_playlists", "smartWave_custom_submode", "smartWave_active_preset",
            "smartWave_upnext_open", "smartWave_effect_enabled", "smartWave_artist_graph_cache_v2"
        ].forEach(k => Spicetify.LocalStorage.remove(k));
        Spicetify.LocalStorage.set("smartWave_clean_v2", "true");
    }
    if (!Spicetify.LocalStorage.get("smartWave_clean_taste_v3")) {
        [
            "smartWave_liked_tracks", "smartWave_disliked_tracks",
            "smartWave_liked_artists", "smartWave_disliked_artists"
        ].forEach(k => Spicetify.LocalStorage.remove(k));
        Spicetify.LocalStorage.set("smartWave_clean_taste_v3", "true");
    }

    const validModes = ["stream", "discovery", "favorite"];
    let initialMode = Spicetify.LocalStorage.get("smartWave_mode");
    if (!validModes.includes(initialMode)) initialMode = "stream"; // Guaranteed Flow by default!

    const STATE = {
        active: false,
        mode: initialMode, // "stream" (Flow)
        activeGenre: Spicetify.LocalStorage.get("smartWave_active_genre") || "all", // "all" (All tracks)
        pinnedGenres: JSON.parse(Spicetify.LocalStorage.get("smartWave_pinned_genres") || "[]"), // Empty by default (clean slate)
        upNextOpen: Spicetify.LocalStorage.get("smartWave_upnext_open") === "true",
        customPlaylists: JSON.parse(Spicetify.LocalStorage.get("smartWave_custom_playlists") || "[]"), // Empty
        customPresets: JSON.parse(Spicetify.LocalStorage.get("smartWave_custom_presets") || "[]"), // Empty
        customDefault: null, // Empty
        customSubMode: "flow",
        excludedRegions: JSON.parse(Spicetify.LocalStorage.get("smartWave_excluded_regions") || "[]"),
        customTracksCache: [],
        customArtistsCache: [],
        currentSeedArtist: null,
        currentSeedUri: null,
        currentTrack: null,         // { uri, title, artist, image, duration }
        historyStack: [],           // History stack for the "Back" (Previous) button
        upcomingWave: [],           // [{ uri, title, artist, image, duration }]
        dislikedTracks: new Set(JSON.parse(Spicetify.LocalStorage.get("smartWave_disliked_tracks") || "[]")),
        likedTracks: parseLikedTracks(Spicetify.LocalStorage.get("smartWave_liked_tracks")),
        history: new Set(),
        comfortPool: [],
        currentTrackStartTime: 0,
        lastObservedProgress: 0,
        isQueueing: false,
        pageVisible: false,
        progressInterval: null,
        animFrameId: null,
        closeGraceTimer: null,
        waveTime: 0,
        lastFrameTime: 0,
        beatPulse: 0.0,
        // Two-color palette: ColorA (base) and ColorB (top trail)
        extractedColorA: [0.95, 0.12, 0.55],
        extractedColorB: [1.00, 0.82, 0.22],
        lastExtractedImg: null,
        currentColorA: [0.95, 0.95, 0.97],
        currentColorB: [0.90, 0.90, 0.95],
        currentEnergy: 0.50,
        currentPlayState: 1.0,
        // Glow intensity
        currentGlow: 0.80,
        // Wave opacity (lowered for black covers)
        extractedOpacity: 1.0,
        currentOpacity: 1.0,
        // Colors of the 4 cover corners for a neat glow when the wave is off
        cornerGlow: null,
        // Remember wave effect on/off state in LocalStorage
        waveEffectEnabled: Spicetify.LocalStorage.get("smartWave_effect_enabled") !== "false",
    };
    // Anti-repeat memory: FIFO-capped (200 entries ≈ 10+ hours of listening).
    // Without the cap the Set grows forever in long sessions.
    const HISTORY_MAX = 200;
    function addHistory(uri) {
        if (!uri) return;
        if (STATE.history.has(uri)) STATE.history.delete(uri);
        STATE.history.add(uri);
        if (STATE.history.size > HISTORY_MAX) {
            const overflow = STATE.history.size - HISTORY_MAX;
            let i = 0;
            for (const u of STATE.history) {
                if (i >= overflow) break;
                STATE.history.delete(u);
                i++;
            }
        }
    }
    // Safe playback state check
    // Spotify desktop sometimes delivers CJK metadata mis-decoded as Windows-1252
    // (UTF-8 bytes interpreted as CP1252, e.g. Japanese artist names). Repair by mapping
    // chars back to bytes and re-decoding as UTF-8. Triggered only on CP1252 signature
    // chars that never appear in real names, so European accents (Bjork, Pokemon) stay intact.
    const CP1252_HIGH = {
        "\u20AC":0x80,"\u201A":0x82,"\u0192":0x83,"\u201E":0x84,"\u2026":0x85,"\u2020":0x86,
        "\u2021":0x87,"\u02C6":0x88,"\u2030":0x89,"\u0160":0x8A,"\u2039":0x8B,"\u0152":0x8C,
        "\u017D":0x8E,"\u2018":0x91,"\u2019":0x92,"\u201C":0x93,"\u201D":0x94,"\u2022":0x95,
        "\u2013":0x96,"\u2014":0x97,"\u02DC":0x98,"\u2122":0x99,"\u0161":0x9A,"\u203A":0x9B,
        "\u0153":0x9C,"\u017E":0x9E,"\u0178":0x9F
    };
    const MOJIBAKE_RE = /[\u0192\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u20AC\u2122]|[\u0080-\u00FF]{3,}/;
    function fixMojibake(s) {
        if (!s || typeof s !== "string") return s;
        if (!MOJIBAKE_RE.test(s)) return s;
        // NBSP may be normalized to a plain space upstream, which corrupts UTF-8 continuation
        // bytes (0xA0). Try a direct decode first, then retry with spaces mapped back to 0xA0.
        const toBytes = (str, spaceAsNbsp) => {
            const bytes = [];
            for (const ch of str) {
                const code = ch.codePointAt(0);
                if (code <= 0xFF) bytes.push(code === 0x20 && spaceAsNbsp ? 0xA0 : code);
                else if (CP1252_HIGH[ch] !== undefined) bytes.push(CP1252_HIGH[ch]);
                else return null;
            }
            return bytes;
        };
        for (const spaceAsNbsp of [false, true]) {
            const b = toBytes(s, spaceAsNbsp);
            if (!b) continue;
            try { return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(b)); } catch {}
        }
        return s;
    }

    function parseLikedTracks(raw) {
        try {
            const arr = JSON.parse(raw || "[]");
            const map = new Map();
            for (const item of arr) {
                if (!Array.isArray(item) || item.length < 2) continue;
                const [uri, v] = item;
                if (!uri) continue;
                if (typeof v === "number") {
                    map.set(uri, { uri, title: "Track", artist: "Artist", artistUri: null, weight: v });
                } else if (v && typeof v === "object") {
                    map.set(uri, {
                        uri,
                        title: v.title || "Track",
                        artist: v.artist || "Artist",
                        artistUri: v.artistUri || null,
                        weight: Number(v.weight) || 1
                    });
                }
            }
            return map;
        } catch {
            return new Map();
        }
    }

    // Persist taste feedback (caps: 500 banned tracks / 500 liked tracks)
    function saveTaste() {
        try {
            let disliked = [...STATE.dislikedTracks];
            if (disliked.length > 500) disliked = disliked.slice(-500);
            let likedTracksArr = [...STATE.likedTracks.entries()];
            if (likedTracksArr.length > 500) {
                likedTracksArr.sort((a, b) => (b[1]?.weight || 0) - (a[1]?.weight || 0));
                likedTracksArr = likedTracksArr.slice(0, 500);
                STATE.likedTracks = new Map(likedTracksArr);
            }
            Spicetify.LocalStorage.set("smartWave_disliked_tracks", JSON.stringify(disliked));
            Spicetify.LocalStorage.set("smartWave_liked_tracks", JSON.stringify(likedTracksArr));
        } catch (err) {
            console.warn("[SmartWave] saveTaste failed:", err);
        }
    }

    function addLikedTrack(track, delta = 1) {
        if (!track || !track.uri) return;
        const uri = track.uri;
        const existing = STATE.likedTracks.get(uri);
        const newWeight = (existing ? existing.weight : 0) + delta;
        STATE.likedTracks.set(uri, {
            uri,
            title: track.title || existing?.title || "Track",
            artist: track.artist || existing?.artist || "Artist",
            artistUri: track.artistUri || existing?.artistUri || null,
            weight: Math.max(1, newWeight)
        });
        saveTaste();
    }

    function penalizeTrack(track, delta = 1) {
        if (!track || !track.uri) return;
        const uri = track.uri;
        const existing = STATE.likedTracks.get(uri);
        if (existing) {
            const newWeight = existing.weight - delta;
            if (newWeight <= 0) {
                STATE.likedTracks.delete(uri);
            } else {
                existing.weight = newWeight;
                STATE.likedTracks.set(uri, existing);
            }
            saveTaste();
        }
    }

    function addDislikedTrack(uri, artistName = null) {
        if (!uri) return;
        STATE.dislikedTracks.add(uri);
        STATE.likedTracks.delete(uri);
        saveTaste();
    }

    function isPlayerPlaying() {
        try {
            return !!Spicetify.Player?.origin?._state && !Spicetify.Player.origin._state.isPaused;
        } catch {
            return false;
        }
    }
    function safeGetDuration() {
        try {
            return Spicetify.Player?.origin?._state?.duration || Spicetify.Player?.getDuration() || 180000;
        } catch {
            return 180000;
        }
    }
    function safeGetProgress() {
        try {
            return Spicetify.Player?.getProgress() || 0;
        } catch {
            return 0;
        }
    }
    // Spotify image resolve helper (converts spotify:image:xxx to a real CDN URL)
    function resolveImageUrl(uri) {
        if (!uri) return "";
        if (uri.startsWith("spotify:image:")) {
            return uri.replace("spotify:image:", "https://i.scdn.co/image/");
        }
        return uri;
    }
    // Cover quality selection: main = 100% (largest), thumb = compact for small lists (~30%)
    function pickSpotifyImage(images, mode = "full") {
        const guessSize = (url) => {
            // Common Spotify CDN codes: b273=640, 1e02=300, 4851=64
            if (/ab67616d0000b273/i.test(url)) return 640;
            if (/ab67616d00001e02/i.test(url)) return 300;
            if (/ab67616d00004851/i.test(url)) return 64;
            return 0;
        };
        const list = (Array.isArray(images) ? images : [])
            .map(img => {
                const url = resolveImageUrl(img?.url || img || "");
                const explicit = Number(img?.width || img?.height || 0);
                return { url, size: explicit || guessSize(url) };
            })
            .filter(img => img.url);
        if (!list.length) return "";
        const sorted = list.slice().sort((a, b) => (b.size - a.size));
        if (mode === "thumb") {
            // For small queue thumbnails use the lightest version (~30% and below), don't pull 640px.
            return sorted[sorted.length - 1].url;
        }
        return sorted[0].url;
    }
    function getTrackImages(source) {
        const images = source?.album?.images
            || source?.albumOfTrack?.coverArt?.sources
            || source?.album?.coverArt?.sources
            || source?.images
            || [];
        return {
            image: pickSpotifyImage(images, "full"),
            thumb: pickSpotifyImage(images, "thumb"),
        };
    }
    // Cover color cache (for instant track switching without lag)
    const colorCache = new Map();
    // Adaptive wave theme detection: vivid color, silvery-gray for B&W, semi-transparent for black covers
    function extractAdaptiveWaveTheme(imgUrl) {
        return new Promise((resolve) => {
            const fallback = {
                colorA: [0.95, 0.12, 0.55],
                colorB: [1.00, 0.82, 0.22],
                opacity: 0.85,
            };
            if (!imgUrl) return resolve(fallback);
            if (colorCache.has(imgUrl)) return resolve(colorCache.get(imgUrl));
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
                try {
                    const canvas = document.createElement("canvas");
                    canvas.width = 32;
                    canvas.height = 32;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, 32, 32);
                    const data = ctx.getImageData(0, 0, 32, 32).data;
                    const rgb2hsv = (r, g, b) => {
                        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
                        let h = 0;
                        if (d > 0.0001) {
                            if (mx === r) h = ((g - b) / d) % 6;
                            else if (mx === g) h = (b - r) / d + 2;
                            else h = (r - g) / d + 4;
                            h *= 60; if (h < 0) h += 360;
                        }
                        return [h, mx === 0 ? 0 : d / mx, mx];
                    };
                    const hsv2rgb = (h, s, v) => {
                        h = ((h % 360) + 360) % 360;
                        const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
                        let r = 0, g = 0, b = 0;
                        if (h < 60) { r = c; g = x; }
                        else if (h < 120) { r = x; g = c; }
                        else if (h < 180) { g = c; b = x; }
                        else if (h < 240) { g = x; b = c; }
                        else if (h < 300) { r = x; b = c; }
                        else { r = c; b = x; }
                        return [r + m, g + m, b + m];
                    };
                    const samples = [];
                    for (let i = 0; i < data.length; i += 16) {
                        const r = data[i] / 255, g = data[i+1] / 255, b = data[i+2] / 255;
                        const [h, s, v] = rgb2hsv(r, g, b);
                        const l = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
                        const score = s * 2.8 + (1.0 - Math.abs(l - 0.52));
                        samples.push({ r, g, b, h, s, v, l, score });
                    }
                    const candidates = samples.filter(s => s.l > 0.16 && s.l < 0.88);
                    candidates.sort((a, b) => b.score - a.score);
                    const boost = (c) => {
                        let { r, g, b, l } = c;
                        if (l < 0.28) {
                            const k = 0.36 / Math.max(0.1, l);
                            r = Math.min(1.0, r * k);
                            g = Math.min(1.0, g * k);
                            b = Math.min(1.0, b * k);
                        }
                        return [r, g, b];
                    };
                    let colorA, colorB;
                    let resultOpacity = 1.0;
                    if (candidates.length && candidates[0].s > 0.14) {
                        const topA = candidates[0];
                        colorA = boost(topA);
                        let bestDist = -1;
                        let topB = null;
                        for (let i = 1; i < candidates.length; i++) {
                            const c = candidates[i];
                            const hueDiff = Math.min(Math.abs(topA.h - c.h), 360 - Math.abs(topA.h - c.h));
                            const dist = Math.abs(topA.r - c.r) + Math.abs(topA.g - c.g) + Math.abs(topA.b - c.b);
                            const score = dist * 1.5 + (hueDiff / 180.0) * 2.0 + c.s;
                            if (score > bestDist) {
                                bestDist = score;
                                topB = c;
                            }
                        }
                        const [hA, sA, vA] = rgb2hsv(...colorA);
                        if (topB && bestDist > 1.2 && topB.s > 0.18) {
                            colorB = boost(topB);
                        } else {
                            // Harmonic contrast shift (gold <-> magenta style)
                            const shift = (hA >= 30 && hA <= 210) ? -65 : 55;
                            colorB = hsv2rgb(hA + shift, Math.max(0.68, sA), Math.max(0.78, vA));
                        }
                    } else {
                        // For monochrome / black-and-white covers — elegant silvery-lunar gradient
                        colorA = [0.72, 0.76, 0.84];
                        colorB = [0.88, 0.82, 0.72];
                        resultOpacity = 0.85;
                    }
                    const getCornerRgb = (px, py) => {
                        const idx = (py * 32 + px) * 4;
                        return `rgba(${data[idx]}, ${data[idx+1]}, ${data[idx+2]}, 0.26)`;
                    };
                    const cornerGlow = {
                        tl: getCornerRgb(1, 1),
                        tr: getCornerRgb(30, 1),
                        br: getCornerRgb(30, 30),
                        bl: getCornerRgb(1, 30),
                        dom: `rgba(${Math.round(colorA[0]*255)}, ${Math.round(colorA[1]*255)}, ${Math.round(colorA[2]*255)}, 0.26)`
                    };
                    const theme = { colorA, colorB, opacity: resultOpacity, cornerGlow };
                    colorCache.set(imgUrl, theme);
                    resolve(theme);
                } catch {
                    resolve(fallback);
                }
            };
            img.onerror = () => resolve(fallback);
            img.src = imgUrl;
        });
    }
    // -------------------------------------------------------------------------
    // SPOTIFY MUSIC GRAPH (GRAPHQL + LOCALSTORAGE CACHE WITH TTL AND LRU)
    // -------------------------------------------------------------------------
    const GRAPH_CACHE_KEY = "smartWave_artist_graph_cache_v2";
    const GRAPH_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // Cache TTL: 7 days
    const GRAPH_CACHE_MAX_ITEMS = 120; // Max artists in LocalStorage cache
    const memoryArtistCache = new Map();
    function loadPersistentGraphCache() {
        try {
            const raw = Spicetify.LocalStorage.get(GRAPH_CACHE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            const now = Date.now();
            const valid = {};
            for (const [uri, entry] of Object.entries(parsed)) {
                if (entry && entry.timestamp && (now - entry.timestamp < GRAPH_CACHE_TTL_MS)) {
                    valid[uri] = entry;
                }
            }
            return valid;
        } catch {
            return {};
        }
    }
    let persistentGraphCache = loadPersistentGraphCache();
    function savePersistentGraphCache() {
        try {
            const entries = Object.entries(persistentGraphCache);
            // If entries exceed the limit — trim the oldest (LRU)
            if (entries.length > GRAPH_CACHE_MAX_ITEMS) {
                entries.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
                persistentGraphCache = Object.fromEntries(entries.slice(0, GRAPH_CACHE_MAX_ITEMS));
            }
            Spicetify.LocalStorage.set(GRAPH_CACHE_KEY, JSON.stringify(persistentGraphCache));
        } catch (err) {
            console.warn("[SmartWave] Save persistent cache error:", err);
        }
    }
    // Manual and programmatic cache clearing
    function clearAllArtistCache() {
        memoryArtistCache.clear();
        persistentGraphCache = {};
        Spicetify.LocalStorage.remove(GRAPH_CACHE_KEY);
        console.log("[SmartWave] Artist graph cache fully cleared.");
    }
    // Export for easy clearing at any time: window.SmartWave.clearCache()
    window.SmartWave = {
        debugPulse: () => STATE.beatPulse,
        getWaveState: () => ({
            colorA: STATE.currentColorA,
            colorB: STATE.currentColorB,
            extA: STATE.extractedColorA,
            extB: STATE.extractedColorB,
            energy: STATE.currentEnergy,
            track: STATE.currentTrack?.name,
            isPlaying: isPlayerPlaying()
        }),
        getState: () => ({
            mode: STATE.mode,
            seed: STATE.currentSeedArtist,
            seedUri: STATE.currentSeedUri,
            queue: STATE.upcomingWave.map(t => t.artist + " — " + t.title),
            queueUris: STATE.upcomingWave.map(t => t.uri),
            likedCount: STATE.likedTracks.size,
            dislikedCount: STATE.dislikedTracks.size,
            likedTracks: Object.fromEntries([...STATE.likedTracks].map(([k, v]) => [v.title + " (" + v.artist + ")", v.weight || 1])),
            dislikedTracksCount: STATE.dislikedTracks.size
        }),
        addLikedTrack: (track, delta) => addLikedTrack(track, delta),
        penalizeTrack: (track, delta) => penalizeTrack(track, delta),
        addDislikedTrack: (uri, artist) => addDislikedTrack(uri, artist),
        showNotice: (msg) => showNotice(msg),
        t: (k) => t(k),
        saveTaste: () => saveTaste(),
        clearCache: clearAllArtistCache,
        getCacheStats: () => ({
            cachedArtists: Object.keys(persistentGraphCache).length,
            maxLimit: GRAPH_CACHE_MAX_ITEMS,
            ttlDays: 7
        })
    };
    async function getArtistGraph(artistUri) {
        if (!artistUri) return null;
        // 1. Check the ultra-fast in-memory cache
        if (memoryArtistCache.has(artistUri)) {
            return memoryArtistCache.get(artistUri);
        }
        // 2. Check the persistent LocalStorage cache
        const now = Date.now();
        const cached = persistentGraphCache[artistUri];
        if (cached && (now - (cached.timestamp || 0) < GRAPH_CACHE_TTL_MS)) {
            const result = {
                name: cached.name,
                topTracks: (cached.topTracks || []).filter(t => !STATE.dislikedTracks.has(t.uri)),
                related: cached.related || []
            };
            memoryArtistCache.set(artistUri, result);
            return result;
        }
        // 3. Query via Spotify's internal GraphQL
        try {
            const { queryArtistOverview } = Spicetify.GraphQL.Definitions;
            if (!queryArtistOverview) return null;
            const res = await Spicetify.GraphQL.Request(queryArtistOverview, {
                uri: artistUri,
                locale: Spicetify.Locale?.getLocale?.() || "en",
                includePrerelease: false,
            });
            const artistData = res?.data?.artistUnion;
            if (!artistData || artistData.__typename === "NotFound" || !artistData.discography) return null;

            // Regional filter: only the regions the USER explicitly excluded in settings.
            // No hidden per-country cuts: every artist passes unless opted out.
            if (isUnwantedRegionalTrack({ artist: artistData.profile?.name })) {
                return null;
            }
            const name = artistData.profile?.name || "Artist";
            const topTracks = (artistData.discography?.topTracks?.items || []).map(i => {
                const imgs = getTrackImages(i.track);
                return {
                    uri: i.track?.uri,
                    title: i.track?.name,
                    artist: name,
                    image: imgs.image,
                    thumb: imgs.thumb || imgs.image,
                    duration: i.track?.duration?.totalMilliseconds || 180000,
                };
            }).filter(t => t.uri && !STATE.dislikedTracks.has(t.uri));
            const related = (artistData.relatedContent?.relatedArtists?.items || []).map(a => ({
                uri: a.uri,
                name: a.profile?.name,
            })).filter(a => a.uri);
            const result = { name, topTracks, related };
            memoryArtistCache.set(artistUri, result);
            // Save to LocalStorage with a timestamp
            persistentGraphCache[artistUri] = {
                name,
                topTracks,
                related,
                timestamp: now
            };
            savePersistentGraphCache();
            return result;
        } catch (err) {
            console.warn("[SmartWave] GraphQL artist error:", artistUri, err);
            return null;
        }
    }
    