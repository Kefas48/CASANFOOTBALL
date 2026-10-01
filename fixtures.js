// CASANFOOTBALL Fixtures & Results Page Script
// Connects with Central DataStore (CasanDB) and URL Query Parameters

(function() {
  if (typeof CasanDB === "undefined") {
    console.error("CasanDB not loaded.");
    return;
  }

  let fixtures = CasanDB.getFixtures();
  let results = CasanDB.getResults();
  let table = CasanDB.getTeams();

  const shield = (color) => `<span class="shield ${color || 'blue'}"></span>`;
  const tinyShield = (color) => `<span class="tiny-shield ${color || 'blue'}"></span>`;

  function renderFixtures(list = fixtures) {
    const fixtureListEl = document.getElementById("fixtureList");
    if (!fixtureListEl) return;

    if (!list.length) {
      fixtureListEl.innerHTML = `<div style="padding:25px;text-align:center;color:#6b84a3">No upcoming fixtures scheduled at the moment.</div>`;
      return;
    }

    fixtureListEl.innerHTML = list.map((f, i) => `
      <div class="fixture-row" id="fixture-${f.id || i}">
        <div class="date-box">
          <div class="day">${f.day || 'MATCH'}</div>
          <div class="date">${f.date || 'TBD'}</div>
        </div>
        <div class="time-venue">
          <strong>◷ &nbsp;${f.time || '10:00 AM'}</strong>
          <div>⌖ &nbsp;${f.venue || "St. Matthew's Parish Field"}</div>
        </div>
        <div class="teams">
          <div class="team">${f.home}${shield(f.hc)}</div>
          <span class="vs">VS</span>
          <div class="team right">${f.away}${shield(f.ac)}</div>
        </div>
        <span class="status">${f.status || 'Upcoming'}</span>
        <button class="row-arrow" data-fixture-index="${i}" aria-label="View fixture details">›</button>
      </div>`).join("");

    document.querySelectorAll("[data-fixture-index]").forEach(b => {
      b.onclick = () => openFixture(list[Number(b.dataset.fixtureIndex)]);
    });
  }

  function renderMiniResults() {
    const miniEl = document.getElementById("miniResults");
    if (!miniEl) return;

    miniEl.innerHTML = results.slice(0, 3).map(r => `
      <div class="mini-result">
        <div class="mini-date"><strong>${r.day || 'FT'}</strong><br>${r.date}</div>
        <div class="mini-team">${r.home} ${shield(r.hc)}</div>
        <div class="mini-score">${r.score}</div>
        <div class="mini-team away">${shield(r.ac)} ${r.away}</div>
        <div class="mini-venue"><strong>Full Time</strong><br>${r.venue || "St. Matthew's Field"}</div>
      </div>`).join("");
  }

  function renderResults() {
    const resultsLargeEl = document.getElementById("resultsLarge");
    if (!resultsLargeEl) return;

    if (!results.length) {
      resultsLargeEl.innerHTML = `<div style="padding:25px;text-align:center;color:#6b84a3">No completed match results recorded yet.</div>`;
      return;
    }

    resultsLargeEl.innerHTML = results.map(r => `
      <div class="result-row">
        <div class="result-date"><strong>${r.day || 'MATCH'}</strong><br>${r.date}</div>
        <div class="result-team">${r.home} ${shield(r.hc)}</div>
        <div class="score">${r.score}</div>
        <div class="result-team away">${shield(r.ac)} ${r.away}</div>
        <div class="venue"><strong>Full Time</strong><br>${r.venue || "St. Matthew's Parish Field"}</div>
      </div>`).join("");
  }

  function renderScorelines() {
    const scorelineGridEl = document.getElementById("scorelineGrid");
    if (!scorelineGridEl) return;

    if (!results.length) {
      scorelineGridEl.innerHTML = `<div style="padding:25px;text-align:center;color:#6b84a3;grid-column:1/-1">No full scorelines recorded yet.</div>`;
      return;
    }

    scorelineGridEl.innerHTML = results.map(r => `
      <article class="score-card">
        <div class="sc-date">${r.day || 'FULL TIME'} • ${r.date}</div>
        <h3>${r.competition || "Intrasports Competition"}</h3>
        <div class="score-big">
          <div>${shield(r.hc)}<br><small>${r.home}</small></div>
          <span class="score">${r.score}</span>
          <div>${shield(r.ac)}<br><small>${r.away}</small></div>
        </div>
        <div class="modal-extra">Venue: ${r.venue || "St. Matthew's Parish Field"}</div>
      </article>`).join("");
  }

  function renderTable() {
    const leagueTableEl = document.getElementById("leagueTable");
    if (!leagueTableEl) return;

    leagueTableEl.innerHTML = table.map((t, i) => {
      const gd = (t.gf || 0) - (t.ga || 0);
      return `
        <tr>
          <td>${i + 1}</td>
          <td><span class="table-team">${tinyShield(t.color)}${t.name}</span></td>
          <td>${t.played || 0}</td>
          <td>${t.won || 0}</td>
          <td>${t.drawn || 0}</td>
          <td>${t.lost || 0}</td>
          <td>${gd > 0 ? "+" + gd : gd}</td>
          <td><strong>${t.pts || 0}</strong></td>
        </tr>`;
    }).join("");
  }

  function renderNext() {
    const nextMatchEl = document.getElementById("nextMatch");
    if (!nextMatchEl) return;

    const f = fixtures[0];
    if (!f) {
      nextMatchEl.innerHTML = `<p style="padding:10px;color:#7891ad;font-size:11px">No upcoming fixture scheduled.</p>`;
      return;
    }

    nextMatchEl.innerHTML = `
      <div class="next-line">
        <div class="next-date"><small>${f.day || 'NEXT'}</small><strong>${f.date || 'TBD'}</strong></div>
        <div class="next-info"><strong>◷ &nbsp;${f.time || '10:00 AM'}</strong><br>⌖ &nbsp;${f.venue || "St. Matthew's Field"}</div>
        <div class="next-teams">
          <div>${shield(f.hc)}<br>${f.home}</div>
          <span>VS</span>
          <div>${shield(f.ac)}<br>${f.away}</div>
        </div>
      </div>`;
  }

  function switchPanel(name) {
    document.querySelectorAll(".page-tab").forEach(b => {
      b.classList.toggle("active", b.dataset.panel === name);
    });

    const fPanel = document.getElementById("fixturesPanel");
    const rPanel = document.getElementById("resultsPanel");
    const sPanel = document.getElementById("scorelinesPanel");

    if (fPanel) fPanel.classList.toggle("hidden", name !== "fixtures");
    if (rPanel) rPanel.classList.toggle("hidden", name !== "results");
    if (sPanel) sPanel.classList.toggle("hidden", name !== "scorelines");

    const targetEl = document.getElementById(name + "Panel");
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  document.querySelectorAll(".page-tab").forEach(b => {
    b.onclick = () => switchPanel(b.dataset.panel);
  });
  document.querySelectorAll("[data-panel-link]").forEach(b => {
    b.onclick = () => switchPanel(b.dataset.panelLink);
  });

  const nextMatchViewBtn = document.getElementById("nextMatchViewBtn");
  if (nextMatchViewBtn) {
    nextMatchViewBtn.onclick = () => switchPanel("fixtures");
  }

  const viewAllFixtures = document.getElementById("viewAllFixtures");
  if (viewAllFixtures) {
    viewAllFixtures.onclick = () => switchPanel("fixtures");
  }

  function openFixture(f) {
    if (!f) return;
    const modalTitle = document.getElementById("modalTitle");
    const modalDetails = document.getElementById("modalDetails");
    const matchModal = document.getElementById("matchModal");

    if (modalTitle) modalTitle.textContent = `${f.home} vs ${f.away}`;
    if (modalDetails) {
      modalDetails.innerHTML = `
        <div class="modal-details">
          <div class="modal-team">${shield(f.hc)}<br>${f.home}</div>
          <div class="modal-score" style="color:#083168;font-size:26px">VS</div>
          <div class="modal-team">${shield(f.ac)}<br>${f.away}</div>
        </div>
        <div class="modal-extra">
          <strong>${f.day || 'Matchday'}, ${f.date || ''}</strong> &nbsp; • &nbsp; ◷ ${f.time || '10:00 AM'}<br>
          ⌖ ${f.venue || "St. Matthew's Parish Field"}<br><br>
          Competition: <strong>CASANFOOTBALL Intrasports Competition</strong><br>
          Parish: <em>St. Matthew's Parish, Amawbia (Altar Boys Association)</em>
        </div>`;
    }
    if (matchModal) matchModal.classList.add("open");
  }

  const closeModal = document.getElementById("closeModal");
  const matchModal = document.getElementById("matchModal");
  if (closeModal && matchModal) {
    closeModal.onclick = () => matchModal.classList.remove("open");
    matchModal.onclick = e => {
      if (e.target === matchModal) matchModal.classList.remove("open");
    };
  }

  // Search Overlay
  const searchOverlay = document.getElementById("searchOverlay");
  const openSearch = document.getElementById("openSearch");
  const closeSearch = document.getElementById("closeSearch");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (openSearch && searchOverlay && searchInput) {
    openSearch.onclick = () => {
      searchOverlay.classList.add("open");
      searchInput.focus();
    };
  }
  if (closeSearch && searchOverlay) {
    closeSearch.onclick = () => searchOverlay.classList.remove("open");
  }
  if (searchOverlay) {
    searchOverlay.onclick = e => {
      if (e.target === searchOverlay) searchOverlay.classList.remove("open");
    };
  }

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", e => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        searchResults.innerHTML = "";
        return;
      }
      const matchesFixtures = fixtures.filter(f => `${f.home} ${f.away} ${f.date} ${f.venue} ${f.time}`.toLowerCase().includes(q));
      const matchesResults = results.filter(r => `${r.home} ${r.away} ${r.score} ${r.date} ${r.venue}`.toLowerCase().includes(q));

      let html = "";
      if (matchesFixtures.length) {
        html += `<div style="font-size:11px;font-weight:800;color:#0b417e;margin:5px 0">Upcoming Fixtures</div>` +
          matchesFixtures.map(f => `
            <button class="search-result" data-fixture-id="${f.id}" style="width:100%;text-align:left;border:0;background:none;cursor:pointer">
              <strong>${f.home} vs ${f.away}</strong><br>
              <small>${f.date} • ${f.time} • ${f.venue}</small>
            </button>`).join("");
      }
      if (matchesResults.length) {
        html += `<div style="font-size:11px;font-weight:800;color:#189668;margin:8px 0 5px">Match Results</div>` +
          matchesResults.map(r => `
            <button class="search-result" data-result-tab="true" style="width:100%;text-align:left;border:0;background:none;cursor:pointer">
              <strong>${r.home} ${r.score} ${r.away}</strong><br>
              <small>${r.date} • ${r.venue}</small>
            </button>`).join("");
      }

      searchResults.innerHTML = html || `<p style="padding:15px;color:#7891ad">No matching matches found.</p>`;

      document.querySelectorAll("[data-fixture-id]").forEach(b => {
        b.onclick = () => {
          if (searchOverlay) searchOverlay.classList.remove("open");
          const target = fixtures.find(x => x.id === Number(b.dataset.fixtureId)) || fixtures[0];
          openFixture(target);
        };
      });

      document.querySelectorAll("[data-result-tab]").forEach(b => {
        b.onclick = () => {
          if (searchOverlay) searchOverlay.classList.remove("open");
          switchPanel("results");
        };
      });
    });
  }

  // Mobile menu toggle
  const mobileMenu = document.getElementById("mobileMenu");
  const mainNav = document.getElementById("mainNav");
  if (mobileMenu && mainNav) {
    mobileMenu.onclick = () => mainNav.classList.toggle("open");
  }

  // Check URL query parameters for direct page linking
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const fixtureParam = params.get("fixture");

    if (tabParam) {
      switchPanel(tabParam);
    }

    if (fixtureParam) {
      const match = fixtures.find(f =>
        `${f.home} vs ${f.away}`.toLowerCase() === fixtureParam.toLowerCase() ||
        f.home.toLowerCase().includes(fixtureParam.toLowerCase()) ||
        f.away.toLowerCase().includes(fixtureParam.toLowerCase())
      );
      if (match) {
        setTimeout(() => openFixture(match), 150);
      }
    }
  }

  // Initial render
  renderFixtures();
  renderMiniResults();
  renderResults();
  renderScorelines();
  renderTable();
  renderNext();
  checkUrlParams();

  // Listen for storage changes from Admin
  window.addEventListener("casan_data_change", e => {
    if (e.detail && (e.detail.key === "casan_fixtures" || e.detail.key === "casan_results" || e.detail.key === "casan_teams")) {
      fixtures = CasanDB.getFixtures();
      results = CasanDB.getResults();
      table = CasanDB.getTeams();
      renderFixtures();
      renderMiniResults();
      renderResults();
      renderScorelines();
      renderTable();
      renderNext();
    }
  });
})();
