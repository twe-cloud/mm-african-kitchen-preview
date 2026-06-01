const siteNav = document.querySelector("[data-site-nav]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menuFilters = document.querySelectorAll("[data-filter]");
const menuCards = document.querySelectorAll("[data-category]");
const cateringForm = document.querySelector("[data-catering-form]");
const formResult = document.querySelector("[data-form-result]");
const performerForm = document.querySelector("[data-performer-form]");
const performerResult = document.querySelector("[data-performer-result]");
const visitMap = document.querySelector("[data-visit-map]");
const rewardsGate = document.querySelector("[data-rewards-gate]");
const rewardsForm = document.querySelector("[data-rewards-form]");
const rewardsContent = document.querySelector("[data-rewards-content]");
const rewardsResult = document.querySelector("[data-rewards-result]");
const restaurantPhone = "+19453270366";

function showCallPrompt(resultElement, message) {
  if (!resultElement) return;
  resultElement.textContent = "";
  const span = document.createElement("span");
  span.textContent = message;
  const link = document.createElement("a");
  link.href = `tel:${restaurantPhone}`;
  link.textContent = " Call M&M.";
  resultElement.append(span, link);
}

menuToggle?.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

menuFilters.forEach((filterButton) => {
  filterButton.addEventListener("click", () => {
    const filter = filterButton.dataset.filter;
    menuFilters.forEach((item) => item.classList.toggle("is-active", item === filterButton));
    menuCards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      card.classList.toggle("is-hidden", filter !== "all" && !categories.includes(filter));
    });
  });
});

cateringForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(cateringForm);
  const date = data.get("date");
  const headcount = data.get("headcount");
  const interest = data.get("interest");
  showCallPrompt(formResult, `Ready: mention ${headcount} guests, ${interest}, ${date}.`);
});

performerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(performerForm);
  const name = data.get("name");
  const type = data.get("type");
  const date = data.get("date") || "date flexible";
  showCallPrompt(performerResult, `Ready, ${name}: ask about a ${type} set for ${date}.`);
});

/* ── Rewards email gate ── */
(function initRewardsGate() {
  if (!rewardsGate || !rewardsContent) return;
  const enrolled = localStorage.getItem("mm_rewards_email");
  if (enrolled) {
    rewardsGate.classList.add("is-enrolled");
    rewardsContent.hidden = false;
    return;
  }
  rewardsForm?.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = rewardsForm.elements.email.value.trim();
    if (!email) return;
    const body = new URLSearchParams(new FormData(rewardsForm)).toString();
    fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body })
      .then(function () {
        localStorage.setItem("mm_rewards_email", email);
        rewardsGate.classList.add("is-enrolled");
        rewardsContent.hidden = false;
      })
      .catch(function () {
        if (rewardsResult) rewardsResult.textContent = "Something went wrong. Try again or call M&M.";
      });
  });
})();

if (visitMap && window.L) {
  const restaurantCoordinates = [33.1799294, -96.8669398];
  const map = L.map(visitMap, {
    center: restaurantCoordinates,
    zoom: 16,
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false,
  });

  L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  }).addTo(map);

  L.marker(restaurantCoordinates, {
    icon: L.divIcon({
      className: "mm-map-marker",
      html: '<img src="assets/brand/mm-logo.png" width="88" height="80" alt="" />',
      iconSize: [88, 80],
      iconAnchor: [44, 80],
    }),
  }).addTo(map);

  window.setTimeout(() => map.invalidateSize(), 150);
}
