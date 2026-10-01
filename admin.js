// CASANFOOTBALL Admin Dashboard & Control Center
// Complete implementation of all 15 Admin Sections with Live DataStore Synchronization

(function() {
  if (typeof CasanDB === "undefined") {
    console.error("CasanDB data store not found.");
    return;
  }

  // Active state
  let currentSection = "dashboard";
  let activePlayerStatCategory = "goals";

  // Cache DOM elements
  const sidebar = document.getElementById("sidebar");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalContent = document.getElementById("modalContent");
  const toastContainer = document.getElementById("toastContainer");

  // Router for section switching
  function switchSection(sectionId) {
    if (!sectionId) return;
    const targetSection = document.getElementById(`sec-${sectionId}`);
    if (!targetSection) {
      console.warn(`Section sec-${sectionId} does not exist.`);
      return;
    }

    // Hide all sections, display target
    document.querySelectorAll(".admin-section").forEach(s => s.classList.remove("active"));
    targetSection.classList.add("active");
    currentSection = sectionId;

    // Update navigation active states
    document.querySelectorAll(".sidebar-nav a, .sidebar-nav button").forEach(el => {
      if (el.dataset.section === sectionId) {
        el.classList.add("active");
        // Open parent submenu if applicable
        const parentSub = el.closest(".submenu");
        if (parentSub) {
          parentSub.classList.add("open");
          const toggleBtn = parentSub.previousElementSibling;
          if (toggleBtn) toggleBtn.classList.add("expanded");
        }
      } else {
        if (!el.classList.contains("nav-parent")) {
          el.classList.remove("active");
        }
      }
    });

    // Close mobile sidebar on navigation
    if (sidebar) sidebar.classList.remove("open");

    // Call specific section renderers
    switch(sectionId) {
      case "dashboard": renderDashboard(); break;
      case "news": renderNewsTable(); break;
      case "categories": renderCategoriesTable(); break;
      case "fixtures": renderFixturesTable(); break;
      case "results": renderResultsTable(); break;
      case "stats-overview": renderStatsOverview(); break;
      case "player-stats": renderPlayerStatsTable(activePlayerStatCategory); break;
      case "team-stats": renderTeamStandingsTable(); break;
      case "teams": renderTeamsGrid(); break;
      case "players": renderPlayersTable(); break;
      case "media": renderMediaGrid(); break;
      case "pages": renderPagesTable(); break;
      case "users": renderUsersTable(); break;
      case "general-settings": loadGeneralSettingsForm(); break;
      case "site-settings": loadSiteSettingsToggles(); break;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Toast Notification System
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = "toast";
    const icon = type === "success" ? "✓" : (type === "danger" ? "✕" : "ℹ");
    toast.innerHTML = `<strong style="color:var(--yellow)">CASAN Admin</strong>: ${message}`;
    if (toastContainer) {
      toastContainer.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 250);
      }, 3000);
    }
  }

  // Modal Handlers
  function openModal(html) {
    if (modalContent && modalBackdrop) {
      modalContent.innerHTML = html;
      modalBackdrop.classList.add("show");
    }
  }

  function closeModal() {
    if (modalBackdrop) modalBackdrop.classList.remove("show");
  }

  const modalCloseBtn = document.getElementById("modalClose");
  if (modalCloseBtn) modalCloseBtn.onclick = closeModal;
  if (modalBackdrop) {
    modalBackdrop.onclick = e => {
      if (e.target === modalBackdrop) closeModal();
    };
  }
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closeModal();
  });

  // 1. RENDER DASHBOARD
  function renderDashboard() {
    const news = CasanDB.getNews();
    const fixtures = CasanDB.getFixtures();
    const results = CasanDB.getResults();
    const teams = CasanDB.getTeams();
    const players = CasanDB.getPlayers();
    const stats = CasanDB.getStats();
    const activities = CasanDB.getActivities();

    // Metric counts
    const nEl = document.getElementById("metricNewsCount");
    const fEl = document.getElementById("metricFixturesCount");
    const tEl = document.getElementById("metricTeamsCount");
    const pEl = document.getElementById("metricPlayersCount");
    if (nEl) nEl.textContent = news.length;
    if (fEl) fEl.textContent = fixtures.length;
    if (tEl) tEl.textContent = teams.length;
    if (pEl) pEl.textContent = players.length;

    // Overview numbers
    const gEl = document.getElementById("dashTotalGoals");
    const aEl = document.getElementById("dashTotalAssists");
    const passEl = document.getElementById("dashTotalPasses");
    const tmEl = document.getElementById("dashTotalTeams");
    if (gEl) gEl.textContent = (stats.totals && stats.totals.goals) || 76;
    if (aEl) aEl.textContent = (stats.totals && stats.totals.assists) || 42;
    if (passEl) passEl.textContent = (stats.totals && stats.totals.passes ? stats.totals.passes.toLocaleString() : "2,476");
    if (tmEl) tmEl.textContent = teams.length;

    // Dash News Table
    const dashNews = document.getElementById("dashNewsTable");
    if (dashNews) {
      dashNews.innerHTML = news.slice(0, 5).map(n => `
        <tr>
          <td>
            <div class="news-title">
              <div class="news-thumb">⚽</div>
              <span>${escapeHtml(n.title)}</span>
            </div>
          </td>
          <td><span class="tag ${n.tag || 'blue'}">${escapeHtml(n.category)}</span></td>
          <td><span class="status">${n.status || 'Published'}</span></td>
          <td>${n.date}</td>
          <td>
            <div class="actions">
              <button class="action-btn" title="Edit Article" onclick="window.CasanAdmin.openNewsEditor(${n.id})">✎</button>
              <button class="action-btn" title="Delete Article" onclick="window.CasanAdmin.deleteNews(${n.id})">♙</button>
            </div>
          </td>
        </tr>`).join("");
    }

    // Dash Fixtures
    const dashFix = document.getElementById("dashFixturesList");
    if (dashFix) {
      dashFix.innerHTML = fixtures.slice(0, 5).map(f => `
        <div class="compact-row">
          <strong>${f.date}</strong>
          <span>${f.time}</span>
          <span>${f.home} <b class="vs">vs</b> ${f.away}</span>
          <span>${escapeHtml(f.venue || "St. Matthew's Field")}</span>
          <span class="mini-actions">
            <button class="action-btn" title="Record Result" onclick="window.CasanAdmin.openRecordScoreEditor(${f.id})">🏆</button>
            <button class="action-btn" title="Edit Fixture" onclick="window.CasanAdmin.openFixtureEditor(${f.id})">✎</button>
          </span>
        </div>`).join("");
    }

    // Dash Results
    const dashRes = document.getElementById("dashResultsList");
    if (dashRes) {
      dashRes.innerHTML = results.slice(0, 5).map(r => `
        <div class="result-row">
          <strong>${r.date}</strong>
          <span>${r.home} vs ${r.away}</span>
          <b class="score">${r.score}</b>
          <button class="action-btn" title="Edit Result" onclick="window.CasanAdmin.openResultEditor(${r.id})">✎</button>
        </div>`).join("");
    }

    // Dash Activities
    const dashAct = document.getElementById("dashActivityList");
    if (dashAct) {
      dashAct.innerHTML = activities.slice(0, 5).map(a => `
        <div class="activity">
          <div class="activity-icon ${a.color || 'blue'}">${a.icon || '●'}</div>
          <div class="activity-text">
            <strong>${escapeHtml(a.title)}</strong>
            <p>${escapeHtml(a.detail)}</p>
            <small>${a.time}</small>
          </div>
        </div>`).join("");
    }
  }

  // 2. RENDER NEWS MANAGEMENT TABLE
  function renderNewsTable() {
    const list = CasanDB.getNews();
    const searchVal = (document.getElementById("newsSearchInput")?.value || "").toLowerCase().trim();
    const catVal = (document.getElementById("newsCategoryFilter")?.value || "").toLowerCase();
    const statusVal = (document.getElementById("newsStatusFilter")?.value || "").toLowerCase();

    let filtered = list;
    if (searchVal) {
      filtered = filtered.filter(n => `${n.title} ${n.category} ${n.text || ''}`.toLowerCase().includes(searchVal));
    }
    if (catVal) {
      filtered = filtered.filter(n => (n.category || "").toLowerCase() === catVal);
    }
    if (statusVal) {
      filtered = filtered.filter(n => (n.status || "Published").toLowerCase() === statusVal);
    }

    const tableBody = document.getElementById("newsFullTable");
    if (!tableBody) return;

    if (!filtered.length) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:25px;color:var(--muted)">No news posts found matching current filters.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map((n, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>
          <div class="news-title">
            <img src="${n.image || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=100&q=80'}" style="width:40px;height:32px;border-radius:4px;object-fit:cover" alt="">
            <strong>${escapeHtml(n.title)}</strong>
          </div>
        </td>
        <td><span class="tag ${n.tag || 'blue'}">${escapeHtml(n.category)}</span></td>
        <td><span class="status" style="${n.status === 'Draft' ? 'background:#8d5c08;color:#ffdf99' : ''}">${n.status || 'Published'}</span></td>
        <td>${n.date}</td>
        <td>${escapeHtml(n.author || 'Admin')}</td>
        <td>
          <div class="actions">
            <button class="action-btn" title="Preview Article" onclick="window.CasanAdmin.previewArticle(${n.id})">◉</button>
            <button class="action-btn" title="Edit Article" onclick="window.CasanAdmin.openNewsEditor(${n.id})">✎</button>
            <button class="action-btn" title="Delete Article" onclick="window.CasanAdmin.deleteNews(${n.id})">♙</button>
          </div>
        </td>
      </tr>`).join("");
  }

  // 3. RENDER CATEGORIES TABLE
  function renderCategoriesTable() {
    const categories = CasanDB.getCategories();
    const news = CasanDB.getNews();
    const tableBody = document.getElementById("categoriesTable");
    if (!tableBody) return;

    tableBody.innerHTML = categories.map((c, i) => {
      const liveCount = news.filter(n => (n.category || "").toLowerCase() === c.name.toLowerCase()).length;
      return `
      <tr>
        <td style="font-size:20px">${c.icon || '▦'}</td>
        <td><strong>${escapeHtml(c.name)}</strong></td>
        <td><span class="tag blue">${liveCount} Articles</span></td>
        <td><span class="status">Active</span></td>
        <td>
          <div class="actions">
            <button class="action-btn" title="Edit Category" onclick="window.CasanAdmin.openCategoryEditor('${escapeHtml(c.name)}')">✎</button>
            <button class="action-btn" title="Delete Category" onclick="window.CasanAdmin.deleteCategory('${escapeHtml(c.name)}')">♙</button>
          </div>
        </td>
      </tr>`;
    }).join("");
  }

  // 4. RENDER FIXTURES TABLE
  function renderFixturesTable() {
    const list = CasanDB.getFixtures();
    const searchVal = (document.getElementById("fixtureSearchInput")?.value || "").toLowerCase().trim();
    const venueVal = (document.getElementById("fixtureVenueFilter")?.value || "").toLowerCase();

    let filtered = list;
    if (searchVal) {
      filtered = filtered.filter(f => `${f.home} ${f.away} ${f.date} ${f.time} ${f.venue}`.toLowerCase().includes(searchVal));
    }
    if (venueVal) {
      filtered = filtered.filter(f => (f.venue || "").toLowerCase() === venueVal);
    }

    const tableBody = document.getElementById("fixturesFullTable");
    if (!tableBody) return;

    if (!filtered.length) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:25px;color:var(--muted)">No fixtures found matching filters.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(f => `
      <tr>
        <td><strong>${f.date}</strong><br><small style="color:var(--muted)">${f.time}</small></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="shield ${f.hc || 'blue'}" style="width:20px;height:24px;display:inline-block"></span>
            <strong>${f.home}</strong>
            <b class="vs" style="margin:0 5px">VS</b>
            <strong>${f.away}</strong>
            <span class="shield ${f.ac || 'red'}" style="width:20px;height:24px;display:inline-block"></span>
          </div>
        </td>
        <td>${escapeHtml(f.venue || "St. Matthew's Parish Field")}</td>
        <td><span class="status">${f.status || 'Upcoming'}</span></td>
        <td>
          <div class="actions">
            <button class="btn btn-secondary btn-sm" title="Record Match Scoreline" onclick="window.CasanAdmin.openRecordScoreEditor(${f.id})">🏆 Record Score</button>
            <button class="action-btn" title="Edit Fixture" onclick="window.CasanAdmin.openFixtureEditor(${f.id})">✎</button>
            <button class="action-btn" title="Delete Fixture" onclick="window.CasanAdmin.deleteFixture(${f.id})">♙</button>
          </div>
        </td>
      </tr>`).join("");
  }

  // 5. RENDER RESULTS TABLE
  function renderResultsTable() {
    const list = CasanDB.getResults();
    const searchVal = (document.getElementById("resultsSearchInput")?.value || "").toLowerCase().trim();

    let filtered = list;
    if (searchVal) {
      filtered = filtered.filter(r => `${r.home} ${r.away} ${r.score} ${r.date} ${r.venue}`.toLowerCase().includes(searchVal));
    }

    const tableBody = document.getElementById("resultsFullTable");
    if (!tableBody) return;

    if (!filtered.length) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:25px;color:var(--muted)">No match results recorded yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(r => `
      <tr>
        <td>${r.date}</td>
        <td><strong>${r.home}</strong></td>
        <td><b class="score" style="font-size:16px">${r.score}</b></td>
        <td><strong>${r.away}</strong></td>
        <td>${escapeHtml(r.venue || "St. Matthew's Parish Field")}</td>
        <td><span class="tag green">${r.competition || 'Group Stage'}</span></td>
        <td>
          <div class="actions">
            <button class="action-btn" title="Edit Score" onclick="window.CasanAdmin.openResultEditor(${r.id})">✎</button>
            <button class="action-btn" title="Delete Result" onclick="window.CasanAdmin.deleteResult(${r.id})">♙</button>
          </div>
        </td>
      </tr>`).join("");
  }

  // 6. RENDER STATS OVERVIEW
  function renderStatsOverview() {
    const stats = CasanDB.getStats();
    const totals = stats.totals || { goals: 76, assists: 42, chances: 258, passes: 2476 };

    const gEl = document.getElementById("statOverviewGoals");
    const aEl = document.getElementById("statOverviewAssists");
    const cEl = document.getElementById("statOverviewChances");
    const pEl = document.getElementById("statOverviewPasses");

    if (gEl) gEl.textContent = totals.goals;
    if (aEl) aEl.textContent = totals.assists;
    if (cEl) cEl.textContent = totals.chances;
    if (pEl) pEl.textContent = (totals.passes || 2476).toLocaleString();
  }

  // 7. RENDER PLAYER STATS TABLE
  function renderPlayerStatsTable(catKey = "goals") {
    activePlayerStatCategory = catKey;
    const stats = CasanDB.getStats();
    const list = stats[catKey] || [];

    // Update active chip
    document.querySelectorAll("#playerStatCategoryChips .cat-chip").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.pstat === catKey);
    });

    const tableBody = document.getElementById("playerStatsTable");
    if (!tableBody) return;

    if (!list.length) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:25px;color:var(--muted)">No player stats recorded for ${catKey}.</td></tr>`;
      return;
    }

    tableBody.innerHTML = list.map((p, i) => `
      <tr>
        <td><strong>#${i + 1}</strong></td>
        <td>
          <div class="player-avatar-cell">
            <img src="${p[3] || 'https://i.pravatar.cc/80'}" class="player-avatar-sm" alt="">
            <strong>${escapeHtml(p[0])}</strong>
          </div>
        </td>
        <td><span class="tag blue">${escapeHtml(p[1])}</span></td>
        <td><b class="score">${escapeHtml(String(p[2]))}</b></td>
        <td>
          <div class="actions">
            <button class="action-btn" title="Edit Stat" onclick="window.CasanAdmin.openPlayerStatEditor('${catKey}', ${i})">✎</button>
            <button class="action-btn" title="Remove Stat" onclick="window.CasanAdmin.deletePlayerStat('${catKey}', ${i})">♙</button>
          </div>
        </td>
      </tr>`).join("");
  }

  // 8. RENDER TEAM STANDINGS TABLE
  function renderTeamStandingsTable() {
    const teams = CasanDB.getTeams();
    const tableBody = document.getElementById("teamStandingsTable");
    if (!tableBody) return;

    tableBody.innerHTML = teams.map((t, i) => {
      const gd = (t.gf || 0) - (t.ga || 0);
      return `
      <tr>
        <td><strong>${i + 1}</strong></td>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="shield ${t.color || 'blue'}" style="width:18px;height:22px;display:inline-block"></span>
            <strong>${t.name}</strong>
          </div>
        </td>
        <td>${t.played || 0}</td>
        <td>${t.won || 0}</td>
        <td>${t.drawn || 0}</td>
        <td>${t.lost || 0}</td>
        <td>${t.gf || 0}</td>
        <td>${t.ga || 0}</td>
        <td>${gd > 0 ? "+" + gd : gd}</td>
        <td><b class="score" style="font-size:14px">${t.pts || 0}</b></td>
        <td>
          <div class="actions">
            <button class="action-btn" title="Edit Team Record" onclick="window.CasanAdmin.openTeamEditor(${t.id})">✎</button>
            <button class="action-btn" title="Delete Team" onclick="window.CasanAdmin.deleteTeam(${t.id})">♙</button>
          </div>
        </td>
      </tr>`;
    }).join("");
  }

  // 9. RENDER TEAMS GRID
  function renderTeamsGrid() {
    const teams = CasanDB.getTeams();
    const grid = document.getElementById("teamsCardGrid");
    if (!grid) return;

    grid.innerHTML = teams.map(t => `
      <div class="admin-team-card">
        <div class="admin-team-head">
          <div class="admin-team-badge ${t.color || 'blue'}">⚽</div>
          <div>
            <h3 style="margin:0;font-size:16px">${t.name}</h3>
            <small style="color:var(--yellow);font-weight:600">${t.pts || 0} Points in League</small>
          </div>
        </div>
        <div class="admin-team-meta">
          <div>Captain: <strong>${escapeHtml(t.captain || 'Assigned')}</strong></div>
          <div>Squad: <strong>${t.members || 12} Altar Boys</strong></div>
          <div style="grid-column:1/-1">Motto: <em>"${escapeHtml(t.motto || 'Faith and Unity')}"</em></div>
        </div>
        <div class="admin-team-actions">
          <button class="btn btn-secondary btn-sm" style="flex:1" onclick="window.CasanAdmin.openTeamEditor(${t.id})">✎ Edit Team</button>
          <button class="btn btn-danger btn-sm" onclick="window.CasanAdmin.deleteTeam(${t.id})">♙</button>
        </div>
      </div>`).join("");
  }

  // 10. RENDER PLAYERS TABLE
  function renderPlayersTable() {
    const players = CasanDB.getPlayers();
    const searchVal = (document.getElementById("playerSearchInput")?.value || "").toLowerCase().trim();
    const teamVal = (document.getElementById("playerTeamFilter")?.value || "").toLowerCase();
    const posVal = (document.getElementById("playerPositionFilter")?.value || "").toLowerCase();

    let filtered = players;
    if (searchVal) {
      filtered = filtered.filter(p => `${p.name} ${p.team} ${p.position} ${p.number}`.toLowerCase().includes(searchVal));
    }
    if (teamVal) {
      filtered = filtered.filter(p => (p.team || "").toLowerCase() === teamVal);
    }
    if (posVal) {
      filtered = filtered.filter(p => (p.position || "").toLowerCase() === posVal);
    }

    const tableBody = document.getElementById("playersFullTable");
    if (!tableBody) return;

    if (!filtered.length) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:25px;color:var(--muted)">No registered players found matching filter criteria.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered.map(p => `
      <tr>
        <td>
          <div class="player-avatar-cell">
            <img src="${p.avatar || 'https://i.pravatar.cc/80'}" class="player-avatar-sm" alt="">
            <strong>${escapeHtml(p.name)}</strong>
          </div>
        </td>
        <td><span class="tag blue">${escapeHtml(p.team)}</span></td>
        <td>${escapeHtml(p.position)}</td>
        <td><b>#${p.number || '-'}</b></td>
        <td><span style="color:#1cd29c;font-weight:700">${p.goals || 0}</span></td>
        <td><span style="color:#ffd21a;font-weight:700">${p.assists || 0}</span></td>
        <td>
          <div class="actions">
            <button class="action-btn" title="Edit Player" onclick="window.CasanAdmin.openPlayerEditor(${p.id})">✎</button>
            <button class="action-btn" title="Delete Player" onclick="window.CasanAdmin.deletePlayer(${p.id})">♙</button>
          </div>
        </td>
      </tr>`).join("");
  }

  // 11. RENDER MEDIA GRID
  function renderMediaGrid() {
    const media = CasanDB.getMedia();
    const grid = document.getElementById("mediaGalleryGrid");
    if (!grid) return;

    grid.innerHTML = media.map(m => `
      <div class="media-card">
        <div class="media-thumb" style="background-image:url('${m.url}')">
          <span class="media-cat">${escapeHtml(m.category)}</span>
        </div>
        <div class="media-info">
          <strong title="${escapeHtml(m.title)}">${escapeHtml(m.title)}</strong>
          <small style="color:var(--muted)">${m.size} • ${m.date}</small>
        </div>
        <div class="media-actions">
          <button class="btn btn-secondary btn-sm" style="flex:1" onclick="window.CasanAdmin.copyMediaUrl('${m.url}')">Copy URL</button>
          <button class="btn btn-danger btn-sm" onclick="window.CasanAdmin.deleteMedia(${m.id})">♙</button>
        </div>
      </div>`).join("");
  }

  // 12. RENDER PAGES DIRECTORY
  function renderPagesTable() {
    const pages = CasanDB.getPages();
    const tableBody = document.getElementById("pagesFullTable");
    if (!tableBody) return;

    tableBody.innerHTML = pages.map(p => `
      <tr>
        <td><strong>${escapeHtml(p.title)}</strong></td>
        <td><code>${p.slug}</code></td>
        <td><span class="status">${p.status}</span></td>
        <td><small style="color:var(--muted)">${escapeHtml(p.seo || '')}</small></td>
        <td>
          <div class="actions">
            <a href="${p.path}" target="_blank" class="btn btn-primary btn-sm" style="text-decoration:none">Open Page ↗</a>
          </div>
        </td>
      </tr>`).join("");
  }

  // 13. RENDER USERS TABLE
  function renderUsersTable() {
    const users = CasanDB.getUsers();
    const tableBody = document.getElementById("usersFullTable");
    if (!tableBody) return;

    tableBody.innerHTML = users.map(u => `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:20px">${u.avatar || '👤'}</span>
            <strong>${escapeHtml(u.name)}</strong>
          </div>
        </td>
        <td>${escapeHtml(u.email)}</td>
        <td><span class="tag purple">${escapeHtml(u.role)}</span></td>
        <td><span class="status">${u.status || 'Active'}</span></td>
        <td><small style="color:var(--muted)">${u.lastLogin || 'Recent'}</small></td>
        <td>
          <div class="actions">
            <button class="action-btn" title="Edit Role" onclick="window.CasanAdmin.openUserEditor(${u.id})">✎</button>
            <button class="action-btn" title="Remove User" onclick="window.CasanAdmin.deleteUser(${u.id})">♙</button>
          </div>
        </td>
      </tr>`).join("");
  }

  // 14. LOAD GENERAL SETTINGS
  function loadGeneralSettingsForm() {
    const s = CasanDB.getSettings();
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };
    setVal("setCompName", s.competitionName);
    setVal("setParishName", s.parishName);
    setVal("setMotto", s.motto);
    setVal("setSubTitle", s.subTitle);
    setVal("setSeason", s.season);
    setVal("setAssociation", s.association);
    setVal("setContactEmail", s.contactEmail);
    setVal("setContactPhone", s.contactPhone);
  }

  // 15. LOAD SITE SETTINGS
  function loadSiteSettingsToggles() {
    const s = CasanDB.getSettings();
    const setCheck = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.checked = !!val;
    };
    setCheck("toggleLiveScore", s.liveScoreEnabled);
    setCheck("toggleAutoStandings", s.autoCalculateStandings);
    setCheck("toggleRegistration", s.publicRegistration);
    setCheck("toggleMaintenance", s.maintenanceMode);
  }

  // ================= CRUD & FORM MODALS =================

  // News CRUD
  function openNewsEditor(articleId = null) {
    const isEdit = articleId !== null;
    const news = CasanDB.getNews();
    const article = isEdit ? news.find(n => n.id === articleId) : null;

    openModal(`
      <div class="modal-body">
        <h2>${isEdit ? "Edit News Post" : "Add New News Post"}</h2>
        <p>Publish match coverage, interviews or team announcements.</p>
        <form id="newsEditForm" class="form-grid">
          <label>Article Title
            <input type="text" id="formNewsTitle" required value="${escapeHtml(article?.title || '')}" placeholder="e.g. Team A Secures Dramatic Win">
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Category
              <select id="formNewsCat">
                <option ${article?.category === 'Match Reports' ? 'selected' : ''}>Match Reports</option>
                <option ${article?.category === 'Interviews' ? 'selected' : ''}>Interviews</option>
                <option ${article?.category === 'Team News' ? 'selected' : ''}>Team News</option>
                <option ${article?.category === 'Predictions' ? 'selected' : ''}>Predictions</option>
                <option ${article?.category === 'Pre & Post Match' ? 'selected' : ''}>Pre & Post Match</option>
                <option ${article?.category === 'Lineups' ? 'selected' : ''}>Lineups</option>
              </select>
            </label>
            <label>Publication Status
              <select id="formNewsStatus">
                <option ${article?.status === 'Published' ? 'selected' : ''}>Published</option>
                <option ${article?.status === 'Draft' ? 'selected' : ''}>Draft</option>
              </select>
            </label>
          </div>
          <label>Header Image URL
            <input type="url" id="formNewsImage" value="${escapeHtml(article?.image || 'https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&w=900&q=85')}" placeholder="https://...">
          </label>
          <label>Article Content / Story
            <textarea id="formNewsText" rows="5" required placeholder="Write the full match report or interview...">${escapeHtml(article?.text || '')}</textarea>
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button type="submit" class="btn primary">${isEdit ? "Save Changes" : "Publish Article"}</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("newsEditForm").onsubmit = e => {
      e.preventDefault();
      const title = document.getElementById("formNewsTitle").value.trim();
      const cat = document.getElementById("formNewsCat").value;
      const status = document.getElementById("formNewsStatus").value;
      const img = document.getElementById("formNewsImage").value.trim();
      const text = document.getElementById("formNewsText").value.trim();

      const tagMap = {
        "Match Reports": "blue",
        "Interviews": "purple",
        "Team News": "green",
        "Predictions": "cyan",
        "Pre & Post Match": "red",
        "Lineups": "orange"
      };

      if (isEdit) {
        const idx = news.findIndex(n => n.id === articleId);
        if (idx !== -1) {
          news[idx] = { ...news[idx], title, category: cat, status, image: img, text, tag: tagMap[cat] || "blue" };
          CasanDB.saveNews(news);
          CasanDB.logActivity("blue", "✎", "News Post Updated", title);
          showToast(`Updated "${title}"`, "success");
        }
      } else {
        const newPost = {
          id: Date.now(),
          title,
          category: cat,
          status,
          image: img,
          text,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          comments: 0,
          author: "Admin Editor",
          tag: tagMap[cat] || "blue"
        };
        news.unshift(newPost);
        CasanDB.saveNews(news);
        CasanDB.logActivity("green", "New", "News Published", title);
        showToast(`Published "${title}"`, "success");
      }

      closeModal();
      if (currentSection === "news") renderNewsTable();
      if (currentSection === "dashboard") renderDashboard();
    };
  }

  function previewArticle(articleId) {
    const news = CasanDB.getNews();
    const a = news.find(n => n.id === articleId);
    if (!a) return;

    openModal(`
      <div class="modal-body">
        <span class="tag ${a.tag || 'blue'}">${escapeHtml(a.category)}</span>
        <h2 style="margin:10px 0">${escapeHtml(a.title)}</h2>
        <div style="font-size:11px;color:var(--muted);margin-bottom:12px">${a.date} • By ${a.author || 'Admin'}</div>
        <img src="${a.image}" style="width:100%;height:180px;object-fit:cover;border-radius:8px;margin-bottom:14px" alt="">
        <p style="font-size:13px;line-height:1.7">${escapeHtml(a.text)}</p>
        <div class="form-actions" style="margin-top:18px">
          <button class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Close Preview</button>
          <a href="News.html?article=${a.id}" target="_blank" class="btn primary" style="text-decoration:none">Open on Public Site ↗</a>
        </div>
      </div>
    `);
  }

  function deleteNews(articleId) {
    const news = CasanDB.getNews();
    const a = news.find(n => n.id === articleId);
    if (!a) return;

    openModal(`
      <div class="modal-body">
        <h2>Delete News Post?</h2>
        <p>Are you sure you want to remove <strong>${escapeHtml(a.title)}</strong>? This will remove it from the public news page.</p>
        <div class="form-actions" style="margin-top:20px">
          <button class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
          <button class="btn btn-danger" id="confirmDeleteNewsBtn">Yes, Delete Post</button>
        </div>
      </div>
    `);

    document.getElementById("confirmDeleteNewsBtn").onclick = () => {
      const updated = news.filter(n => n.id !== articleId);
      CasanDB.saveNews(updated);
      CasanDB.logActivity("red", "✕", "News Post Deleted", a.title);
      showToast(`Deleted post: ${a.title}`, "danger");
      closeModal();
      if (currentSection === "news") renderNewsTable();
      if (currentSection === "dashboard") renderDashboard();
    };
  }

  // Fixtures CRUD
  function openFixtureEditor(fixtureId = null) {
    const isEdit = fixtureId !== null;
    const fixtures = CasanDB.getFixtures();
    const f = isEdit ? fixtures.find(x => x.id === fixtureId) : null;

    openModal(`
      <div class="modal-body">
        <h2>${isEdit ? "Edit Fixture" : "Schedule New Fixture"}</h2>
        <p>Set match date, kickoff time, competing teams and venue.</p>
        <form id="fixtureForm" class="form-grid">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Home Team
              <input type="text" id="formFixHome" required value="${escapeHtml(f?.home || 'Team A')}" placeholder="Team A">
            </label>
            <label>Away Team
              <input type="text" id="formFixAway" required value="${escapeHtml(f?.away || 'Team B')}" placeholder="Team B">
            </label>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Date (Display)
              <input type="text" id="formFixDate" required value="${escapeHtml(f?.date || 'Aug 30')}" placeholder="Aug 30">
            </label>
            <label>Kickoff Time
              <input type="text" id="formFixTime" required value="${escapeHtml(f?.time || '10:00 AM')}" placeholder="10:00 AM">
            </label>
          </div>
          <label>Pitch / Venue
            <input type="text" id="formFixVenue" required value="${escapeHtml(f?.venue || "St. Matthew's Parish Field")}" placeholder="St. Matthew's Parish Field">
          </label>
          <label>Match Status
            <select id="formFixStatus">
              <option ${f?.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
              <option ${f?.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option ${f?.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option ${f?.status === 'Postponed' ? 'selected' : ''}>Postponed</option>
            </select>
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button type="submit" class="btn primary">${isEdit ? "Save Changes" : "Save Fixture"}</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("fixtureForm").onsubmit = e => {
      e.preventDefault();
      const home = document.getElementById("formFixHome").value.trim();
      const away = document.getElementById("formFixAway").value.trim();
      const date = document.getElementById("formFixDate").value.trim();
      const time = document.getElementById("formFixTime").value.trim();
      const venue = document.getElementById("formFixVenue").value.trim();
      const status = document.getElementById("formFixStatus").value;

      if (isEdit) {
        const idx = fixtures.findIndex(x => x.id === fixtureId);
        if (idx !== -1) {
          fixtures[idx] = { ...fixtures[idx], home, away, date, time, venue, status };
          CasanDB.saveFixtures(fixtures);
          CasanDB.logActivity("blue", "▣", "Fixture Updated", `${home} vs ${away}`);
          showToast(`Fixture updated: ${home} vs ${away}`, "success");
        }
      } else {
        const newFix = {
          id: Date.now(),
          day: "MATCH",
          date,
          time,
          venue,
          home,
          away,
          hc: "blue",
          ac: "red",
          status
        };
        fixtures.push(newFix);
        CasanDB.saveFixtures(fixtures);
        CasanDB.logActivity("green", "▣", "New Fixture Scheduled", `${home} vs ${away}`);
        showToast(`Scheduled: ${home} vs ${away}`, "success");
      }

      closeModal();
      if (currentSection === "fixtures") renderFixturesTable();
      if (currentSection === "dashboard") renderDashboard();
    };
  }

  function deleteFixture(fixtureId) {
    const fixtures = CasanDB.getFixtures();
    const f = fixtures.find(x => x.id === fixtureId);
    if (!f) return;

    openModal(`
      <div class="modal-body">
        <h2>Delete Fixture?</h2>
        <p>Remove upcoming match: <strong>${f.home} vs ${f.away}</strong> scheduled for ${f.date}?</p>
        <div class="form-actions" style="margin-top:20px">
          <button class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
          <button class="btn btn-danger" id="confirmDeleteFixBtn">Delete Fixture</button>
        </div>
      </div>
    `);

    document.getElementById("confirmDeleteFixBtn").onclick = () => {
      const updated = fixtures.filter(x => x.id !== fixtureId);
      CasanDB.saveFixtures(updated);
      CasanDB.logActivity("red", "✕", "Fixture Deleted", `${f.home} vs ${f.away}`);
      showToast(`Removed fixture ${f.home} vs ${f.away}`, "danger");
      closeModal();
      if (currentSection === "fixtures") renderFixturesTable();
      if (currentSection === "dashboard") renderDashboard();
    };
  }

  // Quick Action: Record Score directly from a fixture
  function openRecordScoreEditor(fixtureId) {
    const fixtures = CasanDB.getFixtures();
    const f = fixtures.find(x => x.id === fixtureId);
    if (!f) return;

    openModal(`
      <div class="modal-body">
        <h2>🏆 Record Match Result & Scoreline</h2>
        <p>Submit final score for <strong>${f.home} vs ${f.away}</strong>. This will automatically update league standings.</p>
        <form id="recordScoreForm" class="form-grid">
          <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;margin:15px 0">
            <div style="text-align:center">
              <strong style="display:block;margin-bottom:6px">${f.home}</strong>
              <input type="number" id="homeScoreInput" min="0" max="30" value="0" style="font-size:24px;text-align:center;padding:10px" required>
            </div>
            <div style="font-size:20px;font-weight:900;color:var(--yellow);margin-top:20px">VS</div>
            <div style="text-align:center">
              <strong style="display:block;margin-bottom:6px">${f.away}</strong>
              <input type="number" id="awayScoreInput" min="0" max="30" value="0" style="font-size:24px;text-align:center;padding:10px" required>
            </div>
          </div>
          <label>Match Venue
            <input type="text" id="scoreVenueInput" value="${escapeHtml(f.venue || "St. Matthew's Parish Field")}">
          </label>
          <label>Tournament Stage
            <input type="text" id="scoreStageInput" value="Group Stage">
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button type="submit" class="btn primary">Save & Update Standings</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("recordScoreForm").onsubmit = e => {
      e.preventDefault();
      const hScore = parseInt(document.getElementById("homeScoreInput").value, 10) || 0;
      const aScore = parseInt(document.getElementById("awayScoreInput").value, 10) || 0;
      const venue = document.getElementById("scoreVenueInput").value;
      const stage = document.getElementById("scoreStageInput").value;

      const results = CasanDB.getResults();
      const newResult = {
        id: Date.now(),
        day: f.day || "FT",
        date: f.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        home: f.home,
        away: f.away,
        homeScore: hScore,
        awayScore: aScore,
        score: `${hScore} - ${aScore}`,
        hc: f.hc || "blue",
        ac: f.ac || "red",
        venue,
        competition: stage
      };

      results.unshift(newResult);
      CasanDB.saveResults(results); // auto computes standings

      // Remove or mark fixture completed
      const updatedFixtures = fixtures.filter(x => x.id !== fixtureId);
      CasanDB.saveFixtures(updatedFixtures);

      CasanDB.logActivity("orange", "🏆", "Result Recorded", `${f.home} ${hScore} - ${aScore} ${f.away}`);
      showToast(`Recorded: ${f.home} ${hScore} - ${aScore} ${f.away}. Standings updated!`, "success");

      closeModal();
      renderDashboard();
      if (currentSection === "fixtures") renderFixturesTable();
      if (currentSection === "results") renderResultsTable();
    };
  }

  // Results CRUD
  function openResultEditor(resultId = null) {
    const isEdit = resultId !== null;
    const results = CasanDB.getResults();
    const r = isEdit ? results.find(x => x.id === resultId) : null;
    const teams = CasanDB.getTeams();

    const teamOptions = teams.map(t => `<option value="${t.name}">${t.name}</option>`).join("");

    openModal(`
      <div class="modal-body">
        <h2>${isEdit ? "Edit Match Result" : "Add Match Result"}</h2>
        <p>Enter the full time score and match details.</p>
        <form id="resultForm" class="form-grid">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Home Team
              <input type="text" id="resHome" required value="${escapeHtml(r?.home || 'Team A')}">
            </label>
            <label>Away Team
              <input type="text" id="resAway" required value="${escapeHtml(r?.away || 'Team B')}">
            </label>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Home Goals
              <input type="number" id="resHomeScore" required min="0" value="${r ? (r.homeScore != null ? r.homeScore : r.score.split('-')[0].trim()) : 2}">
            </label>
            <label>Away Goals
              <input type="number" id="resAwayScore" required min="0" value="${r ? (r.awayScore != null ? r.awayScore : r.score.split('-')[1].trim()) : 1}">
            </label>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Match Date
              <input type="text" id="resDate" required value="${escapeHtml(r?.date || 'Aug 23, 2025')}">
            </label>
            <label>Venue
              <input type="text" id="resVenue" required value="${escapeHtml(r?.venue || "St. Matthew's Parish Field")}">
            </label>
          </div>
          <label>Competition Stage
            <input type="text" id="resStage" value="${escapeHtml(r?.competition || 'Group Stage')}">
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button type="submit" class="btn primary">Save Result</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("resultForm").onsubmit = e => {
      e.preventDefault();
      const home = document.getElementById("resHome").value.trim();
      const away = document.getElementById("resAway").value.trim();
      const hs = parseInt(document.getElementById("resHomeScore").value, 10) || 0;
      const as = parseInt(document.getElementById("resAwayScore").value, 10) || 0;
      const date = document.getElementById("resDate").value.trim();
      const venue = document.getElementById("resVenue").value.trim();
      const competition = document.getElementById("resStage").value.trim();

      if (isEdit) {
        const idx = results.findIndex(x => x.id === resultId);
        if (idx !== -1) {
          results[idx] = {
            ...results[idx],
            home,
            away,
            homeScore: hs,
            awayScore: as,
            score: `${hs} - ${as}`,
            date,
            venue,
            competition
          };
          CasanDB.saveResults(results);
          showToast(`Updated result: ${home} ${hs} - ${as} ${away}`, "success");
        }
      } else {
        const newR = {
          id: Date.now(),
          day: "FT",
          date,
          home,
          away,
          homeScore: hs,
          awayScore: as,
          score: `${hs} - ${as}`,
          venue,
          competition,
          hc: "blue",
          ac: "red"
        };
        results.unshift(newR);
        CasanDB.saveResults(results);
        showToast(`Saved result: ${home} ${hs} - ${as} ${away}`, "success");
      }

      closeModal();
      if (currentSection === "results") renderResultsTable();
      if (currentSection === "team-stats") renderTeamStandingsTable();
      if (currentSection === "dashboard") renderDashboard();
    };
  }

  function deleteResult(resultId) {
    const results = CasanDB.getResults();
    const r = results.find(x => x.id === resultId);
    if (!r) return;

    openModal(`
      <div class="modal-body">
        <h2>Delete Result?</h2>
        <p>Remove match scoreline: <strong>${r.home} ${r.score} ${r.away}</strong>?</p>
        <div class="form-actions" style="margin-top:20px">
          <button class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
          <button class="btn btn-danger" id="confirmDeleteResBtn">Delete Result</button>
        </div>
      </div>
    `);

    document.getElementById("confirmDeleteResBtn").onclick = () => {
      const updated = results.filter(x => x.id !== resultId);
      CasanDB.saveResults(updated);
      showToast(`Removed result ${r.home} vs ${r.away}`, "danger");
      closeModal();
      if (currentSection === "results") renderResultsTable();
      if (currentSection === "team-stats") renderTeamStandingsTable();
      if (currentSection === "dashboard") renderDashboard();
    };
  }

  // Player Stat CRUD
  function openPlayerStatEditor(catKey = "goals", index = null) {
    const stats = CasanDB.getStats();
    const isEdit = index !== null && stats[catKey] && stats[catKey][index];
    const item = isEdit ? stats[catKey][index] : ["New Player", "Team A", 1, "https://i.pravatar.cc/80"];

    openModal(`
      <div class="modal-body">
        <h2>${isEdit ? "Edit Player Record" : "Add Player Stat Entry"}</h2>
        <p>Manage statistical achievements for competition leaderboards.</p>
        <form id="playerStatForm" class="form-grid">
          <label>Category
            <select id="statCatSelect">
              <option value="goals" ${catKey === 'goals' ? 'selected' : ''}>Top Scorers (Goals)</option>
              <option value="assists" ${catKey === 'assists' ? 'selected' : ''}>Top Assists</option>
              <option value="chances" ${catKey === 'chances' ? 'selected' : ''}>Chances Created</option>
              <option value="passes" ${catKey === 'passes' ? 'selected' : ''}>Passes Completed</option>
              <option value="clean" ${catKey === 'clean' ? 'selected' : ''}>Clean Sheets</option>
              <option value="tackles" ${catKey === 'tackles' ? 'selected' : ''}>Most Tackles</option>
              <option value="cards" ${catKey === 'cards' ? 'selected' : ''}>Yellow / Red Cards</option>
            </select>
          </label>
          <label>Player Name
            <input type="text" id="statPlayerName" required value="${escapeHtml(item[0])}" placeholder="Player name">
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Team
              <input type="text" id="statPlayerTeam" required value="${escapeHtml(item[1])}" placeholder="Team A">
            </label>
            <label>Stat Metric / Value
              <input type="text" id="statPlayerValue" required value="${escapeHtml(String(item[2]))}" placeholder="e.g. 8 or 2 Y / 0 R">
            </label>
          </div>
          <label>Player Avatar URL
            <input type="url" id="statPlayerAvatar" value="${escapeHtml(item[3] || 'https://i.pravatar.cc/80')}">
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button type="submit" class="btn primary">Save Stat</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("playerStatForm").onsubmit = e => {
      e.preventDefault();
      const targetCat = document.getElementById("statCatSelect").value;
      const name = document.getElementById("statPlayerName").value.trim();
      const team = document.getElementById("statPlayerTeam").value.trim();
      const val = document.getElementById("statPlayerValue").value.trim();
      const av = document.getElementById("statPlayerAvatar").value.trim();

      if (!stats[targetCat]) stats[targetCat] = [];

      if (isEdit && targetCat === catKey) {
        stats[targetCat][index] = [name, team, val, av];
      } else {
        stats[targetCat].unshift([name, team, val, av]);
      }

      CasanDB.saveStats(stats);
      showToast(`Saved stat entry for ${name}`, "success");
      closeModal();
      renderPlayerStatsTable(targetCat);
    };
  }

  function deletePlayerStat(catKey, index) {
    const stats = CasanDB.getStats();
    if (!stats[catKey] || !stats[catKey][index]) return;
    const name = stats[catKey][index][0];

    stats[catKey].splice(index, 1);
    CasanDB.saveStats(stats);
    showToast(`Removed ${name} from ${catKey}`, "danger");
    renderPlayerStatsTable(catKey);
  }

  // Team CRUD
  function openTeamEditor(teamId = null) {
    const isEdit = teamId !== null;
    const teams = CasanDB.getTeams();
    const t = isEdit ? teams.find(x => x.id === teamId) : null;

    openModal(`
      <div class="modal-body">
        <h2>${isEdit ? "Edit Team Profile" : "Add New Team"}</h2>
        <p>Register or update altar boy team details.</p>
        <form id="teamForm" class="form-grid">
          <label>Team Name
            <input type="text" id="tName" required value="${escapeHtml(t?.name || 'Team X')}">
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Team Color Shield
              <select id="tColor">
                <option value="blue" ${t?.color === 'blue' ? 'selected' : ''}>Royal Blue</option>
                <option value="red" ${t?.color === 'red' ? 'selected' : ''}>Crimson Red</option>
                <option value="green" ${t?.color === 'green' ? 'selected' : ''}>Emerald Green</option>
                <option value="yellow" ${t?.color === 'yellow' ? 'selected' : ''}>Gold Yellow</option>
                <option value="purple" ${t?.color === 'purple' ? 'selected' : ''}>Purple</option>
                <option value="teal" ${t?.color === 'teal' ? 'selected' : ''}>Teal</option>
                <option value="orange" ${t?.color === 'orange' ? 'selected' : ''}>Orange</option>
                <option value="gray" ${t?.color === 'gray' ? 'selected' : ''}>Silver Gray</option>
              </select>
            </label>
            <label>Captain Name
              <input type="text" id="tCaptain" value="${escapeHtml(t?.captain || 'Captain Name')}">
            </label>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:8px">
            <label>Played <input type="number" id="tPlayed" value="${t?.played || 0}"></label>
            <label>Won <input type="number" id="tWon" value="${t?.won || 0}"></label>
            <label>Drawn <input type="number" id="tDrawn" value="${t?.drawn || 0}"></label>
            <label>Points <input type="number" id="tPts" value="${t?.pts || 0}"></label>
          </div>
          <label>Team Motto
            <input type="text" id="tMotto" value="${escapeHtml(t?.motto || 'Nearer to God')}">
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button type="submit" class="btn primary">Save Team</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("teamForm").onsubmit = e => {
      e.preventDefault();
      const name = document.getElementById("tName").value.trim();
      const color = document.getElementById("tColor").value;
      const captain = document.getElementById("tCaptain").value.trim();
      const played = parseInt(document.getElementById("tPlayed").value, 10) || 0;
      const won = parseInt(document.getElementById("tWon").value, 10) || 0;
      const drawn = parseInt(document.getElementById("tDrawn").value, 10) || 0;
      const pts = parseInt(document.getElementById("tPts").value, 10) || 0;
      const motto = document.getElementById("tMotto").value.trim();

      if (isEdit) {
        const idx = teams.findIndex(x => x.id === teamId);
        if (idx !== -1) {
          teams[idx] = { ...teams[idx], name, color, captain, played, won, drawn, pts, motto };
          CasanDB.saveTeams(teams);
          showToast(`Updated team ${name}`, "success");
        }
      } else {
        const newTeam = {
          id: Date.now(),
          name,
          color,
          captain,
          played,
          won,
          drawn,
          lost: 0,
          gf: 0,
          ga: 0,
          pts,
          motto,
          members: 12
        };
        teams.push(newTeam);
        CasanDB.saveTeams(teams);
        showToast(`Added team ${name}`, "success");
      }

      closeModal();
      if (currentSection === "teams") renderTeamsGrid();
      if (currentSection === "team-stats") renderTeamStandingsTable();
      if (currentSection === "dashboard") renderDashboard();
    };
  }

  function deleteTeam(teamId) {
    const teams = CasanDB.getTeams();
    const t = teams.find(x => x.id === teamId);
    if (!t) return;

    openModal(`
      <div class="modal-body">
        <h2>Delete Team?</h2>
        <p>Remove <strong>${t.name}</strong> from CASANFOOTBALL intrasports competition?</p>
        <div class="form-actions" style="margin-top:20px">
          <button class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
          <button class="btn btn-danger" id="confirmDeleteTeamBtn">Delete Team</button>
        </div>
      </div>
    `);

    document.getElementById("confirmDeleteTeamBtn").onclick = () => {
      const updated = teams.filter(x => x.id !== teamId);
      CasanDB.saveTeams(updated);
      showToast(`Removed team ${t.name}`, "danger");
      closeModal();
      if (currentSection === "teams") renderTeamsGrid();
      if (currentSection === "team-stats") renderTeamStandingsTable();
    };
  }

  // Player CRUD
  function openPlayerEditor(playerId = null) {
    const isEdit = playerId !== null;
    const players = CasanDB.getPlayers();
    const p = isEdit ? players.find(x => x.id === playerId) : null;
    const teams = CasanDB.getTeams();

    const teamOptions = teams.map(t => `<option value="${t.name}" ${p?.team === t.name ? 'selected' : ''}>${t.name}</option>`).join("");

    openModal(`
      <div class="modal-body">
        <h2>${isEdit ? "Edit Player Profile" : "Register New Player"}</h2>
        <p>Add altar server details, squad number and position.</p>
        <form id="playerForm" class="form-grid">
          <label>Player Full Name
            <input type="text" id="pName" required value="${escapeHtml(p?.name || '')}" placeholder="Full name">
          </label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Assigned Team
              <select id="pTeam">${teamOptions}</select>
            </label>
            <label>Position
              <select id="pPosition">
                <option ${p?.position === 'Forward' ? 'selected' : ''}>Forward</option>
                <option ${p?.position === 'Midfielder' ? 'selected' : ''}>Midfielder</option>
                <option ${p?.position === 'Defender' ? 'selected' : ''}>Defender</option>
                <option ${p?.position === 'Goalkeeper' ? 'selected' : ''}>Goalkeeper</option>
              </select>
            </label>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">
            <label>Jersey No. <input type="number" id="pNumber" value="${p?.number || 10}"></label>
            <label>Goals <input type="number" id="pGoals" value="${p?.goals || 0}"></label>
            <label>Assists <input type="number" id="pAssists" value="${p?.assists || 0}"></label>
          </div>
          <label>Photo Avatar URL
            <input type="url" id="pAvatar" value="${escapeHtml(p?.avatar || 'https://i.pravatar.cc/120?img=12')}">
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button type="submit" class="btn primary">Save Player</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("playerForm").onsubmit = e => {
      e.preventDefault();
      const name = document.getElementById("pName").value.trim();
      const team = document.getElementById("pTeam").value;
      const position = document.getElementById("pPosition").value;
      const number = parseInt(document.getElementById("pNumber").value, 10) || 10;
      const goals = parseInt(document.getElementById("pGoals").value, 10) || 0;
      const assists = parseInt(document.getElementById("pAssists").value, 10) || 0;
      const avatar = document.getElementById("pAvatar").value.trim();

      if (isEdit) {
        const idx = players.findIndex(x => x.id === playerId);
        if (idx !== -1) {
          players[idx] = { ...players[idx], name, team, position, number, goals, assists, avatar };
          CasanDB.savePlayers(players);
          showToast(`Updated player ${name}`, "success");
        }
      } else {
        const newPlayer = {
          id: Date.now(),
          name,
          team,
          position,
          number,
          goals,
          assists,
          avatar
        };
        players.push(newPlayer);
        CasanDB.savePlayers(players);
        CasanDB.logActivity("purple", "●", "New Player Registered", `${name} (${team})`);
        showToast(`Registered player ${name}`, "success");
      }

      closeModal();
      if (currentSection === "players") renderPlayersTable();
      if (currentSection === "dashboard") renderDashboard();
    };
  }

  function deletePlayer(playerId) {
    const players = CasanDB.getPlayers();
    const p = players.find(x => x.id === playerId);
    if (!p) return;

    openModal(`
      <div class="modal-body">
        <h2>Delete Player?</h2>
        <p>Remove <strong>${p.name}</strong> from ${p.team} roster?</p>
        <div class="form-actions" style="margin-top:20px">
          <button class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
          <button class="btn btn-danger" id="confirmDeletePlayerBtn">Delete Player</button>
        </div>
      </div>
    `);

    document.getElementById("confirmDeletePlayerBtn").onclick = () => {
      const updated = players.filter(x => x.id !== playerId);
      CasanDB.savePlayers(updated);
      showToast(`Removed player ${p.name}`, "danger");
      closeModal();
      if (currentSection === "players") renderPlayersTable();
    };
  }

  // Media CRUD
  function openUploadMediaModal() {
    openModal(`
      <div class="modal-body">
        <h2>☁ Upload Competition Media</h2>
        <p>Add match photographs, trophy pictures or player headshots.</p>
        <form id="uploadMediaForm" class="form-grid">
          <label>Media Title
            <input type="text" id="mTitle" required placeholder="e.g. Finals Trophy Warmup">
          </label>
          <label>Category
            <select id="mCat">
              <option>Match Photos</option>
              <option>Interviews</option>
              <option>Training</option>
              <option>Venue</option>
              <option>Trophy</option>
            </select>
          </label>
          <label>Image URL
            <input type="url" id="mUrl" required value="https://images.unsplash.com/photo-1553778263-73a83bab9b0c?auto=format&fit=crop&w=800&q=80">
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button type="submit" class="btn primary">Upload to Library</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("uploadMediaForm").onsubmit = e => {
      e.preventDefault();
      const title = document.getElementById("mTitle").value.trim();
      const category = document.getElementById("mCat").value;
      const url = document.getElementById("mUrl").value.trim();

      const media = CasanDB.getMedia();
      media.unshift({
        id: Date.now(),
        title,
        category,
        url,
        size: "1.4 MB",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      });
      CasanDB.saveMedia(media);
      CasanDB.logActivity("cyan", "▧", "Image Uploaded", title);
      showToast(`Media added: ${title}`, "success");
      closeModal();
      if (currentSection === "media") renderMediaGrid();
    };
  }

  function copyMediaUrl(url) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast("Image URL copied to clipboard!", "success");
      });
    } else {
      showToast("URL: " + url);
    }
  }

  function deleteMedia(mediaId) {
    const media = CasanDB.getMedia();
    const m = media.find(x => x.id === mediaId);
    if (!m) return;

    const updated = media.filter(x => x.id !== mediaId);
    CasanDB.saveMedia(updated);
    showToast(`Removed media: ${m.title}`, "danger");
    if (currentSection === "media") renderMediaGrid();
  }

  // Category CRUD
  function openCategoryEditor(catName = "") {
    openModal(`
      <div class="modal-body">
        <h2>${catName ? "Edit Category" : "Add News Category"}</h2>
        <form id="catForm" class="form-grid">
          <label>Category Name
            <input type="text" id="catNameInput" required value="${escapeHtml(catName)}" placeholder="e.g. Highlights">
          </label>
          <label>Icon Symbol
            <select id="catIconInput">
              <option value="⚽">⚽ Football</option>
              <option value="♟">♟ Altar Cross / Knight</option>
              <option value="▣">▣ Grid / Board</option>
              <option value="▥">▥ Columns</option>
              <option value="🏆">🏆 Trophy</option>
              <option value="🎙">🎙 Microphone</option>
            </select>
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button type="submit" class="btn primary">Save Category</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("catForm").onsubmit = e => {
      e.preventDefault();
      const name = document.getElementById("catNameInput").value.trim();
      const icon = document.getElementById("catIconInput").value;
      const cats = CasanDB.getCategories();

      if (catName) {
        const c = cats.find(x => x.name.toLowerCase() === catName.toLowerCase());
        if (c) { c.name = name; c.icon = icon; }
      } else {
        cats.push({ name, icon, count: 0 });
      }

      CasanDB.saveCategories(cats);
      showToast(`Category "${name}" saved`, "success");
      closeModal();
      if (currentSection === "categories") renderCategoriesTable();
    };
  }

  function deleteCategory(catName) {
    const cats = CasanDB.getCategories();
    const updated = cats.filter(c => c.name.toLowerCase() !== catName.toLowerCase());
    CasanDB.saveCategories(updated);
    showToast(`Category "${catName}" removed`, "danger");
    if (currentSection === "categories") renderCategoriesTable();
  }

  // User CRUD
  function openUserEditor(userId = null) {
    const isEdit = userId !== null;
    const users = CasanDB.getUsers();
    const u = isEdit ? users.find(x => x.id === userId) : null;

    openModal(`
      <div class="modal-body">
        <h2>${isEdit ? "Edit Staff User" : "Add Administrator / Staff"}</h2>
        <form id="userForm" class="form-grid">
          <label>Full Name
            <input type="text" id="uName" required value="${escapeHtml(u?.name || '')}" placeholder="Name">
          </label>
          <label>Email Address
            <input type="email" id="uEmail" required value="${escapeHtml(u?.email || '')}" placeholder="admin@casanfootball.org">
          </label>
          <label>Role Assignment
            <select id="uRole">
              <option ${u?.role === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
              <option ${u?.role === 'Match Official' ? 'selected' : ''}>Match Official</option>
              <option ${u?.role === 'Editor' ? 'selected' : ''}>Editor</option>
              <option ${u?.role === 'Statistician' ? 'selected' : ''}>Statistician</option>
            </select>
          </label>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button type="submit" class="btn primary">Save User</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("userForm").onsubmit = e => {
      e.preventDefault();
      const name = document.getElementById("uName").value.trim();
      const email = document.getElementById("uEmail").value.trim();
      const role = document.getElementById("uRole").value;

      if (isEdit) {
        const idx = users.findIndex(x => x.id === userId);
        if (idx !== -1) {
          users[idx] = { ...users[idx], name, email, role };
          CasanDB.saveUsers(users);
          showToast(`Updated user: ${name}`, "success");
        }
      } else {
        users.push({
          id: Date.now(),
          name,
          email,
          role,
          status: "Active",
          lastLogin: "Never",
          avatar: "👤"
        });
        CasanDB.saveUsers(users);
        showToast(`Added user: ${name}`, "success");
      }

      closeModal();
      if (currentSection === "users") renderUsersTable();
    };
  }

  function deleteUser(userId) {
    const users = CasanDB.getUsers();
    const u = users.find(x => x.id === userId);
    if (!u) return;

    const updated = users.filter(x => x.id !== userId);
    CasanDB.saveUsers(updated);
    showToast(`Removed user ${u.name}`, "danger");
    if (currentSection === "users") renderUsersTable();
  }

  // Quick Totals Editor
  function openEditTotalsModal() {
    const stats = CasanDB.getStats();
    const t = stats.totals || { goals: 76, assists: 42, chances: 258, passes: 2476 };

    openModal(`
      <div class="modal-body">
        <h2>✎ Edit Quick Competition Totals</h2>
        <p>Update aggregated competition numbers shown on Statistics and Home page.</p>
        <form id="totalsForm" class="form-grid">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Total Goals
              <input type="number" id="totGoals" value="${t.goals || 76}">
            </label>
            <label>Total Assists
              <input type="number" id="totAssists" value="${t.assists || 42}">
            </label>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label>Total Chances
              <input type="number" id="totChances" value="${t.chances || 258}">
            </label>
            <label>Total Passes
              <input type="number" id="totPasses" value="${t.passes || 2476}">
            </label>
          </div>
          <div class="form-actions">
            <button type="button" class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button type="submit" class="btn primary">Update Totals</button>
          </div>
        </form>
      </div>
    `);

    document.getElementById("totalsForm").onsubmit = e => {
      e.preventDefault();
      stats.totals = {
        goals: parseInt(document.getElementById("totGoals").value, 10) || 76,
        assists: parseInt(document.getElementById("totAssists").value, 10) || 42,
        chances: parseInt(document.getElementById("totChances").value, 10) || 258,
        passes: parseInt(document.getElementById("totPasses").value, 10) || 2476
      };
      CasanDB.saveStats(stats);
      showToast("Updated competition totals!", "success");
      closeModal();
      renderStatsOverview();
      renderDashboard();
    };
  }

  // Auto Recalculate Standings button
  function handleRecalculateStandings() {
    CasanDB.recalculateStandings();
    showToast("Standings recalculated from all recorded match results!", "success");
    if (currentSection === "team-stats") renderTeamStandingsTable();
    if (currentSection === "dashboard") renderDashboard();
  }

  // Settings Handlers
  const generalForm = document.getElementById("generalSettingsForm");
  if (generalForm) {
    generalForm.onsubmit = e => {
      e.preventDefault();
      const s = CasanDB.getSettings();
      s.competitionName = document.getElementById("setCompName")?.value || s.competitionName;
      s.parishName = document.getElementById("setParishName")?.value || s.parishName;
      s.motto = document.getElementById("setMotto")?.value || s.motto;
      s.subTitle = document.getElementById("setSubTitle")?.value || s.subTitle;
      s.season = document.getElementById("setSeason")?.value || s.season;
      s.association = document.getElementById("setAssociation")?.value || s.association;
      s.contactEmail = document.getElementById("setContactEmail")?.value || s.contactEmail;
      s.contactPhone = document.getElementById("setContactPhone")?.value || s.contactPhone;

      CasanDB.saveSettings(s);
      showToast("General competition settings saved successfully!", "success");
    };
  }

  const saveSiteSettingsBtn = document.getElementById("saveSiteSettingsBtn");
  if (saveSiteSettingsBtn) {
    saveSiteSettingsBtn.onclick = () => {
      const s = CasanDB.getSettings();
      s.liveScoreEnabled = !!document.getElementById("toggleLiveScore")?.checked;
      s.autoCalculateStandings = !!document.getElementById("toggleAutoStandings")?.checked;
      s.publicRegistration = !!document.getElementById("toggleRegistration")?.checked;
      s.maintenanceMode = !!document.getElementById("toggleMaintenance")?.checked;

      CasanDB.saveSettings(s);
      showToast("Site configuration updated!", "success");
    };
  }

  const resetDefaultsBtn = document.getElementById("resetDefaultsBtn");
  if (resetDefaultsBtn) {
    resetDefaultsBtn.onclick = () => {
      openModal(`
        <div class="modal-body">
          <h2>Reset All Database Records?</h2>
          <p style="color:#ff8795">Warning: This will reload all default teams, fixtures, news articles and statistics from initial setup.</p>
          <div class="form-actions" style="margin-top:20px">
            <button class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Cancel</button>
            <button class="btn btn-danger" id="confirmResetBtn">Reset Everything</button>
          </div>
        </div>
      `);
      document.getElementById("confirmResetBtn").onclick = () => {
        CasanDB.resetDefaults();
        showToast("Database reset to factory default data.", "success");
        closeModal();
        switchSection("dashboard");
      };
    };
  }

  // Real-time Search and Filter bindings
  const newsSearchInput = document.getElementById("newsSearchInput");
  const newsCategoryFilter = document.getElementById("newsCategoryFilter");
  const newsStatusFilter = document.getElementById("newsStatusFilter");
  if (newsSearchInput) newsSearchInput.oninput = renderNewsTable;
  if (newsCategoryFilter) newsCategoryFilter.onchange = renderNewsTable;
  if (newsStatusFilter) newsStatusFilter.onchange = renderNewsTable;

  const fixtureSearchInput = document.getElementById("fixtureSearchInput");
  const fixtureVenueFilter = document.getElementById("fixtureVenueFilter");
  if (fixtureSearchInput) fixtureSearchInput.oninput = renderFixturesTable;
  if (fixtureVenueFilter) fixtureVenueFilter.onchange = renderFixturesTable;

  const resultsSearchInput = document.getElementById("resultsSearchInput");
  if (resultsSearchInput) resultsSearchInput.oninput = renderResultsTable;

  const playerSearchInput = document.getElementById("playerSearchInput");
  const playerTeamFilter = document.getElementById("playerTeamFilter");
  const playerPositionFilter = document.getElementById("playerPositionFilter");
  if (playerSearchInput) playerSearchInput.oninput = renderPlayersTable;
  if (playerTeamFilter) playerTeamFilter.onchange = renderPlayersTable;
  if (playerPositionFilter) playerPositionFilter.onchange = renderPlayersTable;

  // Player Stat Category Chips
  document.querySelectorAll("#playerStatCategoryChips .cat-chip").forEach(btn => {
    btn.onclick = () => renderPlayerStatsTable(btn.dataset.pstat);
  });

  const recalcStandingsBtn = document.getElementById("recalcStandingsBtn");
  if (recalcStandingsBtn) recalcStandingsBtn.onclick = handleRecalculateStandings;

  const autoSyncStandingsBtn = document.getElementById("autoSyncStandingsBtn");
  if (autoSyncStandingsBtn) autoSyncStandingsBtn.onclick = handleRecalculateStandings;

  const editTotalsBtn = document.getElementById("editTotalsBtn");
  if (editTotalsBtn) editTotalsBtn.onclick = openEditTotalsModal;

  // Global Click Delegations (Section router & Action router)
  document.addEventListener("click", e => {
    // Section navigation
    const secTarget = e.target.closest("[data-section]");
    if (secTarget) {
      e.preventDefault();
      switchSection(secTarget.dataset.section);
      return;
    }

    // Action router
    const actionTarget = e.target.closest("[data-action]");
    if (actionTarget) {
      e.preventDefault();
      const action = actionTarget.dataset.action;
      switch(action) {
        case "add-news": openNewsEditor(); break;
        case "add-category": openCategoryEditor(); break;
        case "add-fixture": openFixtureEditor(); break;
        case "add-result": openResultEditor(); break;
        case "add-player-stat": openPlayerStatEditor(activePlayerStatCategory); break;
        case "add-team": openTeamEditor(); break;
        case "add-player": openPlayerEditor(); break;
        case "upload": openUploadMediaModal(); break;
        case "add-page": showToast("Website pages are structured: index.html, News.html, fixtures.html, statistics.html, admin.html"); break;
        case "add-user": openUserEditor(); break;
      }
      return;
    }

    // Submenu Toggle
    const toggle = e.target.closest("[data-toggle]");
    if (toggle) {
      e.preventDefault();
      const sub = document.getElementById(toggle.dataset.toggle);
      if (sub) {
        sub.classList.toggle("open");
        toggle.classList.toggle("expanded");
      }
    }
  });

  // Topbar Actions
  const notifBtn = document.getElementById("notificationBtn");
  if (notifBtn) {
    notifBtn.onclick = () => {
      openModal(`
        <div class="modal-body">
          <h2>Notifications (3)</h2>
          <div style="display:flex;flex-direction:column;gap:10px;margin-top:14px">
            <div style="padding:10px;background:#03192f;border-radius:6px;border-left:3px solid var(--yellow)">
              <strong>Matchday 5 Lineups Due</strong>
              <p style="margin:2px 0;font-size:11px;color:var(--muted)">Team captains must submit starting rosters by Friday 6:00 PM.</p>
            </div>
            <div style="padding:10px;background:#03192f;border-radius:6px;border-left:3px solid #1cd29c">
              <strong>Live Score Engine Active</strong>
              <p style="margin:2px 0;font-size:11px;color:var(--muted)">Automatic synchronization with public site is running smoothly.</p>
            </div>
            <div style="padding:10px;background:#03192f;border-radius:6px;border-left:3px solid #7352e9">
              <strong>Database Backup Complete</strong>
              <p style="margin:2px 0;font-size:11px;color:var(--muted)">All tournament fixtures and statistics are secured.</p>
            </div>
          </div>
          <div class="form-actions" style="margin-top:18px">
            <button class="btn primary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Dismiss All</button>
          </div>
        </div>
      `);
    };
  }

  const profileBtn = document.getElementById("profileBtn");
  if (profileBtn) {
    profileBtn.onclick = () => {
      openModal(`
        <div class="modal-body">
          <h2>Administrator Profile</h2>
          <p>Logged in as <strong>Admin (Super Admin)</strong>.</p>
          <div class="form-grid">
            <label>Name <input type="text" value="Super Admin" readonly></label>
            <label>Parish Authority <input type="text" value="St. Matthew's Parish, Amawbia" readonly></label>
            <label>Email <input type="email" value="admin@casanfootball.org" readonly></label>
          </div>
          <div class="form-actions" style="margin-top:18px">
            <button class="btn secondary" onclick="document.getElementById('modalBackdrop').classList.remove('show')">Close</button>
            <a href="index.html" class="btn primary" style="text-decoration:none">View Live Site ↗</a>
          </div>
        </div>
      `);
    };
  }

  // Mobile menu
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu && sidebar) {
    mobileMenu.onclick = () => sidebar.classList.toggle("open");
  }

  // Live Clock updater
  function updateClock() {
    const now = new Date();
    const dEl = document.getElementById("todayDate");
    const tEl = document.getElementById("todayTime");
    if (dEl) dEl.textContent = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    if (tEl) tEl.textContent = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  // Helper escape
  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Expose methods to window for inline onclick handlers
  window.CasanAdmin = {
    openNewsEditor,
    previewArticle,
    deleteNews,
    openFixtureEditor,
    openRecordScoreEditor,
    deleteFixture,
    openResultEditor,
    deleteResult,
    openPlayerStatEditor,
    deletePlayerStat,
    openTeamEditor,
    deleteTeam,
    openPlayerEditor,
    deletePlayer,
    openUploadMediaModal,
    copyMediaUrl,
    deleteMedia,
    openCategoryEditor,
    deleteCategory,
    openUserEditor,
    deleteUser
  };

  // Initial Boot
  updateClock();
  setInterval(updateClock, 30000);
  switchSection("dashboard");
})();
