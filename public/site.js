// Vitality Family Chiropractic — small, dependency-free site script.
(() => {
  const d = document, root = d.documentElement;
  root.classList.add("js");

  // Header shadow once the page scrolls
  const header = d.querySelector("[data-header]");
  const onScroll = () => header && header.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Mobile menu
  const menuBtn = d.querySelector("[data-menu]"), drawer = d.querySelector("[data-drawer]");
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", open); drawer.hidden = !open;
    d.body.style.overflow = open ? "hidden" : "";
  };
  menuBtn && menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
  const closeSwitchers = (except) => {
    d.querySelectorAll("details[data-switcher]").forEach((el) => { if (el !== except) el.open = false; });
  };
  d.addEventListener("click", (e) => closeSwitchers(e.target.closest("details[data-switcher]")));
  d.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeSwitchers(null);
    if (menuBtn && menuBtn.getAttribute("aria-expanded") === "true") { setMenu(false); menuBtn.focus(); }
    d.querySelectorAll(".sub.open").forEach((s) => { s.classList.remove("open"); s.closest(".has-sub").querySelector(".sub-toggle").setAttribute("aria-expanded", "false"); });
  });

  // Dropdown toggles (desktop + mobile)
  d.querySelectorAll(".sub-toggle").forEach((btn) => btn.addEventListener("click", () => {
    const sub = btn.closest(".has-sub").querySelector(".sub");
    const open = btn.getAttribute("aria-expanded") !== "true";
    btn.closest(".nav").querySelectorAll(".sub-toggle").forEach((b) => {
      if (b !== btn) { b.setAttribute("aria-expanded", "false"); b.closest(".has-sub").querySelector(".sub").classList.remove("open"); }
    });
    btn.setAttribute("aria-expanded", open); sub.classList.toggle("open", open);
  }));
  d.addEventListener("click", (e) => {
    if (e.target.closest(".primary .has-sub")) return;
    d.querySelectorAll(".primary .sub.open").forEach((s) => { s.classList.remove("open"); s.closest(".has-sub").querySelector(".sub-toggle").setAttribute("aria-expanded", "false"); });
  });

  // Gentle reveal on scroll
  const els = d.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  } else els.forEach((el) => el.classList.add("in"));

  // Mobile call bar appears after the welcome section
  const bar = d.querySelector("[data-mbar]"), hero = d.querySelector(".hero, .pg-intro, .tm-hero, .pr-hero");
  if (bar && hero && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => bar.classList.toggle("show", !en.isIntersecting && en.boundingClientRect.top < 0)).observe(hero);
  }

  // Tabs (Pricing & Insurance family sizes). All panels are in the HTML; this only
  // switches which one shows. Arrow keys, Home and End move between tabs.
  d.querySelectorAll("[data-tabs]").forEach((box) => {
    const tabs = [...box.querySelectorAll('[role="tab"]')];
    const show = (t, focus) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1;
        d.getElementById(x.getAttribute("aria-controls")).hidden = !on;
      });
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => show(t));
      t.addEventListener("keydown", (e) => {
        const k = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (k === undefined) return;
        e.preventDefault(); show(tabs[(k + tabs.length) % tabs.length], true);
      });
    });
    box.classList.add("tabs-ready");
    show(tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0]);
  });

  // Partner business card: share the page (phone share sheet) or copy its link.
  d.querySelectorAll("[data-share]").forEach((btn) => btn.addEventListener("click", async () => {
    const url = location.href.replace(/index\.html$/, "");
    try {
      if (navigator.share) await navigator.share({ title: d.title, url });
      else { await navigator.clipboard.writeText(url); const t = btn.textContent; btn.textContent = btn.dataset.copied; setTimeout(() => (btn.textContent = t), 2000); }
    } catch (e) { /* share sheet closed */ }
  }));

  // Upcoming events, read from this office's calendar on each visit.
  const eventCard = (event, index) => {
    const card = d.createElement("article");
    card.className = "ev-card";
    card.setAttribute("data-end", event.end);
    const date = d.createElement("p");
    date.className = "ev-date";
    const time = d.createElement("time");
    time.dateTime = event.start;
    time.textContent = event.dateLabel || "";
    date.append(time);
    const title = d.createElement("h3");
    title.id = event.id || `event-${index + 1}`;
    title.textContent = event.title || "Untitled event";
    card.setAttribute("aria-labelledby", title.id);
    const when = d.createElement("p");
    when.className = "ev-time";
    when.textContent = event.timeLabel || "";
    card.append(date, title, when);
    if (event.description) {
      const desc = d.createElement("p");
      desc.className = "ev-desc";
      desc.textContent = event.description;
      card.append(desc);
    }
    return card;
  };
  const mountCarousel = (root, track) => {
    const prev = root.querySelector("[data-ev-prev]");
    const next = root.querySelector("[data-ev-next]");
    const motion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = () => {
      const card = track.querySelector(".ev-card");
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return (card ? card.getBoundingClientRect().width : track.clientWidth) + gap;
    };
    const scrollByCard = (direction) => track.scrollBy({ left: direction * step(), behavior: motion ? "auto" : "smooth" });
    prev && prev.addEventListener("click", () => scrollByCard(-1));
    next && next.addEventListener("click", () => scrollByCard(1));
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); scrollByCard(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); scrollByCard(-1); }
    });
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const bar = root.querySelector(".ev-bar");
      if (bar) bar.hidden = max <= 4;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max - 2;
    };
    track.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    update();
  };
  d.querySelectorAll("[data-events]").forEach((root) => {
    const office = root.getAttribute("data-office");
    const days = root.getAttribute("data-days");
    const stage = root.querySelector(".ev-stage");
    const track = root.querySelector(".ev-track");
    const empty = root.querySelector(".ev-empty");
    const showEmpty = (message) => {
      root.setAttribute("aria-busy", "false");
      if (stage) stage.hidden = true;
      if (!empty) return;
      if (message) empty.textContent = message;
      empty.hidden = false;
    };
    if (!office || !days || !track) {
      showEmpty("The calendar could not be loaded. Please refresh the page.");
      return;
    }
    const params = new URLSearchParams({ office, days });
    fetch(`/api/events?${params}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((events) => {
        if (!Array.isArray(events)) throw new Error("bad payload");
        const now = Date.now();
        track.replaceChildren();
        events.forEach((event, index) => {
          const end = Date.parse(event.end);
          if (Number.isFinite(end) && end <= now) return;
          track.append(eventCard(event, index));
        });
        root.setAttribute("aria-busy", "false");
        if (!track.children.length) {
          showEmpty("");
          return;
        }
        if (stage) stage.hidden = false;
        if (empty) empty.hidden = true;
        mountCarousel(root, track);
      })
      .catch(() => showEmpty("The calendar could not be loaded. Please refresh the page."));
  });

  // ---------- Preview-only behaviour ----------
  if (!d.body.classList.contains("is-preview")) return;
  d.body.classList.add("show-flags");
  const toast = d.querySelector("[data-toast]");
  let t;
  const say = (html) => { toast.innerHTML = html; toast.hidden = false; clearTimeout(t); t = setTimeout(() => (toast.hidden = true), 4200); };
  d.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-pending], a[data-unverified]");
    if (!a) return;
    e.preventDefault();
    if (a.dataset.pending) say(`<b>${a.dataset.pending}</b> page comes next, once its approved copy is supplied.`);
    else say(`<b>Would call ${a.getAttribute("href").replace("tel:+1", "").replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}</b><br>Number came from an earlier draft and still needs verification.`);
  });
  const tg = d.querySelector(".pv-toggle");
  tg && tg.addEventListener("click", () => {
    const on = d.body.classList.toggle("show-flags");
    tg.setAttribute("aria-pressed", on); tg.textContent = on ? "Hide verification tags" : "Show verification tags";
  });
})();
