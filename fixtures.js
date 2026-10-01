// CASANFOOTBALL Fixtures & Results Page Script
// Connects with Central DataStore (CasanDB) and URL Query Parameters
// Redesigned as a unified Match Centre: fixtures + results integrated

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

  // ============== NEW: Top Match Centre Overview Band ==============
  function renderOverviewBand() {
    const nextFixEl = document.getElementById("nextFixtureBand");
    const latestResEl = document.getElementById("latestResultBand");

    if (nextFixEl) {
      const next = fixtures[0];
      if (!next) {
        nextFixEl.innerHTML = `<div style="padding:16px;text-align:center;color:#7891ad;font-size:12px">No upcoming fixtures scheduled.</div>`;
      } else {
        nextFixEl.innerHTML = `
          <div class="band-match">
            <div class="band-date-block">
              <span class="band-day">${next.day || 'MATCH'}</span>
              <span class="band-date">${next.date || 'TBD'}</span>
            </div>
            <div class="band-teams-block">
              <div class="band-team"><span>${next.home}</span>${shield(next.hc)}</div>
              <div class="band-vs"><strong>VS</strong><small>${next.time || '10:00 AM'}</small></div>
              <div class="band-team right">${shield(next.ac)}<span>${next.away}</span></div>
            </div>
            <div class="band-meta-block">
              <strong>◷ ${next.time || '10:00 AM'}</strong>
              <small>⌖ ${next.venue || "St. Matthew's Field"}</small>
              <span class="status-pill upcoming">${next.status || 'Upcoming'}</span>
            </div>
          </div>`;
      }
    }

    if (latestResEl) {
      const latest = results[0];
      if (!latest) {
        latestResEl.innerHTML = `<div style="padding:16px;text-align:center;color:#7891ad;font-size:12px">No match results recorded yet.</div>`;
      } else {
        latestResEl.innerHTML = `
          <div class="band-match result">
            <div class="band-date-block">
              <span class="band-day">${latest.day || 'FT'}</span>
              <span class="band-date">${latest.date || '—'}</span>
            </div>
            <div class="band-teams-block">
              <div class="band-team"><span>${latest.home}</span>${shield(latest.hc)}</div>
              <div class="band-score"><strong>${latest.score}</strong><small>FULL TIME</small></div>
              <div class="band-team right">${shield(latest.ac)}<span>${latest.away}</span></div>
            </div>
            <div class="band-meta-block">
              <strong>🏆 ${latest.competition || 'Group Stage'}</strong>
              <small>⌖ ${latest.venue || "St. Matthew's Field"}</small>
              <span class="status-pill finished">Played</span>
            </div>
          </div>`;
      }
    }

    const fixCount = document.getElementById("fixtureCount");
    const resCount = document.getElementById("resultCount");
    const scCount = document.getElementById("scoreCount");
    if (fixCount) fixCount.textContent = `${fixtures.length} scheduled`;
    if (resCount) resCount.textContent = `${results.length} played`;
    if (scCount) scCount.textContent = `${results.length} scorecards`;
  }

  // ============== Fixtures List ==============
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

  // ============== Results (Large rows) ==============
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
        <div class="venue"><strong>${r.competition || 'Full Time'}</strong><br>${r.venue || "St. Matthew's Parish Field"}</div>
      </div>`).join("");
  }

  // ============== Score Cards Gallery ==============
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
        <div class="modal-extra">
          <strong>Venue:</strong> ${r.venue || "St. Matthew's Parish Field"}<br>
          <strong>Home:</strong> ${r.homeScore != null ? r.homeScore : r.score.split('-')[0]} goals &nbsp; | &nbsp;
          <strong>Away:</strong> ${r.awayScore != null ? r.awayScore : r.score.split('-')[1]} goals
        </div>
      </article>`).join("");
  }

  // ============== League Table ==============
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

  // ============== Next Match Sidebar ==============
  function renderNext() {
    const nextMatchEl = document.getElementById("nextMatch");
    if (!nextMatchEl) return;

    const nextThree = fixtures.slice(0, 3);
    if (!nextThree.length) {
      nextMatchEl.innerHTML = `<p style="padding:10px;color:#7891ad;font-size:11px">No upcoming fixture scheduled.</p>`;
      return;
    }

    nextMatchEl.innerHTML = nextThree.map(f => `
      <div class="next-line">
        <div class="next-date"><small>${f.day || 'NEXT'}</small><strong>${f.date || 'TBD'}</strong></div>
        <div class="next-info"><strong>◷ &nbsp;${f.time || '10:00 AM'}</strong><br>⌖ &nbsp;${f.venue || "St. Matthew's Field"}</div>
        <div class="next-teams">
          <div>${shield(f.hc)}<br>${f.home}</div>
          <span>VS</span>
          <div>${shield(f.ac)}<br>${f.away}</div>
        </div>
      </div>`).join("");
  }

  // ============== Panel Switcher ==============
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

  // ============== Fixture / Result Modal ==============
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

  // ============== Search Overlay ==============
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

  // ============== Mobile menu toggle ==============
  const mobileMenu = document.getElementById("mobileMenu");
  const mainNav = document.getElementById("mainNav");
  if (mobileMenu && mainNav) {
    mobileMenu.onclick = () => mainNav.classList.toggle("open");
  }

  // ============== URL Query Params ==============
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

  // ============== Initial render ==============
  renderOverviewBand();
  renderFixtures();
  renderResults();
  renderScorelines();
  renderTable();
  renderNext();
  checkUrlParams();

  // ============== Live Synchronization (Both Same-tab & Cross-tab) ==============
  function refreshFromStore() {
    fixtures = CasanDB.getFixtures();
    results = CasanDB.getResults();
    table = CasanDB.getTeams();
    renderOverviewBand();
    renderFixtures();
    renderResults();
    renderScorelines();
    renderTable();
    renderNext();
  }

  window.addEventListener("casan_data_change", e => {
    if (e.detail && (e.detail.key === "casan_fixtures" || e.detail.key === "casan_results" || e.detail.key === "casan_teams")) {
      refreshFromStore();
    }
  });

  window.addEventListener("storage", e => {
    if (e.key && (e.key === "casan_fixtures" || e.key === "casan_results" || e.key === "casan_teams")) {
      refreshFromStore();
    }
  });
})();
