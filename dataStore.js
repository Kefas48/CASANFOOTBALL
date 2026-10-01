// CASANFOOTBALL Central Data Store & Synchronization System
// St. Matthew's Parish, Amawbia Intrasports Competition

(function(global) {
  const STORAGE_KEYS = {
    NEWS: "casan_news",
    FIXTURES: "casan_fixtures",
    RESULTS: "casan_results",
    STATS: "casan_stats",
    TEAMS: "casan_teams",
    PLAYERS: "casan_players",
    MEDIA: "casan_media",
    PAGES: "casan_pages",
    USERS: "casan_users",
    SETTINGS: "casan_settings",
    CATEGORIES: "casan_categories",
    ACTIVITIES: "casan_activities"
  };

  const DEFAULT_SETTINGS = {
    competitionName: "CASANFOOTBALL",
    parishName: "St. Matthew's Parish, Amawbia",
    motto: "Nearer to the altar, Nearer to God.",
    subTitle: "Intrasports Competition",
    season: "2025/2026",
    association: "Altar Boys Association",
    chaplain: "Rev. Fr. Parish Priest",
    president: "Bro. Coordinator",
    contactEmail: "info@casanfootball.org",
    contactPhone: "+234 800 CASAN 00",
    liveScoreEnabled: true,
    publicRegistration: true,
    theme: "royal-blue",
    maintenanceMode: false,
    autoCalculateStandings: true
  };

  const DEFAULT_CATEGORIES = [
    { name: "Match Reports", icon: "⚽", count: 12 },
    { name: "Interviews", icon: "♟", count: 8 },
    { name: "Team News", icon: "♟", count: 7 },
    { name: "Predictions", icon: "▥", count: 6 },
    { name: "Pre & Post Match", icon: "▣", count: 9 },
    { name: "Lineups", icon: "♟", count: 5 }
  ];

  const DEFAULT_NEWS = [
    {
      id: 1,
      category: "Match Reports",
      title: "Team A Edges Team B in Thrilling Encounter",
      date: "Aug 24, 2025",
      comments: 12,
      status: "Published",
      image: "https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=900&q=85",
      author: "Admin Editor",
      tag: "blue",
      text: "In a closely contested match, Team A secured a 2-1 victory over Team B in the opening fixture of the CASANFOOTBALL Intrasports Competition. Emeka Nwosu starred with a brace."
    },
    {
      id: 2,
      category: "Interviews",
      title: "“We’re Focused and Ready” – Team C Captain Speaks",
      date: "Aug 23, 2025",
      comments: 8,
      status: "Published",
      image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=900&q=85",
      author: "Sports Desk",
      tag: "purple",
      text: "Team C’s captain, Michael Uche, shares his thoughts ahead of their crucial fixture this weekend and the team’s goals for the tournament. 'We are playing with faith and dedication.'"
    },
    {
      id: 3,
      category: "Team News",
      title: "Team D Strengthens Squad with Two New Players",
      date: "Aug 22, 2025",
      comments: 5,
      status: "Published",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=85",
      author: "Team D Correspondent",
      tag: "green",
      text: "Team D has added two new altar servers to their squad ahead of the next round of fixtures. The duo are expected to bring fresh energy and solid midfield coordination."
    },
    {
      id: 4,
      category: "Predictions",
      title: "Our Predictions for This Weekend’s Fixtures",
      date: "Aug 21, 2025",
      comments: 14,
      status: "Published",
      image: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=900&q=85",
      author: "Tactical Analyst",
      tag: "cyan",
      text: "Will Team A continue their winning streak? Or can Team C pull off an upset? Here are our tactical breakdown and predictions for all the clashes at St. Matthew’s field."
    },
    {
      id: 5,
      category: "Pre & Post Match",
      title: "Post-Match Report: Team A 2 - 1 Team B",
      date: "Aug 20, 2025",
      comments: 9,
      status: "Published",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=85",
      author: "Admin Editor",
      tag: "red",
      text: "A detailed look at the key tactical moments, standout performances from goalkeeper Samuel Okafor, and what’s next for both teams after an intense battle on the pitch."
    },
    {
      id: 6,
      category: "Lineups",
      title: "Confirmed Lineups for Team A vs Team B",
      date: "Aug 19, 2025",
      comments: 6,
      status: "Published",
      image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?auto=format&fit=crop&w=900&q=85",
      author: "Match Official",
      tag: "orange",
      text: "Here are the starting lineups, tactical formation and substitute bench for today’s much-anticipated clash between Team A and Team B."
    }
  ];

  const DEFAULT_FIXTURES = [
    {
      id: 1,
      day: "SAT",
      month: "AUG",
      date: "Aug 30",
      fullDate: "2025-08-30",
      time: "10:00 AM",
      venue: "St. Matthew's Parish Field",
      home: "Team A",
      away: "Team B",
      hc: "blue",
      ac: "red",
      status: "Upcoming"
    },
    {
      id: 2,
      day: "SUN",
      month: "AUG",
      date: "Aug 31",
      fullDate: "2025-08-31",
      time: "11:00 AM",
      venue: "St. Matthew's Parish Field",
      home: "Team C",
      away: "Team D",
      hc: "green",
      ac: "yellow",
      status: "Upcoming"
    },
    {
      id: 3,
      day: "MON",
      month: "SEP",
      date: "Sep 1",
      fullDate: "2025-09-01",
      time: "10:00 AM",
      venue: "St. Matthew's Parish Field",
      home: "Team E",
      away: "Team F",
      hc: "purple",
      ac: "teal",
      status: "Upcoming"
    },
    {
      id: 4,
      day: "TUE",
      month: "SEP",
      date: "Sep 2",
      fullDate: "2025-09-02",
      time: "11:00 AM",
      venue: "St. Matthew's Parish Field",
      home: "Team G",
      away: "Team H",
      hc: "orange",
      ac: "gray",
      status: "Upcoming"
    },
    {
      id: 5,
      day: "WED",
      month: "SEP",
      date: "Sep 3",
      fullDate: "2025-09-03",
      time: "10:00 AM",
      venue: "St. Matthew's Parish Field",
      home: "Team A",
      away: "Team C",
      hc: "blue",
      ac: "green",
      status: "Upcoming"
    }
  ];

  const DEFAULT_RESULTS = [
    {
      id: 1,
      day: "SAT",
      date: "Aug 23, 2025",
      home: "Team A",
      away: "Team B",
      homeScore: 2,
      awayScore: 1,
      score: "2 - 1",
      hc: "blue",
      ac: "red",
      venue: "St. Matthew's Parish Field",
      competition: "Group Stage"
    },
    {
      id: 2,
      day: "FRI",
      date: "Aug 22, 2025",
      home: "Team C",
      away: "Team D",
      homeScore: 1,
      awayScore: 0,
      score: "1 - 0",
      hc: "green",
      ac: "yellow",
      venue: "St. Matthew's Parish Field",
      competition: "Group Stage"
    },
    {
      id: 3,
      day: "THU",
      date: "Aug 21, 2025",
      home: "Team E",
      away: "Team F",
      homeScore: 3,
      awayScore: 2,
      score: "3 - 2",
      hc: "purple",
      ac: "teal",
      venue: "Amawbia Youth Centre",
      competition: "Group Stage"
    },
    {
      id: 4,
      day: "WED",
      date: "Aug 20, 2025",
      home: "Team G",
      away: "Team H",
      homeScore: 0,
      awayScore: 0,
      score: "0 - 0",
      hc: "orange",
      ac: "gray",
      venue: "St. Matthew's Parish Field",
      competition: "Group Stage"
    },
    {
      id: 5,
      day: "TUE",
      date: "Aug 19, 2025",
      home: "Team A",
      away: "Team C",
      homeScore: 1,
      awayScore: 1,
      score: "1 - 1",
      hc: "blue",
      ac: "green",
      venue: "St. Matthew's Parish Field",
      competition: "Group Stage"
    }
  ];

  const DEFAULT_TEAMS = [
    { id: 1, name: "Team A", color: "blue", played: 4, won: 3, drawn: 1, lost: 0, gf: 22, ga: 8, pts: 10, captain: "Emeka Nwosu", motto: "Excellence & Faith", members: 12 },
    { id: 2, name: "Team B", color: "red", played: 4, won: 3, drawn: 0, lost: 1, gf: 16, ga: 12, pts: 9, captain: "Michael Uche", motto: "Strength in Unity", members: 11 },
    { id: 3, name: "Team C", color: "green", played: 4, won: 2, drawn: 1, lost: 1, gf: 18, ga: 10, pts: 7, captain: "Chinedu Okafor", motto: "Courage & Honor", members: 12 },
    { id: 4, name: "Team D", color: "yellow", played: 4, won: 2, drawn: 0, lost: 2, gf: 12, ga: 15, pts: 6, captain: "Joseph Eze", motto: "Disciplined Focus", members: 10 },
    { id: 5, name: "Team E", color: "purple", played: 4, won: 1, drawn: 1, lost: 2, gf: 10, ga: 18, pts: 4, captain: "David Ibe", motto: "Nearer to the Altar", members: 11 },
    { id: 6, name: "Team F", color: "teal", played: 4, won: 1, drawn: 0, lost: 3, gf: 8, ga: 20, pts: 3, captain: "Daniel Chukwu", motto: "Service with Passion", members: 10 },
    { id: 7, name: "Team G", color: "orange", played: 4, won: 0, drawn: 2, lost: 2, gf: 4, ga: 9, pts: 2, captain: "Collins Anyanwu", motto: "Spirit of St. Matthew", members: 9 },
    { id: 8, name: "Team H", color: "gray", played: 4, won: 0, drawn: 1, lost: 3, gf: 3, ga: 10, pts: 1, captain: "Kingsley Eze", motto: "One Heart One Mind", members: 9 }
  ];

  const DEFAULT_PLAYERS = [
    { id: 1, name: "Emeka Nwosu", team: "Team A", position: "Forward", number: 10, goals: 8, assists: 4, avatar: "https://i.pravatar.cc/120?img=12" },
    { id: 2, name: "Chinedu Okafor", team: "Team C", position: "Midfielder", number: 8, goals: 6, assists: 5, avatar: "https://i.pravatar.cc/120?img=11" },
    { id: 3, name: "Michael Uche", team: "Team B", position: "Forward", number: 9, goals: 5, assists: 3, avatar: "https://i.pravatar.cc/120?img=13" },
    { id: 4, name: "Joseph Eze", team: "Team D", position: "Midfielder", number: 7, goals: 4, assists: 2, avatar: "https://i.pravatar.cc/120?img=14" },
    { id: 5, name: "Daniel Chukwu", team: "Team F", position: "Midfielder", number: 6, goals: 4, assists: 1, avatar: "https://i.pravatar.cc/120?img=15" },
    { id: 6, name: "David Ibe", team: "Team E", position: "Forward", number: 11, goals: 3, assists: 3, avatar: "https://i.pravatar.cc/120?img=16" },
    { id: 7, name: "Collins Anyanwu", team: "Team G", position: "Defender", number: 4, goals: 1, assists: 2, avatar: "https://i.pravatar.cc/120?img=17" },
    { id: 8, name: "Samuel Okafor", team: "Team A", position: "Goalkeeper", number: 1, goals: 0, assists: 0, avatar: "https://i.pravatar.cc/120?img=18" },
    { id: 9, name: "Chinedu Nwosu", team: "Team C", position: "Goalkeeper", number: 1, goals: 0, assists: 0, avatar: "https://i.pravatar.cc/120?img=19" },
    { id: 10, name: "Uche Nwosu", team: "Team B", position: "Goalkeeper", number: 1, goals: 0, assists: 0, avatar: "https://i.pravatar.cc/120?img=20" },
    { id: 11, name: "Kingsley Eze", team: "Team H", position: "Defender", number: 5, goals: 1, assists: 0, avatar: "https://i.pravatar.cc/120?img=21" },
    { id: 12, name: "Chisom Okeke", team: "Team B", position: "Defender", number: 3, goals: 1, assists: 1, avatar: "https://i.pravatar.cc/120?img=22" }
  ];

  const DEFAULT_STATS = {
    goals: [
      ["Emeka Nwosu", "Team A", 8, "https://i.pravatar.cc/80?img=12"],
      ["Chinedu Okafor", "Team C", 6, "https://i.pravatar.cc/80?img=11"],
      ["Michael Uche", "Team B", 5, "https://i.pravatar.cc/80?img=13"],
      ["Joseph Eze", "Team D", 4, "https://i.pravatar.cc/80?img=14"],
      ["Daniel Chukwu", "Team F", 4, "https://i.pravatar.cc/80?img=15"]
    ],
    assists: [
      ["Chinedu Okafor", "Team C", 5, "https://i.pravatar.cc/80?img=11"],
      ["Emeka Nwosu", "Team A", 4, "https://i.pravatar.cc/80?img=12"],
      ["David Ibe", "Team E", 3, "https://i.pravatar.cc/80?img=16"],
      ["Michael Uche", "Team B", 3, "https://i.pravatar.cc/80?img=13"],
      ["Collins Anyanwu", "Team D", 2, "https://i.pravatar.cc/80?img=17"]
    ],
    chances: [
      ["Joseph Eze", "Team D", 12, "https://i.pravatar.cc/80?img=14"],
      ["Chinedu Okafor", "Team C", 10, "https://i.pravatar.cc/80?img=11"],
      ["Emeka Nwosu", "Team A", 9, "https://i.pravatar.cc/80?img=12"],
      ["Michael Uche", "Team B", 8, "https://i.pravatar.cc/80?img=13"],
      ["David Ibe", "Team E", 7, "https://i.pravatar.cc/80?img=16"]
    ],
    passes: [
      ["Joseph Eze", "Team D", 487, "https://i.pravatar.cc/80?img=14"],
      ["Michael Uche", "Team B", 451, "https://i.pravatar.cc/80?img=13"],
      ["Chisom Okeke", "Team B", 428, "https://i.pravatar.cc/80?img=22"],
      ["Daniel Chukwu", "Team F", 412, "https://i.pravatar.cc/80?img=15"],
      ["Chinedu Okafor", "Team C", 341, "https://i.pravatar.cc/80?img=11"]
    ],
    clean: [
      ["Samuel Okafor", "Team A", 4, "https://i.pravatar.cc/80?img=18"],
      ["Chinedu Nwosu", "Team C", 3, "https://i.pravatar.cc/80?img=19"],
      ["Uche Nwosu", "Team B", 2, "https://i.pravatar.cc/80?img=20"],
      ["Daniel Chukwu", "Team F", 2, "https://i.pravatar.cc/80?img=15"],
      ["Kingsley Eze", "Team D", 1, "https://i.pravatar.cc/80?img=21"]
    ],
    tackles: [
      ["Chisom Okeke", "Team B", 28, "https://i.pravatar.cc/80?img=22"],
      ["Collins Anyanwu", "Team G", 25, "https://i.pravatar.cc/80?img=17"],
      ["Kingsley Eze", "Team H", 22, "https://i.pravatar.cc/80?img=21"],
      ["David Ibe", "Team E", 19, "https://i.pravatar.cc/80?img=16"],
      ["Joseph Eze", "Team D", 17, "https://i.pravatar.cc/80?img=14"]
    ],
    cards: [
      ["Kingsley Eze", "Team H", "2 Y / 0 R", "https://i.pravatar.cc/80?img=21"],
      ["Collins Anyanwu", "Team G", "2 Y / 0 R", "https://i.pravatar.cc/80?img=17"],
      ["David Ibe", "Team E", "1 Y / 0 R", "https://i.pravatar.cc/80?img=16"],
      ["Chisom Okeke", "Team B", "1 Y / 0 R", "https://i.pravatar.cc/80?img=22"],
      ["Daniel Chukwu", "Team F", "1 Y / 0 R", "https://i.pravatar.cc/80?img=15"]
    ],
    totals: {
      goals: 76,
      assists: 42,
      chances: 258,
      passes: 2476,
      matches: 12,
      cards: 7
    }
  };

  const DEFAULT_MEDIA = [
    { id: 1, title: "Opening Match Action", url: "https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=800&q=80", category: "Match Photos", size: "1.2 MB", date: "Aug 24, 2025" },
    { id: 2, title: "Team Captain Interview", url: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&w=800&q=80", category: "Interviews", size: "850 KB", date: "Aug 23, 2025" },
    { id: 3, title: "Pre-Match Warmup Session", url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80", category: "Training", size: "1.5 MB", date: "Aug 22, 2025" },
    { id: 4, title: "Tactics & Strategy Board", url: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80", category: "Tactics", size: "920 KB", date: "Aug 21, 2025" },
    { id: 5, title: "St. Matthew's Parish Field", url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80", category: "Venue", size: "2.1 MB", date: "Aug 20, 2025" },
    { id: 6, title: "Altar Boys Trophy Presentation", url: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80", category: "Trophy", size: "1.8 MB", date: "Aug 18, 2025" }
  ];

  const DEFAULT_PAGES = [
    { id: 1, title: "Home Page", slug: "index.html", path: "index.html", status: "Live", lastModified: "Today", seo: "CASANFOOTBALL | St. Matthew's Parish, Amawbia" },
    { id: 2, title: "News & Reports", slug: "News.html", path: "News.html", status: "Live", lastModified: "Today", seo: "CASANFOOTBALL News — St. Matthew's Parish, Amawbia" },
    { id: 3, title: "Fixtures & Results", slug: "fixtures.html", path: "fixtures.html", status: "Live", lastModified: "Today", seo: "CASANFOOTBALL — Fixtures & Results" },
    { id: 4, title: "Statistics & Records", slug: "statistics.html", path: "statistics.html", status: "Live", lastModified: "Today", seo: "CASANFOOTBALL | Statistics" },
    { id: 5, title: "Admin Dashboard", slug: "admin.html", path: "admin.html", status: "Protected", lastModified: "Today", seo: "CASANFOOTBALL — Admin Dashboard" }
  ];

  const DEFAULT_USERS = [
    { id: 1, name: "Admin", email: "admin@casanfootball.org", role: "Super Admin", status: "Active", lastLogin: "Just now", avatar: "👑" },
    { id: 2, name: "Match Coordinator", email: "fixtures@casanfootball.org", role: "Match Official", status: "Active", lastLogin: "2 hours ago", avatar: "⚽" },
    { id: 3, name: "Senior News Editor", email: "editor@casanfootball.org", role: "Editor", status: "Active", lastLogin: "Yesterday", avatar: "✍" },
    { id: 4, name: "Chief Statistician", email: "stats@casanfootball.org", role: "Statistician", status: "Active", lastLogin: "3 days ago", avatar: "📊" }
  ];

  const DEFAULT_ACTIVITIES = [
    { color: "green", icon: "New", title: "New news post published", detail: "Team A Edges Team B in Thrilling Encounter", time: "2 hours ago" },
    { color: "blue", icon: "▣", title: "Fixture updated", detail: "Team C vs Team D (Aug 31, 2025)", time: "4 hours ago" },
    { color: "purple", icon: "●", title: "New player added", detail: "Emeka Nwosu (Team A)", time: "6 hours ago" },
    { color: "orange", icon: "🏆", title: "Result added", detail: "Team B 1 - 0 Team C (Aug 22, 2025)", time: "8 hours ago" },
    { color: "cyan", icon: "▧", title: "Image uploaded", detail: "Opening Match Action.jpg", time: "10 hours ago" }
  ];

  // Helper storage functions
  function get(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn("Storage get failed:", e);
      return defaultValue;
    }
  }

  function set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      window.dispatchEvent(new CustomEvent("casan_data_change", { detail: { key, val } }));
    } catch (e) {
      console.warn("Storage set failed:", e);
    }
  }

  // Database API
  const CasanDB = {
    // Initializer
    init() {
      if (!localStorage.getItem(STORAGE_KEYS.NEWS)) set(STORAGE_KEYS.NEWS, DEFAULT_NEWS);
      if (!localStorage.getItem(STORAGE_KEYS.FIXTURES)) set(STORAGE_KEYS.FIXTURES, DEFAULT_FIXTURES);
      if (!localStorage.getItem(STORAGE_KEYS.RESULTS)) set(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS);
      if (!localStorage.getItem(STORAGE_KEYS.STATS)) set(STORAGE_KEYS.STATS, DEFAULT_STATS);
      if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) set(STORAGE_KEYS.TEAMS, DEFAULT_TEAMS);
      if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) set(STORAGE_KEYS.PLAYERS, DEFAULT_PLAYERS);
      if (!localStorage.getItem(STORAGE_KEYS.MEDIA)) set(STORAGE_KEYS.MEDIA, DEFAULT_MEDIA);
      if (!localStorage.getItem(STORAGE_KEYS.PAGES)) set(STORAGE_KEYS.PAGES, DEFAULT_PAGES);
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) set(STORAGE_KEYS.USERS, DEFAULT_USERS);
      if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) set(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
      if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) set(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES);
    },

    // Getters
    getNews() { return get(STORAGE_KEYS.NEWS, DEFAULT_NEWS); },
    getFixtures() { return get(STORAGE_KEYS.FIXTURES, DEFAULT_FIXTURES); },
    getResults() { return get(STORAGE_KEYS.RESULTS, DEFAULT_RESULTS); },
    getStats() { return get(STORAGE_KEYS.STATS, DEFAULT_STATS); },
    getTeams() { return get(STORAGE_KEYS.TEAMS, DEFAULT_TEAMS); },
    getPlayers() { return get(STORAGE_KEYS.PLAYERS, DEFAULT_PLAYERS); },
    getMedia() { return get(STORAGE_KEYS.MEDIA, DEFAULT_MEDIA); },
    getPages() { return get(STORAGE_KEYS.PAGES, DEFAULT_PAGES); },
    getUsers() { return get(STORAGE_KEYS.USERS, DEFAULT_USERS); },
    getSettings() { return get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS); },
    getCategories() { return get(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES); },
    getActivities() { return get(STORAGE_KEYS.ACTIVITIES, DEFAULT_ACTIVITIES); },

    // Setters / Savers
    saveNews(list) { set(STORAGE_KEYS.NEWS, list); },
    saveFixtures(list) { set(STORAGE_KEYS.FIXTURES, list); },
    saveResults(list) {
      set(STORAGE_KEYS.RESULTS, list);
      if (this.getSettings().autoCalculateStandings) {
        this.recalculateStandings();
      }
    },
    saveStats(obj) { set(STORAGE_KEYS.STATS, obj); },
    saveTeams(list) { set(STORAGE_KEYS.TEAMS, list); },
    savePlayers(list) { set(STORAGE_KEYS.PLAYERS, list); },
    saveMedia(list) { set(STORAGE_KEYS.MEDIA, list); },
    savePages(list) { set(STORAGE_KEYS.PAGES, list); },
    saveUsers(list) { set(STORAGE_KEYS.USERS, list); },
    saveSettings(obj) { set(STORAGE_KEYS.SETTINGS, obj); },
    saveCategories(list) { set(STORAGE_KEYS.CATEGORIES, list); },
    saveActivities(list) { set(STORAGE_KEYS.ACTIVITIES, list); },

    logActivity(color, icon, title, detail) {
      const activities = this.getActivities();
      activities.unshift({
        color: color || "blue",
        icon: icon || "⚡",
        title: title || "Action performed",
        detail: detail || "",
        time: "Just now"
      });
      if (activities.length > 25) activities.pop();
      this.saveActivities(activities);
    },

    // Reset to defaults
    resetDefaults() {
      localStorage.clear();
      this.init();
    },

    // Recalculate standings table from match results
    recalculateStandings() {
      const results = this.getResults();
      const teams = this.getTeams();
      const statsMap = {};

      teams.forEach(t => {
        statsMap[t.name] = {
          ...t,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          gf: 0,
          ga: 0,
          pts: 0
        };
      });

      results.forEach(r => {
        const homeScore = parseInt(r.homeScore != null ? r.homeScore : (r.score ? r.score.split("-")[0] : 0), 10);
        const awayScore = parseInt(r.awayScore != null ? r.awayScore : (r.score ? r.score.split("-")[1] : 0), 10);

        if (!statsMap[r.home]) {
          statsMap[r.home] = { id: Date.now() + Math.random(), name: r.home, color: r.hc || "blue", played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
        }
        if (!statsMap[r.away]) {
          statsMap[r.away] = { id: Date.now() + Math.random(), name: r.away, color: r.ac || "red", played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 };
        }

        const h = statsMap[r.home];
        const a = statsMap[r.away];

        h.played += 1;
        a.played += 1;
        h.gf += homeScore;
        h.ga += awayScore;
        a.gf += awayScore;
        a.ga += homeScore;

        if (homeScore > awayScore) {
          h.won += 1;
          h.pts += 3;
          a.lost += 1;
        } else if (homeScore < awayScore) {
          a.won += 1;
          a.pts += 3;
          h.lost += 1;
        } else {
          h.drawn += 1;
          h.pts += 1;
          a.drawn += 1;
          a.pts += 1;
        }
      });

      const updatedTeams = Object.values(statsMap).sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        const gdA = a.gf - a.ga;
        const gdB = b.gf - b.ga;
        if (gdB !== gdA) return gdB - gdA;
        return b.gf - a.gf;
      });

      set(STORAGE_KEYS.TEAMS, updatedTeams);
      return updatedTeams;
    }
  };

  // Run auto initialization
  CasanDB.init();

  // Export to window
  global.CasanDB = CasanDB;
})(typeof window !== "undefined" ? window : this);
