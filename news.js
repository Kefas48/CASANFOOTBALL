// CASANFOOTBALL News Page Script
// Connects with Central DataStore (CasanDB) and URL Query Parameters

(function() {
  if (typeof CasanDB === "undefined") {
    console.error("CasanDB not loaded.");
    return;
  }

  // Load articles from CasanDB
  let articles = CasanDB.getNews();

  const articleGrid = document.getElementById("articleGrid");
  const emptyState = document.getElementById("emptyState");

  const badgeClasses = {
    "Match Reports": "match",
    "Interviews": "interview",
    "Team News": "team",
    "Predictions": "prediction",
    "Pre & Post Match": "prepost",
    "Lineups": "lineup"
  };

  const categoryIcons = {
    "Match Reports": "⚽",
    "Interviews": "♟",
    "Team News": "♟",
    "Predictions": "▥",
    "Pre & Post Match": "▣",
    "Lineups": "♟"
  };

  function badgeClass(cat) {
    return badgeClasses[cat] || "match";
  }

  // Calculate live counts per category
  function getCategoryCounts() {
    const counts = {
      "Match Reports": 0,
      "Interviews": 0,
      "Team News": 0,
      "Predictions": 0,
      "Pre & Post Match": 0,
      "Lineups": 0
    };
    articles.forEach(a => {
      if (counts[a.category] !== undefined) {
        counts[a.category]++;
      } else {
        counts[a.category] = 1;
      }
    });
    return counts;
  }

  function renderArticles(category = "All News", search = "") {
    let list = (category === "All News" || !category)
      ? articles
      : articles.filter(a => (a.category || "").toLowerCase() === category.toLowerCase());

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        `${a.title} ${a.category} ${a.text || ''}`.toLowerCase().includes(q)
      );
    }

    if (articleGrid) {
      articleGrid.innerHTML = list.map(a => `
        <article class="article-card" id="article-${a.id}">
          <div class="article-image" style="background-image:url('${a.image || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=85'}')">
            <span class="badge ${badgeClass(a.category)}">${(a.category || 'NEWS').toUpperCase()}</span>
          </div>
          <div class="article-body">
            <h2>${escapeHtml(a.title)}</h2>
            <p>${escapeHtml(a.text || '')}</p>
            <div class="meta">
              <span>▣ ${a.date}</span>
              <span>◌ ${a.comments || 0} comments</span>
              <button class="read-more" data-id="${a.id}">Read More →</button>
            </div>
          </div>
        </article>
      `).join("");
    }

    if (emptyState) {
      emptyState.style.display = list.length ? "none" : "block";
    }

    document.querySelectorAll(".read-more").forEach(btn => {
      btn.addEventListener("click", () => openArticle(Number(btn.dataset.id)));
    });
  }

  function renderSidebar() {
    const counts = getCategoryCounts();
    const categoryListEl = document.getElementById("categoryList");
    if (categoryListEl) {
      categoryListEl.innerHTML = Object.entries(counts).map(([name, count]) => `
        <div class="category-row" data-category="${escapeHtml(name)}">
          <span class="cat-icon">${categoryIcons[name] || '▥'}</span>
          <span>${escapeHtml(name)}</span>
          <span class="count">${count}</span>
          <span class="arrow">›</span>
        </div>
      `).join("");

      document.querySelectorAll(".category-row").forEach(row => {
        row.addEventListener("click", () => {
          const category = row.dataset.category;
          switchTab(category);
        });
      });
    }

    const latestNewsEl = document.getElementById("latestNews");
    if (latestNewsEl) {
      latestNewsEl.innerHTML = articles.slice(0, 5).map(a => `
        <div class="latest-item" data-id="${a.id}" title="Read: ${escapeHtml(a.title)}">
          <img src="${a.image || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=300&q=80'}" alt="">
          <div>
            <h4>${escapeHtml(a.title)}</h4>
            <time>${a.date} • <b style="color:#085ab3">${a.category}</b></time>
          </div>
          <span class="arrow">›</span>
        </div>
      `).join("");

      document.querySelectorAll(".latest-item").forEach(row => {
        row.addEventListener("click", () => openArticle(Number(row.dataset.id)));
      });
    }
  }

  function switchTab(category) {
    document.querySelectorAll(".tab").forEach(t => {
      const match = (t.dataset.category || "").toLowerCase() === (category || "").toLowerCase();
      t.classList.toggle("active", match);
    });
    renderArticles(category);
    const newsSection = document.getElementById("news");
    if (newsSection) {
      newsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function openArticle(id) {
    const a = articles.find(x => x.id === id);
    if (!a) return;

    const modalImage = document.getElementById("modalImage");
    if (modalImage) {
      modalImage.className = "modal-image";
      modalImage.style.backgroundImage = `url('${a.image || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=85'}')`;
    }
    const modalCat = document.getElementById("modalCategory");
    if (modalCat) modalCat.textContent = (a.category || "NEWS").toUpperCase();

    const modalTitle = document.getElementById("modalTitle");
    if (modalTitle) modalTitle.textContent = a.title;

    const modalMeta = document.getElementById("modalMeta");
    if (modalMeta) modalMeta.textContent = `${a.date} • ${a.comments || 0} comments • St. Matthew's Parish, Amawbia`;

    const modalText = document.getElementById("modalText");
    if (modalText) modalText.textContent = a.text;

    const articleModal = document.getElementById("articleModal");
    if (articleModal) articleModal.classList.add("open");
  }

  const closeArticleBtn = document.getElementById("closeArticle");
  const articleModal = document.getElementById("articleModal");
  if (closeArticleBtn && articleModal) {
    closeArticleBtn.onclick = () => articleModal.classList.remove("open");
    articleModal.addEventListener("click", e => {
      if (e.target === articleModal) articleModal.classList.remove("open");
    });
  }

  // Category tab clicks
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      renderArticles(tab.dataset.category);
    });
  });

  // Search Overlay
  const overlay = document.getElementById("searchOverlay");
  const openSearchBtn = document.getElementById("openSearch");
  const closeSearchBtn = document.getElementById("closeSearch");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  if (openSearchBtn && overlay && searchInput) {
    openSearchBtn.onclick = () => {
      overlay.classList.add("open");
      searchInput.focus();
    };
  }
  if (closeSearchBtn && overlay) {
    closeSearchBtn.onclick = () => overlay.classList.remove("open");
  }
  if (overlay) {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  }

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", e => {
      const q = e.target.value.trim().toLowerCase();
      const result = articles.filter(a => `${a.title} ${a.category} ${a.text || ''}`.toLowerCase().includes(q)).slice(0, 8);
      searchResults.innerHTML = q
        ? result.map(a => `
            <a href="#" class="search-result" data-id="${a.id}">
              <strong>${escapeHtml(a.title)}</strong><br>
              <small>${a.category} • ${a.date}</small>
            </a>`).join("") || "<p style='padding:12px;color:#7891ad'>No matching news found.</p>"
        : "";

      document.querySelectorAll(".search-result").forEach(r => {
        r.onclick = ev => {
          ev.preventDefault();
          if (overlay) overlay.classList.remove("open");
          openArticle(Number(r.dataset.id));
        };
      });
    });
  }

  // Mobile menu toggle
  const mobileMenu = document.getElementById("mobileMenu");
  const nav = document.getElementById("nav");
  if (mobileMenu && nav) {
    mobileMenu.onclick = () => nav.classList.toggle("open");
  }

  // Check URL query parameters for direct entry linking
  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("article");
    const categoryParam = params.get("category");
    const searchParam = params.get("search");

    if (categoryParam) {
      switchTab(categoryParam);
    } else {
      renderArticles();
    }

    if (articleId) {
      const idNum = parseInt(articleId, 10);
      if (idNum) {
        setTimeout(() => openArticle(idNum), 150);
      }
    }

    if (searchParam && searchInput) {
      searchInput.value = searchParam;
      renderArticles("All News", searchParam);
    }
  }

  function escapeHtml(str) {
    return String(str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // Initial render
  renderSidebar();
  checkUrlParams();

  // Listen for storage changes from Admin
  window.addEventListener("casan_data_change", e => {
    if (e.detail && e.detail.key === "casan_news") {
      articles = CasanDB.getNews();
      renderArticles();
      renderSidebar();
    }
  });
})();
