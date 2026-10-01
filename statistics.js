// CASANFOOTBALL Statistics Page Script
// Connects with Central DataStore (CasanDB), activates blank tabs (Tackles & Cards), and handles URL Query Parameters

(function() {
  if (typeof CasanDB === "undefined") {
    console.error("CasanDB not loaded.");
    return;
  }

  let statsData = CasanDB.getStats();
  let teamData = CasanDB.getTeams();

  const cardLabels = {
    goals: "Goals",
    assists: "Assists",
    chances: "Chances Created",
    passes: "Passes Completed",
    clean: "Clean Sheets",
    tackles: "Tackles",
    cards: "Bookings & Cards",
    teams: "Team Statistics"
  };

  function avatar(url, name) {
    const fallback = `https://i.pravatar.cc/80?u=${encodeURIComponent(name || 'Player')}`;
    return `<img class="player-avatar" src="${url || fallback}" alt="${escapeHtml(name)}" onerror="this.src='${fallback}'">`;
  }

  function renderPlayerTable(key) {
    const target = document.getElementById(key + "Table");
    if (!target) return;

    const list = statsData[key] || [];
    if (!list.length) {
      target.innerHTML = `<div style="padding:15px;color:#7891ad;font-size:11px;text-align:center">No records found.</div>`;
      return;
    }

    target.innerHTML = list.map((row, i) => `
      <div class="stat-row">
        <span class="rank">${i + 1}</span>
        <span class="player">
          ${avatar(row[3], row[0])}
          <span class="player-name">${escapeHtml(row[0])}</span>
        </span>
        <span class="team-pill">${escapeHtml(row[1])}</span>
        <span class="value">${escapeHtml(String(row[2]))}</span>
      </div>`).join("");
  }

  function renderTeams() {
    const target = document.getElementById("teamsTable");
    if (!target) return;

    if (!teamData.length) {
      target.innerHTML = `<div style="padding:15px;color:#7891ad;font-size:11px;text-align:center">No team stats available.</div>`;
      return;
    }

    target.innerHTML = teamData.map((row, i) => `
      <div class="team-row">
        <span class="rank">${i + 1}</span>
        <span class="team-name">
          <span class="team-badge ${row.color || row[1] || 'blue'}"></span>
          ${escapeHtml(row.name || row[0])}
        </span>
        <span>${row.gf != null ? row.gf : row[2]}</span>
        <span>${row.ga != null ? row.ga : row[3]}</span>
        <span class="team-points">${row.pts != null ? row.pts : row[4]}</span>
      </div>`).join("");
  }

  function renderTotals() {
    const totals = statsData.totals || { goals: 76, assists: 42, chances: 258, passes: 2476 };
    const gEl = document.getElementById("totalGoals");
    const aEl = document.getElementById("totalAssists");
    const cEl = document.getElementById("totalChances");
    const pEl = document.getElementById("totalPasses");

    if (gEl) gEl.textContent = totals.goals || 76;
    if (aEl) aEl.textContent = totals.assists || 42;
    if (cEl) cEl.textContent = totals.chances || 258;
    if (pEl) pEl.textContent = (totals.passes || 2476).toLocaleString();
  }

  function toast(message) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(window.__toast);
    window.__toast = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function selectStat(key) {
    document.querySelectorAll(".stats-link").forEach(b => {
      b.classList.toggle("active", b.dataset.stat === key || (key === "overview" && b.dataset.stat === "overview"));
    });

    if (key === "overview" || !key) {
      document.querySelectorAll(".stat-card").forEach(c => c.style.display = "block");
      const statHeader = document.getElementById("statistics");
      if (statHeader) statHeader.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    document.querySelectorAll(".stat-card").forEach(c => {
      c.style.display = c.dataset.card === key ? "block" : "none";
    });

    const card = document.querySelector(`.stat-card[data-card="${key}"]`);
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  document.querySelectorAll(".stats-link").forEach(btn => {
    btn.addEventListener("click", () => selectStat(btn.dataset.stat));
  });

  function openDetail(key) {
    const title = key === "teams" ? "Team Standings & Statistics" : "Top " + (cardLabels[key] || "Statistics");
    let rows = "";

    if (key === "teams") {
      rows = teamData.map((r, i) => `
        <div class="detail-item">
          <small>#${i + 1} • ${escapeHtml(r.name || r[0])}</small>
          <b>${r.gf != null ? r.gf : r[2]} goals for • ${r.ga != null ? r.ga : r[3]} against • ${r.pts != null ? r.pts : r[4]} pts</b>
        </div>`).join("");
    } else {
      const list = statsData[key] || [];
      rows = list.map((r, i) => `
        <div class="detail-item">
          <small>#${i + 1} • ${escapeHtml(r[1])}</small>
          <b>${escapeHtml(r[0])} — ${escapeHtml(String(r[2]))} ${cardLabels[key] ? cardLabels[key].toLowerCase() : ''}</b>
        </div>`).join("");
    }

    const detailContent = document.getElementById("detailContent");
    const detailOverlay = document.getElementById("detailOverlay");

    if (detailContent) {
      detailContent.innerHTML = `
        <h2>${escapeHtml(title)}</h2>
        <p>Full competition ranking — St. Matthew's Parish, Amawbia Intrasports Competition.</p>
        <div class="detail-list">${rows || '<p>No details recorded.</p>'}</div>`;
    }
    if (detailOverlay) detailOverlay.classList.add("open");
  }

  document.querySelectorAll("[data-open]").forEach(btn => {
    btn.addEventListener("click", () => openDetail(btn.dataset.open));
  });

  // Mobile menu
  const mobileToggle = document.getElementById("mobileToggle");
  const mainNav = document.getElementById("mainNav");
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener("click", () => mainNav.classList.toggle("open"));
  }

  // Search & Detail Overlay handles
  const overlay = document.getElementById("searchOverlay");
  const searchButton = document.getElementById("searchButton");
  const closeSearch = document.getElementById("closeSearch");
  const closeDetail = document.getElementById("closeDetail");
  const detailOverlay = document.getElementById("detailOverlay");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (searchButton && overlay && searchInput) {
    searchButton.addEventListener("click", () => {
      overlay.classList.add("open");
      searchInput.focus();
    });
  }
  if (closeSearch && overlay) {
    closeSearch.addEventListener("click", () => overlay.classList.remove("open"));
  }
  if (closeDetail && detailOverlay) {
    closeDetail.addEventListener("click", () => detailOverlay.classList.remove("open"));
  }
  [overlay, detailOverlay].forEach(o => {
    if (o) {
      o.addEventListener("click", e => {
        if (e.target === o) o.classList.remove("open");
      });
    }
  });

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", e => {
      const q = e.target.value.toLowerCase().trim();
      const allStats = [];

      Object.entries(statsData).forEach(([type, rows]) => {
        if (Array.isArray(rows)) {
          rows.forEach(r => {
            allStats.push({ type: cardLabels[type] || type, name: r[0], team: r[1], value: r[2], catKey: type });
          });
        }
      });

      teamData.forEach(r => {
        allStats.push({
          type: "Team Standings",
          name: r.name || r[0],
          team: r.name || r[0],
          value: `${r.pts != null ? r.pts : r[4]} pts`,
          catKey: "teams"
        });
      });

      const found = q ? allStats.filter(x => `${x.name} ${x.team} ${x.type}`.toLowerCase().includes(q)) : allStats.slice(0, 7);

      searchResults.innerHTML = found.length
        ? found.map(x => `
          <div class="search-result" data-stat-cat="${x.catKey}" style="cursor:pointer">
            <b style="color:#082e63">${escapeHtml(x.name)}</b> — ${escapeHtml(String(x.value))}
            <small style="color:#1d6dbf;font-weight:700">(${escapeHtml(x.type)})</small><br>
            <small style="color:#6d86a4">${escapeHtml(x.team)}</small>
          </div>`).join("")
        : "<p style='padding:12px;color:#7891ad'>No matching players or teams found.</p>";

      document.querySelectorAll(".search-result").forEach(el => {
        el.onclick = () => {
          if (overlay) overlay.classList.remove("open");
          const cat = el.dataset.statCat;
          if (cat) selectStat(cat);
        };
      });
    });
  }

  // Check URL query parameters for direct page linking
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const statParam = params.get("stat");

    if (statParam) {
      setTimeout(() => {
        selectStat(statParam);
      }, 100);
    }
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Initial render of all tables including tackles and cards
  ["goals", "assists", "chances", "passes", "clean", "tackles", "cards"].forEach(renderPlayerTable);
  renderTeams();
  renderTotals();
  checkUrlParams();

  function refreshFromStore() {
    statsData = CasanDB.getStats();
    teamData = CasanDB.getTeams();
    ["goals", "assists", "chances", "passes", "clean", "tackles", "cards"].forEach(renderPlayerTable);
    renderTeams();
    renderTotals();
  }

  window.addEventListener("casan_data_change", e => {
    if (e.detail && (e.detail.key === "casan_stats" || e.detail.key === "casan_teams")) {
      refreshFromStore();
    }
  });

  window.addEventListener("storage", e => {
    if (e.key && (e.key === "casan_stats" || e.key === "casan_teams")) {
      refreshFromStore();
    }
  });
})();
