// CASANFOOTBALL Home Page Script
// Connects with Central DataStore (CasanDB) and interlinks with all pages
// Added: Cross-tab live synchronization via storage + casan_data_change events

(function() {
  if (typeof CasanDB === "undefined") {
    console.error("CasanDB not loaded.");
    return;
  }

  let news = CasanDB.getNews();
  let fixtures = CasanDB.getFixtures();
  let results = CasanDB.getResults();
  let stats = CasanDB.getStats();

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function renderNews() {
    const newsListEl = document.getElementById("newsList");
    if (!newsListEl) return;
    newsListEl.innerHTML = news.slice(0, 3).map(n => `
      <a class="news-item" href="News.html?article=${n.id}" title="Read: ${escapeHtml(n.title)}">
        <img src="${n.image || n.img || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=500&q=80'}" alt="${escapeHtml(n.title)}">
        <div>
          <h3>${escapeHtml(n.title)}</h3>
          <time>${n.date} • <span style="color:#085ab3;font-weight:700">${n.category || 'News'}</span></time>
          <p>${escapeHtml((n.text || '').substring(0, 115))}...</p>
        </div>
      </a>`).join("");
  }

  function renderFixtures() {
    const fixtureListEl = document.getElementById("fixtureList");
    if (!fixtureListEl) return;
    const badgeMap = {
      blue: "🔵", red: "🔴", green: "🟢", yellow: "🟡", purple: "🟣", teal: "💠", orange: "🟠", gray: "⚪"
    };
    fixtureListEl.innerHTML = fixtures.slice(0, 4).map(f => {
      const hBadge = badgeMap[f.hc] || "🔵";
      const aBadge = badgeMap[f.ac] || "🔴";
      const dateParts = f.date ? f.date.split(" ") : ["30", "AUG"];
      const day = dateParts[1] || dateParts[0] || "30";
      const month = dateParts[0] || "AUG";
      return `
      <a class="fixture" href="fixtures.html?fixture=${encodeURIComponent(f.home + ' vs ' + f.away)}" style="color:inherit;text-decoration:none;display:grid" title="View details: ${f.home} vs ${f.away}">
        <div class="fixture-date"><strong>${f.day || day}</strong><small>${f.date || month}</small></div>
        <div class="team"><span class="team-badge">${hBadge}</span>${f.home}</div>
        <div class="vs"><strong>VS</strong><small>${f.time}</small></div>
        <div class="team"><span class="team-badge">${aBadge}</span>${f.away}</div>
        <div style="font-size:18px;color:#ffd21a;text-align:center">›</div>
      </a>`;
    }).join("");
  }

  function renderStatsCards() {
    const statsGridEl = document.getElementById("statsGrid");
    if (!statsGridEl) return;
    const topScorer = (stats.goals && stats.goals[0]) || ["Emeka Nwosu", "Team A", 8];
    const topAssister = (stats.assists && stats.assists[0]) || ["Chinedu Okafor", "Team C", 5];
    const topChances = (stats.chances && stats.chances[0]) || ["Joseph Eze", "Team D", 12];
    const topPasses = (stats.passes && stats.passes[0]) || ["Joseph Eze", "Team D", 487];
    const cards = [
      { icon: "⚽", label: "Most Goals Scored", name: topScorer[0], value: topScorer[2], unit: "Goals", team: topScorer[1], stat: "goals" },
      { icon: "👟", label: "Most Assists", name: topAssister[0], value: topAssister[2], unit: "Assists", team: topAssister[1], stat: "assists" },
      { icon: "★", label: "Chances Created", name: topChances[0], value: topChances[2], unit: "Chances", team: topChances[1], stat: "chances" },
      { icon: "↔", label: "Passes Completed", name: topPasses[0], value: topPasses[2], unit: "Passes", team: topPasses[1], stat: "passes" }
    ];
    statsGridEl.innerHTML = cards.map(s => `
      <a class="stat-card" href="statistics.html?stat=${s.stat}" style="text-decoration:none;color:inherit;cursor:pointer" title="View ${s.label} on Statistics page">
        <div class="stat-icon">${s.icon}</div>
        <h3>${s.label}</h3>
        <strong>${s.name}</strong>
        <div class="number">${s.value} <small>${s.unit}</small></div>
        <small>${s.team}</small>
      </a>`).join("");
  }

  function renderResults() {
    const resultsGridEl = document.getElementById("resultsGrid");
    if (!resultsGridEl) return;
    resultsGridEl.innerHTML = results.slice(0, 5).map(r => `
      <a class="result-card" href="fixtures.html?tab=results" style="text-decoration:none;color:inherit" title="View result details">
        <time>${r.date || (r[0] || 'Matchday')}</time>
        <div class="result-teams">
          <div class="result-team">${r.home || r[1]}</div>
          <div class="score">${r.score || r[2]}</div>
          <div class="result-team">${r.away || r[3]}</div>
        </div>
        <div class="venue">${r.venue || r[4] || "St. Matthew's Parish Field"}</div>
      </a>`).join("");
  }

  function reRenderAll() {
    news = CasanDB.getNews();
    fixtures = CasanDB.getFixtures();
    results = CasanDB.getResults();
    stats = CasanDB.getStats();
    renderNews();
    renderFixtures();
    renderStatsCards();
    renderResults();
  }

  renderNews();
  renderFixtures();
  renderStatsCards();
  renderResults();

  // ===== LIVE SYNCHRONIZATION (Cross-tab + Same-tab) =====
  window.addEventListener("casan_data_change", e => {
    if (!e.detail || !e.detail.key) return;
    const key = e.detail.key;
    if (key === "casan_news" || key === "casan_fixtures" || key === "casan_results" ||
        key === "casan_stats" || key === "casan_teams") {
      reRenderAll();
    }
  });

  window.addEventListener("storage", e => {
    if (e.key && (e.key.startsWith("casan_"))) {
      reRenderAll();
    }
  });

  // ===== Mobile menu toggle =====
  const mobileToggle = document.getElementById("mobileToggle");
  const mainNav = document.getElementById("mainNav");
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("open");
      mobileToggle.setAttribute("aria-expanded", open);
    });
  }

  // ===== Global search modal =====
  const searchModal = document.getElementById("searchModal");
  const searchBtn = document.getElementById("searchBtn");
  const closeSearchBtn = document.getElementById("closeSearch");
  const siteSearch = document.getElementById("siteSearch");
  const searchResults = document.getElementById("searchResults");

  function openSearch() {
    if (searchModal) {
      searchModal.classList.add("open");
      searchModal.setAttribute("aria-hidden", "false");
      if (siteSearch) siteSearch.focus();
    }
  }
  function closeSearch() {
    if (searchModal) {
      searchModal.classList.remove("open");
      searchModal.setAttribute("aria-hidden", "true");
    }
  }
  if (searchBtn) searchBtn.addEventListener("click", openSearch);
  if (closeSearchBtn) closeSearchBtn.addEventListener("click", closeSearch);
  if (searchModal) {
    searchModal.addEventListener("click", e => {
      if (e.target === searchModal) closeSearch();
    });
  }

  function buildSearchData() {
    return [
      ...news.map(n => ({
        title: n.title,
        type: "News Post",
        url: `News.html?article=${n.id}`,
        meta: `${n.category} • ${n.date}`
      })),
      ...fixtures.map(f => ({
        title: `${f.home} vs ${f.away}`,
        type: "Upcoming Fixture",
        url: `fixtures.html?fixture=${encodeURIComponent(f.home + ' vs ' + f.away)}`,
        meta: `${f.date} • ${f.time} • ${f.venue}`
      })),
      ...results.map(r => ({
        title: `${r.home || r[1]} ${r.score || r[2]} ${r.away || r[3]}`,
        type: "Match Result",
        url: `fixtures.html?tab=results`,
        meta: `${r.date || r[0]} • ${r.venue || r[4]}`
      })),
      { title: "Top Goal Scorers", type: "Statistics", url: "statistics.html?stat=goals", meta: "Competition goal records" },
      { title: "Top Assists", type: "Statistics", url: "statistics.html?stat=assists", meta: "Assist leaders" },
      { title: "Chances Created", type: "Statistics", url: "statistics.html?stat=chances", meta: "Playmaker rankings" },
      { title: "Passes Completed", type: "Statistics", url: "statistics.html?stat=passes", meta: "Midfield distribution stats" },
      { title: "Clean Sheets", type: "Statistics", url: "statistics.html?stat=clean", meta: "Goalkeeper records" },
      { title: "Most Tackles", type: "Statistics", url: "statistics.html?stat=tackles", meta: "Defensive rankings" },
      { title: "Yellow & Red Cards", type: "Statistics", url: "statistics.html?stat=cards", meta: "Disciplinary table" },
      { title: "Team Statistics & League Table", type: "Statistics", url: "statistics.html?stat=teams", meta: "Standings and point table" }
    ];
  }

  if (siteSearch && searchResults) {
    siteSearch.addEventListener("input", e => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        searchResults.innerHTML = "";
        return;
      }
      const searchData = buildSearchData();
      const matches = searchData.filter(x => (x.title + " " + x.type + " " + (x.meta || "")).toLowerCase().includes(q)).slice(0, 8);
      searchResults.innerHTML = matches.length
        ? matches.map(x => `
          <a class="search-result" href="${x.url}" style="display:block;padding:10px 4px;border-bottom:1px solid #e1e9f2;text-decoration:none;color:inherit">
            <strong style="color:#082f64">${escapeHtml(x.title)}</strong><br>
            <small style="color:#1d6bb8;font-weight:700">${x.type}</small> • <small style="color:#6d849f">${escapeHtml(x.meta || '')}</small>
          </a>`).join("")
        : `<p style="padding:15px;color:#7891ac">No matching content found for "${escapeHtml(q)}".</p>`;
    });
  }

  // ===== Back to top button =====
  const backTop = document.getElementById("backTop");
  if (backTop) {
    window.addEventListener("scroll", () => backTop.classList.toggle("show", window.scrollY > 400));
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
})();
