const sectionTitles = [
  "Stay in Idukki",
  "Popular homes in Alappuzha",
  "Check out homes in Wayanad",
  "Available in Thrissur this weekend",
  "Homes in North Goa",
  "Places to stay in South Goa",
  "Popular homes in Bengaluru",
  "Available in Kozhikode this weekend",
  "Available in Thiruvananthapuram this weekend"
];

const locationLabels = [
  "Idukki",
  "Alappuzha",
  "Wayanad",
  "Thrissur",
  "North Goa",
  "South Goa",
  "Bengaluru",
  "Kozhikode",
  "Thiruvananthapuram"
];

function imagePath(index) {
  return `assets/images/img (${index}).jpeg`;
}

function buildSectionData() {
  const sections = [];
  let imageIndex = 1;

  sectionTitles.forEach((title, sectionIndex) => {
    const cards = [];

    for (let i = 0; i < 8; i += 1) {
      const stayType = i % 3 === 0 ? "Home" : (i % 3 === 1 ? "Room" : "Cottage");
      const price = (3800 + sectionIndex * 640 + i * 410).toLocaleString("en-IN");
      const rating = (4.72 + ((sectionIndex + i) % 7) * 0.04).toFixed(2);

      cards.push({
        title: `${stayType} in ${locationLabels[sectionIndex]}`,
        price,
        nights: "2",
        rating,
        image: imagePath(imageIndex),
        guestFavorite: (imageIndex % 3 !== 0)
      });

      imageIndex += 1;
    }

    sections.push({
      title,
      showSeeAll: true,
      cards
    });
  });

  return sections;
}

const swiperData = buildSectionData();

function createCard(card, sectionIndex, cardIndex) {
  const badgeHtml = card.guestFavorite ? '<span class="listing-badge">Guest favourite</span>' : "";

  return `
    <article class="listing-card" data-section-index="${sectionIndex}" data-card-index="${cardIndex}">
      <div class="listing-image-wrap">
        <img src="${card.image}" alt="${card.title}" class="listing-image" loading="lazy">
        ${badgeHtml}
        <button class="like-btn" aria-label="Save ${card.title}">&#9825;</button>
      </div>
      <h3 class="listing-title">${card.title}</h3>
      <p class="listing-meta">&#8377;${card.price} for ${card.nights} nights &#183; &#9733; ${card.rating}</p>
    </article>
  `;
}

function createSeeAllCard(section) {
  const previewImages = section.cards.slice(5, 8).map((card, idx) => {
    const classes = ["see-all-photo", `see-all-photo-${idx + 1}`].join(" ");
    return `<img src="${card.image}" alt="" class="${classes}" loading="lazy" aria-hidden="true">`;
  }).join("");

  return `
    <article class="see-all-card" role="button" tabindex="0" aria-label="See all stays in ${section.title}">
      <div class="see-all-stack" aria-hidden="true">
        ${previewImages}
      </div>
      <h3 class="see-all-text">See all</h3>
    </article>
  `;
}

function createSection(section, index) {
  const cardsHtml = section.cards.map((card, cardIndex) => createCard(card, index, cardIndex)).join("");
  const tailCard = section.showSeeAll ? createSeeAllCard(section) : "";

  return `
    <section class="listing-swiper" data-swiper-index="${index}">
      <div class="swiper-head">
        <h2 class="swiper-title">${section.title} <span class="title-arrow">&rarr;</span></h2>
        <div class="swiper-controls">
          <button class="swiper-btn swiper-prev" aria-label="Previous listings">&#8249;</button>
          <button class="swiper-btn swiper-next" aria-label="Next listings">&#8250;</button>
        </div>
      </div>
      <div class="swiper-viewport">
        <div class="swiper-track">
          ${cardsHtml}
          ${tailCard}
        </div>
      </div>
    </section>
  `;
}

function getStepWidth(track) {
  const firstCard = track.querySelector(".listing-card, .see-all-card");
  if (!firstCard) return 280;

  const cardWidth = firstCard.getBoundingClientRect().width;
  const computed = window.getComputedStyle(track);
  const gap = parseFloat(computed.columnGap || computed.gap || "0");
  return cardWidth + gap;
}

function bindSwiper(sectionEl) {
  const viewport = sectionEl.querySelector(".swiper-viewport");
  const track = sectionEl.querySelector(".swiper-track");
  const prevBtn = sectionEl.querySelector(".swiper-prev");
  const nextBtn = sectionEl.querySelector(".swiper-next");

  if (!viewport || !track || !prevBtn || !nextBtn) return;

  const updateButtons = () => {
    const maxScroll = viewport.scrollWidth - viewport.clientWidth;
    prevBtn.disabled = viewport.scrollLeft <= 2;
    nextBtn.disabled = viewport.scrollLeft >= maxScroll - 2;
  };

  prevBtn.addEventListener("click", () => {
    viewport.scrollBy({ left: -getStepWidth(track) * 2, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    viewport.scrollBy({ left: getStepWidth(track) * 2, behavior: "smooth" });
  });

  viewport.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();
}

function initSwipers() {
  const root = document.querySelector("#swiper-sections");
  if (!root) return;

  root.innerHTML = swiperData.map(createSection).join("");
  root.querySelectorAll(".listing-swiper").forEach(bindSwiper);
}

window.airbnbSwiperData = swiperData;
initSwipers();
