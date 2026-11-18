/* Aegis Stratos website. Renders the page from site.config.js and plays each film as its chapter scrolls into view. */
(() => {
  const S = window.SITE;
  const $ = (q, el = document) => el.querySelector(q);
  const h = (tag, attrs = {}, html = "") => { const e = document.createElement(tag); for (const k in attrs) e.setAttribute(k, attrs[k]); e.innerHTML = html; return e; };
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pad = n => String(n).padStart(2, "0");

  /* ---------- Render ---------- */
  $("#hero-kicker").textContent = S.hero.kicker;
  $("#hero-title").innerHTML = S.hero.title;
  $("#hero-sub").textContent = S.hero.sub;
  $("#hero-art").style.backgroundImage = `url(${S.hero.art})`;
  $("#footer-note").textContent = S.footer;

  const root = $("#chapters"), nav = $("#nav"), rail = $("#rail");
  const sections = []; // {id, el, film?}
  const words = t => t.split(" ").map(w => `<span>${w}</span>`).join(" ");
  let n = 0;

  const addNav = (id, label) => {
    nav.append(h("a", { href: "#" + id, "data-id": id }, label));
    rail.append(h("i", { "data-id": id }));
  };

  const filmChapter = (c) => {
    n++;
    const el = h("section", { id: c.id, class: "film-chapter" }, `
      <div class="pin">
        <div class="film-copy show">
          <div class="num">${pad(n)}</div>
          <p class="kicker">${c.kicker}</p>
          <h2>${c.title}</h2>
          ${c.sub ? `<p class="lede">${c.sub}</p>` : ""}
        </div>
        ${c.cta ? `<div class="film-cta"><p class="kicker">${c.kicker}</p><a class="btn gold" href="#contact" data-enquiry="${c.cta.enquiry}">${c.cta.label}</a></div>` : ""}
      </div>`);
    root.append(el);
    sections.push({ id: c.id, el, film: c.film, time: 0 });
  };

  const textChapter = (c, paras, cls = "") => {
    n++;
    const el = h("section", { id: c.id, class: "text-chapter" }, `
      <div class="head reveal"><div class="num">${pad(n)}</div><p class="kicker">${c.kicker}</p><h2>${c.title}</h2>${c.sub ? `<p class="lede">${c.sub}</p>` : ""}</div>
      ${paras.map((p, i) => `<p class="lit ${cls} ${i === paras.length - 1 ? "gold" : ""}">${words(p)}</p>`).join("")}`);
    root.append(el);
    sections.push({ id: c.id, el });
  };

  S.chapters.forEach(c => { if (!c.film && !c.lines) return; addNav(c.id, c.nav); c.film ? filmChapter(c) : textChapter(c, c.lines); });

  // Products
  {
    const P = S.products; n++;
    addNav(P.id, P.nav);
    const el = h("section", { id: P.id }, `
      <div class="head reveal"><div class="num">${pad(n)}</div><p class="kicker">${P.kicker}</p><h2>${P.title}</h2><p class="lede">${P.sub}</p></div>
      <div class="track">${P.items.map((it, i) => `
        <${it.film ? "button" : "article"} class="card" ${it.film ? `data-film="${i}" aria-label="Play the ${it.name} film"` : ""}>
          <div class="img"><img src="${it.img}" alt="${it.name} concept illustration" loading="lazy"></div>
          ${it.film ? `<span class="play"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 4l14 8-14 8z" fill="currentColor"/></svg></span>` : ""}
          <div class="txt"><p class="kicker">${it.role}</p>${it.status ? `<span class="status">${it.status}</span>` : ""}<h3>${it.name}</h3><p>${it.line}</p></div>
        </${it.film ? "button" : "article"}>`).join("")}
      </div>
      <p class="note">${P.note}</p>`);
    root.append(el);
    sections.push({ id: P.id, el });
  }

  // Founders: optional film first, then the story
  {
    const F = S.founders;
    addNav(F.id, F.nav);
    if (F.film) { filmChapter({ ...F, id: F.id, sub: "" }); n--; textChapter({ ...F, id: F.id + "-text" }, F.paragraphs, "story"); }
    else textChapter(F, F.paragraphs, "story");
  }

  // Contact
  {
    const C = S.contact; n++;
    addNav(C.id, C.nav);
    const el = h("section", { id: C.id }, `
      <div class="head reveal"><div class="num">${pad(n)}</div><p class="kicker">${C.kicker}</p><h2>${C.title}</h2><p class="lede">${C.sub}</p></div>
      <form id="contact-form" class="reveal" novalidate>
        <label>Enquiry <select name="enquiry">${C.enquiries.map(e => `<option>${e}</option>`).join("")}</select></label>
        <label>Name <input name="name" required autocomplete="name"></label>
        <label>Email <input type="email" name="email" required autocomplete="email"></label>
        <label>Message <textarea name="message" required rows="5"></textarea></label>
        <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">
        <div id="status" role="status" aria-live="polite"></div>
        <button class="btn gold" type="submit">Send message</button>
      </form>`);
    root.append(el);
    sections.push({ id: C.id, el });
  }

  /* ---------- Film stage ---------- */
  const stage = $("#stage"), video = $("#film"), dim = $("#stage-dim"), controls = $("#controls");
  const soundBtn = $("#sound-btn"), soundLabel = $("#sound-label"), playBtn = $("#play-btn"), bar = $("#film-progress i");
  let soundOn = false, current = null, userPaused = false, heroMode = false, heroLeft = false;
  // Phones held upright get the portrait cut of a film when one exists
  const portraitMQ = matchMedia("(orientation: portrait) and (max-width: 820px)");
  const pick = f => (portraitMQ.matches && f.portrait) ? { src: f.portrait, poster: f.posterPortrait || f.poster, portrait: true } : { src: f.src, poster: f.poster, portrait: false };

  const setSound = on => {
    soundOn = on; video.muted = !on;
    soundBtn.setAttribute("aria-pressed", on);
    soundLabel.textContent = on ? "Sound on" : "Tap for sound";
    showCaption();
  };
  // Captions are drawn by the page (not the browser) so they sit clear of the film and the buttons. Shown when sound is off.
  const captionEl = $("#caption");
  const showCaption = () => {
    const t = video.textTracks[0], cue = t && t.activeCues && t.activeCues[0];
    captionEl.textContent = (!soundOn && current && cue && !heroMode) ? cue.text : "";
  };

  const play = () => {
    if (reduced && !current?.started) { controls.classList.add("paused"); return; } // reduced motion: wait for a tap
    video.muted = !soundOn;
    const p = video.play();
    if (p) p.then(() => { if (current) current.started = true; }).catch(() => {
      // Browser refused sound without a tap: carry on muted and ask for the tap
      if (soundOn) { setSound(false); video.play().catch(() => controls.classList.add("paused")); }
      else controls.classList.add("paused");
    });
  };

  const load = sec => {
    video.classList.add("swap");
    video.querySelectorAll("track").forEach(t => t.remove());
    const f = pick(sec.film);
    stage.classList.toggle("portrait", f.portrait);
    video.poster = f.poster || "";
    video.src = f.src;
    if (sec.film.captions) {
      const tr = h("track", { kind: "captions", srclang: "en", label: "English", src: sec.film.captions });
      video.append(tr); tr.track.mode = "hidden"; tr.track.addEventListener("cuechange", showCaption);
    }
    video.addEventListener("loadedmetadata", () => {
      if (sec.time && sec.time < video.duration - 1) video.currentTime = sec.time;
      setSound(soundOn);
      video.classList.remove("swap");
    }, { once: true });
  };

  const activate = sec => {
    if (current === sec) return;
    if (current) { current.time = video.currentTime; video.pause(); }
    current = sec; userPaused = false;
    if (!sec) { stage.classList.remove("on"); controls.classList.remove("on"); showCaption(); return; }
    load(sec); play();
    stage.classList.add("on"); controls.hidden = false; controls.classList.toggle("on", !heroMode);
  };
  portraitMQ.addEventListener("change", () => { if (current) { const s = current; s.time = video.currentTime; current = null; activate(s); } });
  video.addEventListener("playing", () => document.body.classList.add("film-live"));

  video.addEventListener("timeupdate", () => { if (video.duration) bar.style.width = (video.currentTime / video.duration * 100) + "%"; });
  video.addEventListener("play", () => controls.classList.remove("paused"));
  video.addEventListener("pause", () => { if (current) controls.classList.add("paused"); });
  video.addEventListener("ended", () => { if (current) current.time = 0; });
  playBtn.addEventListener("click", () => { userPaused = false; if (current) current.started = true; video.play(); });
  soundBtn.addEventListener("click", () => { setSound(!soundOn); store.set("aegis-sound", soundOn ? "1" : "0"); if (video.paused && current && !userPaused) play(); });
  // Tap the film area to pause or resume
  root.addEventListener("click", e => {
    if (!current || e.target.closest("a,button,input,textarea,select")) return;
    if (!e.target.closest(".film-chapter")) return;
    if (video.paused) { userPaused = false; video.play(); } else { userPaused = true; video.pause(); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) video.pause(); else if (current && !userPaused) play(); });

  /* ---------- Entry: one tap unlocks sound for every film ---------- */
  const firstFilm = sections.find(s => s.film);
  const enter = withSound => {
    setSound(withSound); store.set("aegis-sound", withSound ? "1" : "0");
    if (firstFilm) {
      // Start the first film from the top inside the tap, so it and every later film may play with sound (required on iPhone)
      if (current !== firstFilm) activate(firstFilm);
      firstFilm.time = 0; firstFilm.started = true; heroLeft = true;
      try { video.currentTime = 0; } catch {}
      video.muted = !withSound;
      const p = video.play(); if (p) p.catch(() => {});
    }
    (firstFilm || sections[0]).el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };
  $("#enter-sound").addEventListener("click", () => enter(true));
  $("#enter-muted").addEventListener("click", () => enter(false));

  /* ---------- Scroll engine ---------- */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lits = [...document.querySelectorAll(".lit")].map(el => ({ el, spans: [...el.children], lit: -1 }));
  const navLinks = [...nav.children], railDots = [...rail.children];
  let ticking = false;

  const frame = () => {
    ticking = false;
    const vh = innerHeight, mid = vh / 2;
    let active = null, activeId = null;
    // Hero: the first film plays silently behind the opening headline
    const heroR = $("#hero").getBoundingClientRect();
    const heroNow = innerWidth > 820 && !reduced && !!firstFilm && sections[0] === firstFilm && heroR.bottom > vh * 0.55;
    if (heroNow !== heroMode) {
      heroMode = heroNow; showCaption();
      if (!heroMode && !heroLeft) { heroLeft = true; if (!soundOn) { try { video.currentTime = 0; } catch {} } } // first arrival at chapter one: start from the top
      controls.classList.toggle("on", !!current && !heroMode);
    }
    // On wide screens the film sits in a window beside the headline and grows to full screen as you scroll
    const hp = heroMode ? clamp(-heroR.top / (heroR.height * 0.45)) : 1, e = hp * hp * (3 - 2 * hp);
    $("#hero").style.setProperty("--hp", heroMode || heroR.bottom > 0 ? hp : 0);
    video.style.setProperty("--fs", 0.44 + 0.56 * e);
    video.style.setProperty("--fx", (1 - e) * 25 + "vw");
    video.style.setProperty("--fy", (1 - e) * 3 + "vh");
    if (heroMode) { active = firstFilm; dim.style.opacity = 0; }

    for (const s of sections) {
      const r = s.el.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) activeId = s.id.replace("-text", "");
      if (!s.film) continue;
      const p = clamp(-r.top / (r.height - vh));
      const inside = r.top < vh * 0.45 && r.bottom > vh * 0.55;
      if (inside) active = s;
      // Title holds, then clears so the film can be watched; the call to action arrives near the end
      const wide = innerWidth > 820 || stage.classList.contains("portrait");
      const copy = wide ? 1 - clamp((p - 0.1) / 0.18) : 1 - clamp((p - 0.55) / 0.2);
      const cta = clamp((p - 0.78) / 0.12);
      s.el.style.setProperty("--copy", copy);
      s.el.style.setProperty("--cta", cta);
      $(".film-copy", s.el).classList.toggle("show", copy > 0.5);
      $(".film-cta", s.el)?.classList.toggle("show", cta > 0.5);
      if (inside && !heroMode) { dim.style.opacity = wide ? copy * 0.9 : 0; captionEl.style.opacity = wide ? 1 - copy : 1; } // captions wait until the title has cleared
    }
    activate(active);
    controls.classList.toggle("on", !!current && !heroMode);

    for (const l of lits) {
      const r = l.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.32));
      const count = Math.round(p * l.spans.length);
      if (count !== l.lit) { l.spans.forEach((sp, i) => sp.classList.toggle("on", i < count)); l.lit = count; }
    }

    navLinks.forEach(a => a.classList.toggle("active", a.dataset.id === activeId));
    railDots.forEach(d => d.classList.toggle("active", d.dataset.id === activeId));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---------- Navigation ---------- */
  const menuBtn = $("#menu-btn");
  menuBtn.addEventListener("click", () => { const o = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", o); menuBtn.textContent = o ? "Close" : "Menu"; });
  nav.addEventListener("click", e => { if (e.target.tagName === "A") { nav.classList.remove("open"); menuBtn.textContent = "Menu"; menuBtn.setAttribute("aria-expanded", false); } });
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-enquiry]");
    if (a) $("#contact-form select").value = a.dataset.enquiry;
  });

  /* ---------- Product films (switched on per product in site.config.js) ---------- */
  const dlg = $("#player"), pv = $("#player-video");
  root.addEventListener("click", e => {
    const card = e.target.closest("[data-film]"); if (!card) return;
    const f = S.products.items[card.dataset.film].film;
    pv.src = f.src; pv.poster = f.poster || ""; dlg.showModal(); pv.play();
  });
  const closePlayer = () => { pv.pause(); pv.removeAttribute("src"); pv.load(); dlg.close(); };
  $("#player-close").addEventListener("click", closePlayer);
  dlg.addEventListener("cancel", e => { e.preventDefault(); closePlayer(); });

  /* ---------- Contact form (same Formspree endpoint as the current site) ---------- */
  const form = $("#contact-form"), statusEl = $("#status");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!form.checkValidity()) { statusEl.textContent = "Please complete your name, email and message."; form.reportValidity(); return; }
    statusEl.textContent = "Sending.";
    const fd = new FormData(form);
    fd.append("_subject", fd.get("enquiry") + " via website");
    try {
      const res = await fetch(S.contactEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("send failed");
      statusEl.textContent = "Thank you. Your message has been sent and we will reply within two working days.";
      form.reset();
    } catch { statusEl.textContent = "Sorry, something went wrong. Please try again."; }
  });

  /* ---------- Cookies ---------- */
  const loadAnalytics = () => {
    const A = S.analytics || {};
    if (!A.cloudflareToken || document.getElementById("cf-analytics")) return;
    const sc = h("script", { id: "cf-analytics", defer: "", src: "https://static.cloudflareinsights.com/beacon.min.js", "data-cf-beacon": JSON.stringify({ token: A.cloudflareToken }) });
    document.head.append(sc);
  };
  window.addEventListener("aegis-consent-all", loadAnalytics);
  if (S.analytics && !S.analytics.requireConsent) loadAnalytics();
  const banner = $("#cookies");
  const consent = v => { store.set("aegis-consent", v); banner.hidden = true; if (v === "all") window.dispatchEvent(new Event("aegis-consent-all")); /* load analytics here, only after consent */ };
  if (!store.get("aegis-consent")) banner.hidden = false; else if (store.get("aegis-consent") === "all") window.dispatchEvent(new Event("aegis-consent-all"));
  $("#cookies-essential").addEventListener("click", () => consent("essential"));
  $("#cookies-all").addEventListener("click", () => consent("all"));
  $("#cookie-settings").addEventListener("click", e => { e.preventDefault(); banner.hidden = false; });

  frame();
})();
