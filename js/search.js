function buildSearchIndex() {
  const data = window.airbnbSwiperData || [];
  const records = [];

  data.forEach((section, sectionIndex) => {
    records.push({
      type: "section",
      sectionIndex,
      cardIndex: null,
      title: section.title,
      subtitle: "Section"
    });

    section.cards.forEach((card, cardIndex) => {
      const place = card.title.includes(" in ") ? card.title.split(" in ").pop() : "";
      records.push({
        type: "card",
        sectionIndex,
        cardIndex,
        title: card.title,
        subtitle: place || section.title
      });
    });
  });

  return records;
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sortMatches(matches, term) {
  return matches.sort((a, b) => {
    const aTitle = normalize(a.title);
    const bTitle = normalize(b.title);

    const aStarts = aTitle.startsWith(term) ? 1 : 0;
    const bStarts = bTitle.startsWith(term) ? 1 : 0;
    if (aStarts !== bStarts) return bStarts - aStarts;

    if (a.type !== b.type) return a.type === "section" ? -1 : 1;

    return aTitle.localeCompare(bTitle);
  });
}

function getMatches(records, term) {
  const q = normalize(term);
  if (!q) return [];

  const matches = records.filter((record) => {
    return normalize(record.title).includes(q) || normalize(record.subtitle).includes(q);
  });

  return sortMatches(matches, q).slice(0, 10);
}

function jumpToCard(sectionIndex, cardIndex) {
  const section = document.querySelector(`.listing-swiper[data-swiper-index="${sectionIndex}"]`);
  const card = document.querySelector(`.listing-card[data-section-index="${sectionIndex}"][data-card-index="${cardIndex}"]`);
  if (!section || !card) return null;

  section.scrollIntoView({ behavior: "smooth", block: "center" });
  return card;
}

function jumpToSection(sectionIndex) {
  const section = document.querySelector(`.listing-swiper[data-swiper-index="${sectionIndex}"]`);
  if (!section) return null;

  section.scrollIntoView({ behavior: "smooth", block: "center" });
  return section;
}

function createResultMarkup(record, itemClass) {
  return `
    <button
      class="${itemClass}"
      data-type="${record.type}"
      data-section-index="${record.sectionIndex}"
      data-card-index="${record.cardIndex ?? ""}"
      data-title="${escapeHtml(record.title)}"
      type="button"
    >
      <span class="compact-result-main">${escapeHtml(record.title)}</span>
      <span class="compact-result-sub">${escapeHtml(record.subtitle)}</span>
    </button>
  `;
}

function wireSearchWidget(config, records) {
  const root = document.querySelector(config.rootSelector);
  const input = document.querySelector(config.inputSelector);
  const panel = document.querySelector(config.panelSelector);

  if (!root || !input || !panel) return;

  let activeElement = null;
  let activeType = null;

  const clearActiveSelection = () => {
    if (!activeElement) return;
    if (activeType === "section") {
      activeElement.classList.remove("search-section-selected");
    } else {
      activeElement.classList.remove("search-selected");
    }
    activeElement = null;
    activeType = null;
  };

  const hidePanel = () => {
    panel.classList.remove("show");
  };

  const render = () => {
    const term = input.value;
    const matches = getMatches(records, term);

    if (!normalize(term)) {
      panel.innerHTML = "";
      hidePanel();
      clearActiveSelection();
      return;
    }

    if (!matches.length) {
      panel.innerHTML = `<div class="${config.emptyClass}">No matches found</div>`;
      panel.classList.add("show");
      return;
    }

    panel.innerHTML = matches.map((record) => createResultMarkup(record, config.itemClass)).join("");
    panel.classList.add("show");
  };

  const applyResult = (el) => {
    if (!el) return;

    const type = el.dataset.type;
    const sectionIndex = el.dataset.sectionIndex;
    const cardIndex = el.dataset.cardIndex;
    input.value = el.dataset.title || "";
    hidePanel();

    clearActiveSelection();

    if (type === "section") {
      const sectionEl = jumpToSection(sectionIndex);
      if (sectionEl) {
        sectionEl.classList.add("search-section-selected");
        activeElement = sectionEl;
        activeType = "section";
      }
      return;
    }

    const cardEl = jumpToCard(sectionIndex, cardIndex);
    if (cardEl) {
      cardEl.classList.add("search-selected");
      activeElement = cardEl;
      activeType = "card";
    }
  };

  input.addEventListener("input", render);

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const first = panel.querySelector(`.${config.itemClass}`);
    if (!first) return;
    event.preventDefault();
    applyResult(first);
  });

  panel.addEventListener("click", (event) => {
    const btn = event.target.closest(`.${config.itemClass}`);
    if (!btn) return;
    applyResult(btn);
  });

  root.addEventListener("click", (event) => {
    if (event.target.closest(".search-btn")) return;
    input.focus();
  });

  document.addEventListener("click", (event) => {
    if (root.contains(event.target) || panel.contains(event.target)) return;
    hidePanel();
  });
}

function initSearch() {
  const records = buildSearchIndex();

  wireSearchWidget(
    {
      rootSelector: ".search-compact",
      inputSelector: ".compact-location-input",
      panelSelector: ".compact-search-results",
      itemClass: "compact-result-item",
      emptyClass: "compact-result-empty"
    },
    records
  );

  wireSearchWidget(
    {
      rootSelector: ".search-item",
      inputSelector: ".where-search-input",
      panelSelector: ".where-search-results",
      itemClass: "where-result-item",
      emptyClass: "where-result-empty"
    },
    records
  );

  wireSearchWidget(
    {
      rootSelector: ".mobile-search-pill",
      inputSelector: ".mobile-search-input",
      panelSelector: ".mobile-search-results",
      itemClass: "mobile-result-item",
      emptyClass: "mobile-result-empty"
    },
    records
  );
}

window.addEventListener("load", initSearch);
