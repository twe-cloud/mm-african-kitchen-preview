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

function closeSiteNav() {
  if (!siteNav?.classList.contains("open")) return;
  siteNav.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
}

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeSiteNav);
});

/* Tap/click anywhere off the open menu collapses it back to the toggle. */
document.addEventListener("pointerdown", (event) => {
  if (!siteNav?.classList.contains("open")) return;
  if (siteNav.contains(event.target) || menuToggle?.contains(event.target)) return;
  closeSiteNav();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSiteNav();
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

const inboxEmail = "support@mmafricankitchen.com";

function sendFormByEmail(subject, lines, resultElement, readyMessage) {
  const body = encodeURIComponent(lines.filter(Boolean).join("\n"));
  window.location.href = `mailto:${inboxEmail}?subject=${encodeURIComponent(subject)}&body=${body}`;
  showCallPrompt(resultElement, `${readyMessage} If your email app didn't open,`);
}

cateringForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(cateringForm);
  sendFormByEmail(
    `[Catering] ${data.get("headcount")} guests — ${data.get("date")}`,
    [
      "New catering inquiry from mmafricankitchen.com:",
      "",
      `Event date: ${data.get("date")}`,
      `Guests: ${data.get("headcount")}`,
      `Interest: ${data.get("interest")}`,
      data.get("description") ? `Details: ${data.get("description")}` : "",
    ],
    formResult,
    `Catering request ready for ${data.get("headcount")} guests, ${data.get("date")}.`
  );
});

performerForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(performerForm);
  sendFormByEmail(
    `[Performers] ${data.get("type")} — ${data.get("name")}`,
    [
      "New performer pitch from mmafricankitchen.com:",
      "",
      `Act: ${data.get("name")}`,
      `Type: ${data.get("type")}`,
      `Date: ${data.get("date") || "flexible"}`,
      data.get("link") ? `Link: ${data.get("link")}` : "",
      data.get("notes") ? `Notes: ${data.get("notes")}` : "",
      data.get("description") ? `Description: ${data.get("description")}` : "",
    ],
    performerResult,
    `Pitch ready, ${data.get("name")}.`
  );
});

/* ── Footer brand sting: play once when it scrolls into view ── */
(function initBrandSting() {
  const sting = document.querySelector("[data-brand-sting]");
  if (!sting) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  function check() {
    const r = sting.getBoundingClientRect();
    if (r.top < window.innerHeight - 120 && r.bottom > 0) {
      sting.play().then(() => {
        window.removeEventListener("scroll", check);
      }).catch(() => { /* autoplay blocked — retry on next scroll */ });
    }
  }
  window.addEventListener("scroll", check, { passive: true });
  check();
  sting.addEventListener("click", () => {
    sting.currentTime = 0;
    sting.play().catch(() => {});
  });
})();

/* ── Table reservations ── */
(function initReservations() {
  const form = document.querySelector("[data-reserve-form]");
  if (!form) return;

  const timeSelect = form.querySelector("[data-reserve-time]");
  const summary = document.querySelector("[data-reserve-summary]");
  const note = document.querySelector("[data-reserve-result]");
  const noteDefault = note.textContent;
  const dateInput = form.elements.date;

  // Opening hours by weekday (0 = Sunday). null = closed.
  const hours = [
    { open: 13, close: 18 }, // Sun
    null,                    // Mon closed
    { open: 12, close: 21 }, // Tue
    { open: 12, close: 21 }, // Wed
    { open: 12, close: 22 }, // Thu
    { open: 12, close: 24 }, // Fri
    { open: 12, close: 22 }, // Sat
  ];

  const today = new Date();
  dateInput.min = today.toISOString().slice(0, 10);

  function formatSlot(hour, half) {
    const h12 = ((hour + 11) % 12) + 1;
    return `${h12}:${half ? "30" : "00"} ${hour >= 12 && hour < 24 ? "PM" : "AM"}`;
  }

  function buildSlots(day) {
    timeSelect.innerHTML = "";
    const win = hours[day];
    if (!win) return;
    const placeholder = new Option("Pick a time", "", true, true);
    placeholder.disabled = true;
    timeSelect.add(placeholder);
    // Last seating one hour before close.
    for (let h = win.open; h <= win.close - 1; h++) {
      timeSelect.add(new Option(formatSlot(h, false), formatSlot(h, false)));
      if (h < win.close - 1) timeSelect.add(new Option(formatSlot(h, true), formatSlot(h, true)));
    }
  }

  function selectedDay() {
    if (!dateInput.value) return null;
    return new Date(`${dateInput.value}T12:00:00`).getDay();
  }

  function setError(message) {
    note.textContent = message;
    note.classList.add("is-error");
  }

  function clearError() {
    if (!note.classList.contains("is-error")) return;
    note.textContent = noteDefault;
    note.classList.remove("is-error");
  }

  function prettyDate() {
    if (!dateInput.value) return "";
    return new Date(`${dateInput.value}T12:00:00`).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });
  }

  function updateSummary() {
    const party = form.elements.party.value;
    const time = form.elements.time.value;
    const occasion = form.elements.occasion.value;
    if (party && dateInput.value && time) {
      summary.textContent = `Table for ${party} · ${prettyDate()} · ${time} · ${occasion}`;
      summary.classList.add("is-live");
    } else {
      summary.textContent = "Table for — · pick a date and time";
      summary.classList.remove("is-live");
    }
  }

  dateInput.addEventListener("change", () => {
    const day = selectedDay();
    if (day === 1) {
      timeSelect.innerHTML = "";
      timeSelect.add(new Option("Closed Mondays", "", true, true));
      timeSelect.options[0].disabled = true;
      setError("M&M is closed on Mondays — pick another night and we'll hold the table.");
    } else {
      clearError();
      buildSlots(day);
    }
    updateSummary();
  });

  form.addEventListener("input", updateSummary);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (selectedDay() === 1) {
      setError("M&M is closed on Mondays — pick another night and we'll hold the table.");
      return;
    }
    const data = new FormData(form);
    const party = data.get("party");
    const when = `${prettyDate()} at ${data.get("time")}`;
    const subject = encodeURIComponent(`[Reservations] Table for ${party} — ${when}`);
    const body = encodeURIComponent(
      [
        "New table reservation request from mmafricankitchen.com:",
        "",
        `Name: ${data.get("name")}`,
        `Phone: ${data.get("phone")}`,
        `Party size: ${party}`,
        `Date: ${prettyDate()}`,
        `Time: ${data.get("time")}`,
        `Occasion: ${data.get("occasion")}`,
        "",
        "Please reply or call to confirm this reservation.",
      ].join("\n")
    );
    window.location.href = `mailto:support@mmafricankitchen.com?subject=${subject}&body=${body}`;
    note.classList.remove("is-error");
    note.textContent = "";
    const sent = document.createElement("span");
    sent.textContent = `Request ready to send for ${when}. If your email app didn't open, `;
    const call = document.createElement("a");
    call.href = `tel:${restaurantPhone}`;
    call.textContent = "call M&M to book it.";
    note.append(sent, call);
  });
})();

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
    // Static site: deliver the signup to the M&M inbox via the visitor's mail app,
    // then unlock the tiers locally.
    const subject = encodeURIComponent("[Rewards] New M&M Rewards signup");
    const body = encodeURIComponent(
      `New M&M Rewards signup from mmafricankitchen.com:\n\nEmail: ${email}\n\nAdd this guest to the rewards list.`
    );
    window.location.href = `mailto:${inboxEmail}?subject=${subject}&body=${body}`;
    localStorage.setItem("mm_rewards_email", email);
    rewardsGate.classList.add("is-enrolled");
    rewardsContent.hidden = false;
    if (rewardsResult) {
      showCallPrompt(rewardsResult, "You're in! If your email app didn't open, mention rewards at the counter or");
    }
  });
})();

/* ── Animated route map: keep it looping once it scrolls into view ── */
(function initRouteMap() {
  const route = document.querySelector("[data-route-map]");
  if (!route) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    route.removeAttribute("autoplay");
    return;
  }
  function nudge() {
    const r = route.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) route.play().catch(() => {});
  }
  window.addEventListener("scroll", nudge, { passive: true });
  nudge();
})();
