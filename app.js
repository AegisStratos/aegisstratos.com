/* Aegis Stratos website. Renders the page from site.config.js and plays each film as its chapter scrolls into view. */
(() => {
  const S = window.SITE;
  const $ = (q, el = document) => el.querySelector(q);
  const h = (tag, attrs = {}, html = "") => { const e = document.createElement(tag); for (const k in attrs) e.setAttribute(k, attrs[k]); e.innerHTML = html; return e; };
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Phones held upright get the portrait cut of a film when one exists
  const portraitMQ = matchMedia("(orientation: portrait) and (max-width: 820px)");
  const pick = f => (portraitMQ.matches && f.portrait) ? { src: f.portrait, alt: f.portraitHevc, poster: f.posterPortrait || f.poster, portrait: true } : { src: f.src, poster: f.poster, portrait: false };
  // Native players list the standard file first and, where one exists, an Apple-encoded HEVC copy as a second choice
  const sources = k => `<source src="${k.src}" type="video/mp4">` + (k.alt ? `<source src="${k.alt}" type='video/mp4; codecs="hvc1"'>` : "");
  // Phones, tablets and every iPhone or iPad get a plain native video player inside each chapter.
  // It is the most dependable way to play film on those devices. Wide desktop screens use the full-screen stage.
  const ua = navigator.userAgent;
  const inlineMode = matchMedia("(max-width: 820px)").matches || /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) || /[?&]inline=1/.test(location.search);
  document.documentElement.classList.toggle("inline-films", inlineMode);
  const inlineVideos = [];
  const pad = n => String(n).padStart(2, "0");

  /* ---------- Render ---------- */
  $("#hero-kicker").textContent = S.hero.kicker;
  $("#hero-title").innerHTML = S.hero.title;
  $("#hero-sub").textContent = S.hero.sub;
  $("#hero-art").style.backgroundImage = `url(${S.hero.art})`;
  $("#footer-note").textContent = S.footer;

  const root = $("#chapters"), nav = $("#nav"), rail = $("#rail");
  const sections = []; // {id, el, film?}
  // Words light up one by one as the reader scrolls. [Square brackets] mark a phrase that lights in bold gold.
  const words = t => t.split(/(\[[^\]]+\])/).filter(Boolean).map(part => {
    const gold = part[0] === "[", txt = gold ? part.slice(1, -1) : part;
    return txt.trim().split(/\s+/).map(w => `<span${gold ? ' class="g"' : ""}>${w}</span>`).join(" ");
  }).join(" ");
  let n = 0;

  const addNav = (id, label) => {
    nav.append(h("a", { href: "#" + id, "data-id": id }, label));
    rail.append(h("i", { "data-id": id }));
  };

  // A film chapter is three parts, so nothing ever sits on top of a film:
  // a title screen on solid navy, a clear screen where the film plays alone, and a closing panel with the call to action.
  // The first film has no title screen: the hero is its title, and the hero film grows straight into it.
  const filmChapter = (c) => {
    n++;
    const first = sections.length === 0;
    const el = h("section", { id: c.id, class: "film-chapter" }, `
      ${first ? "" : `<div class="intro"><div class="film-copy reveal">
          <div class="num">${pad(n)}</div>
          <p class="kicker">${c.kicker}</p>
          <h2>${c.title}</h2>
          ${c.sub ? `<p class="lede">${c.sub}</p>` : ""}
        </div></div>`}
      <div class="screen"></div>
      ${c.cta ? `<div class="outro"><div class="reveal"><p class="kicker">${c.kicker}</p><h3>${c.cta.line || c.sub || ""}</h3><a class="btn gold" href="#contact" data-enquiry="${c.cta.enquiry}">${c.cta.label}</a></div></div>` : ""}`);
    root.append(el);
    const screen = $(".screen", el), sec = { id: c.id, el, screen, film: c.film, time: 0 };
    if (inlineMode) {
      const f = pick(c.film);
      screen.classList.add("inline");
      const v = h("video", { playsinline: "", "webkit-playsinline": "", muted: "", controls: "", preload: "metadata", poster: f.poster || "", style: `aspect-ratio:${f.portrait ? "9/16" : "16/9"}`, "aria-label": c.filmTitle || c.nav });
      v.muted = true;
      v.innerHTML = sources(f);
      if (c.film.captions) v.append(h("track", { kind: "captions", srclang: "en", label: "English", src: c.film.captions }));
      screen.append(v); sec.inline = v; inlineVideos.push(v);
      // If a phone cannot play the film in the page, say so and offer the film on its own
      const help = h("p", { class: "film-help", hidden: "" }, `<span></span> <a href="${f.src}">Open the film on its own</a>`);
      screen.append(help);
      const tell = msg => { help.hidden = false; help.firstElementChild.textContent = msg; };
      v.addEventListener("error", () => tell("This film could not be played here (code " + (v.error ? v.error.code : "?") + ")."));
      const last = v.querySelector("source:last-of-type"); if (last) last.addEventListener("error", () => tell("This phone could not play the film in either format."));
      v.addEventListener("stalled", () => { if (v.readyState < 2 && !v.paused) tell("The film is slow to load."); });
      v.addEventListener("playing", () => { help.hidden = true; });
    }
    sections.push(sec);
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
      <div class="head reveal"><div class="num">${pad(n)}</div><p class="kicker">${P.kicker}</p><h2>${P.title}</h2><p class="lede">${P.sub}</p>
        <div class="arrows"><button class="arrow" data-dir="-1" aria-label="Previous products">&larr;</button><button class="arrow" data-dir="1" aria-label="More products">&rarr;</button></div></div>
      <div class="track" tabindex="0" aria-label="Products">${P.items.map((it, i) => `
        <article class="card">
          <div class="img"><img src="${it.img}" alt="${it.name}" loading="lazy"></div>
          ${it.film ? `<button class="play" data-film="${i}" aria-label="Play the ${it.name} film"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M7 4l14 8-14 8z" fill="currentColor"/></svg></button>` : ""}
          <div class="txt"><p class="kicker">${it.role}</p>${it.status ? `<span class="status">${it.status}</span>` : ""}<h3>${it.name}</h3><p>${it.line}</p>
            ${it.detail ? `<button class="more" aria-expanded="false" aria-controls="detail-${i}" aria-label="${it.name} details"><span>Details</span><i aria-hidden="true">+</i></button>
            <div class="detail" id="detail-${i}" hidden><p>${it.detail}</p>${it.facts ? `<dl>${it.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>` : ""}</div>` : ""}
          </div>
        </article>`).join("")}
      </div>
      `);
    root.append(el);
    sections.push({ id: P.id, el });
  }

  // Made in Britain: told as scroll-lit statements, in the same voice as the films and the founders' story
  if (S.made) { addNav(S.made.id, S.made.nav); textChapter(S.made, S.made.lines); }

  // Founders: optional film first, then the story
  {
    const F = S.founders;
    addNav(F.id, F.nav);
    if (F.film) { filmChapter({ ...F, id: F.id, sub: "" }); n--; textChapter({ ...F, id: F.id + "-text" }, F.paragraphs, "story"); }
    else textChapter(F, F.paragraphs, "story");
    if (F.cta) sections[sections.length - 1].el.append(h("a", { class: "btn gold", href: "#contact", "data-enquiry": F.cta.enquiry }, F.cta.label));
  }

  // Films: each film on its own, in a plain player with full controls
  {
    const G = S.filmsSection, films = sections.filter(x => x.film);
    if (G && films.length) {
      n++; addNav(G.id, G.nav);
      const meta = id => S.chapters.find(c => c.id === id) || S.founders;
      const el = h("section", { id: G.id }, `
        <div class="head reveal"><div class="num">${pad(n)}</div><p class="kicker">${G.kicker}</p><h2>${G.title}</h2><p class="lede">${G.sub}</p></div>
        <div class="film-grid">${inlineMode ? films.map(f => { const k = pick(f.film); return `
          <div class="film-card reveal">
            <video class="gallery-film" playsinline webkit-playsinline controls preload="none" poster="${k.poster || ""}" style="aspect-ratio:${k.portrait ? "9/16" : "16/9"}" aria-label="${meta(f.id).filmTitle || meta(f.id).nav}">${sources(k)}${f.film.captions ? `<track kind="captions" srclang="en" label="English" src="${f.film.captions}">` : ""}</video>
            <span class="kicker">${meta(f.id).length || "Film"}</span><strong>${meta(f.id).filmTitle || meta(f.id).nav}</strong>
          </div>`; }).join("") : films.map((f, i) => `
          <button class="film-card reveal" data-watch="${i}" aria-label="Watch ${meta(f.id).filmTitle || meta(f.id).nav}">
            <span class="thumb"><img src="${f.film.poster}" alt="" loading="lazy"><span class="play"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M7 4l14 8-14 8z" fill="currentColor"/></svg></span></span>
            <span class="kicker">${meta(f.id).length || "Film"}</span><strong>${meta(f.id).filmTitle || meta(f.id).nav}</strong>
          </button>`).join("")}</div>`);
      root.append(el);
      sections.push({ id: G.id, el });
      el.addEventListener("click", e => { const b = e.target.closest("[data-watch]"); if (b) openPlayer(films[b.dataset.watch].film); });
    }
  }

  // Contact
  {
    const C = S.contact; n++;
    addNav(C.id, C.nav);
    const el = h("section", { id: C.id }, `
      <div class="head reveal"><div class="num">${pad(n)}</div><p class="kicker">${C.kicker}</p><h2>${C.title}</h2><p class="lede">${C.sub}</p>
        ${C.points ? `<ul class="points">${C.points.map(x => `<li>${x}</li>`).join("")}</ul>` : ""}${C.reply ? `<p class="reply">${C.reply}</p>` : ""}</div>
      <form id="contact-form" class="reveal" novalidate method="POST" action="${S.contactEndpoint}">
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
  let ccOn = false, soundOn = false, current = null, userPaused = false, heroMode = false, heroLeft = false, entered = false, enterHold = 0;
  // On-screen diagnostics: add ?debug=1 to the address to see what the film player is doing on this device
  const dbgEl = /[?&]debug=1/.test(location.search) ? document.body.appendChild(h("pre", { style: "position:fixed;z-index:99;left:0;right:0;top:76px;margin:0;padding:6px 8px;background:rgba(0,0,0,.8);color:#0f0;font:11px/1.3 monospace;white-space:pre-wrap;pointer-events:none;max-height:42vh;overflow:hidden" })) : null;
  const dbgLines = [];
  const dbg = m => { if (!dbgEl) return; dbgLines.push(m); if (dbgLines.length > 14) dbgLines.shift(); dbgEl.textContent = `${innerWidth}x${innerHeight} portrait:${portraitMQ.matches} reduced:${reduced} sound:${soundOn}\n` + dbgLines.join("\n"); };
  const setMuted = m => { video.muted = m; video.toggleAttribute("muted", m); }; // iPhone checks the attribute as well as the property
  // Phones held upright get the portrait cut of a film when one exists

  const setSound = on => {
    soundOn = on; setMuted(!on);
    soundBtn.setAttribute("aria-pressed", on);
    soundLabel.textContent = on ? "Sound on" : "Turn sound on";
    showCaption();
  };
  // Captions are drawn by the page (not the browser) so they sit clear of the film and the buttons. Shown when sound is off.
  const captionEl = $("#caption");
  const showCaption = () => {
    const t = video.textTracks[0], cue = t && t.activeCues && t.activeCues[0];
    captionEl.textContent = (ccOn && current && cue && !heroMode) ? cue.text : "";
  };

  const pauseBtn = $("#pause-btn");
  const setControls = () => { const on = !!current && !heroMode; controls.classList.toggle("on", on); controls.toggleAttribute("inert", !on); };
  const setEnded = v => { controls.classList.toggle("ended", v); current?.el.classList.toggle("ended", v); playBtn.setAttribute("aria-label", v ? "Replay film" : "Play film"); };

  const play = () => {
    // Reduced motion: wait for a tap, unless the visitor has already pressed Enter (that is their go-ahead to play films)
    if (reduced && !entered && !current?.started) { controls.classList.add("paused"); dbg("reduced motion: waiting for tap"); return; }
    setMuted(!soundOn);
    const p = video.play();
    if (p) p.then(() => { if (current) current.started = true; dbg("playing " + (video.muted ? "muted" : "with sound")); }).catch(err => {
      dbg("play refused: " + err.name);
      // Browser refused sound without a tap: carry on muted and ask for the tap
      if (soundOn) { setSound(false); video.play().then(() => dbg("playing muted (fallback)")).catch(e2 => { dbg("muted play refused: " + e2.name); controls.classList.add("paused"); }); }
      else controls.classList.add("paused");
    });
  };

  const load = sec => {
    video.classList.add("swap");
    video.querySelectorAll("track").forEach(t => t.remove());
    const f = pick(sec.film);
    stage.classList.toggle("portrait", f.portrait);
    const same = video.dataset.film === f.src; // same film as last time: keep it loaded (and keep the tap that unlocked sound)
    dbg((same ? "resume " : "load ") + f.src.split("/").pop());
    if (same) { video.classList.remove("swap"); return; }
    video.dataset.film = f.src;
    video.poster = f.poster || "";
    video.src = f.src;
    setTimeout(() => video.classList.remove("swap"), 450); // never leave the film hidden if the phone will not load it until tapped
    if (sec.film.captions) {
      const tr = h("track", { kind: "captions", srclang: "en", label: "English", src: sec.film.captions });
      video.append(tr); tr.track.mode = "hidden"; tr.track.addEventListener("cuechange", showCaption);
    }
    video.addEventListener("loadedmetadata", () => {
      if (sec === firstFilm && !entered && !sec.time && innerWidth > 820 && sec.film.previewFrom) { try { video.currentTime = sec.film.previewFrom; } catch {} }
      if (sec.time && sec.time < video.duration - 1) video.currentTime = sec.time;
      setSound(soundOn);
      video.classList.remove("swap");
    }, { once: true });
  };

  const activate = sec => {
    if (current === sec) return;
    if (current) { current.time = video.currentTime; video.pause(); }
    document.querySelectorAll(".film-chapter.ended").forEach(e => e.classList.remove("ended")); controls.classList.remove("ended");
    current = sec; userPaused = false;
    if (!sec) { stage.classList.remove("on"); setControls(); showCaption(); return; }
    load(sec); play();
    stage.classList.add("on"); controls.hidden = false; setControls();
  };
  portraitMQ.addEventListener("change", () => { if (current) { const s = current; s.time = video.currentTime; current = null; activate(s); } });
  video.addEventListener("playing", () => document.body.classList.add("film-live"));
  video.addEventListener("error", () => dbg("video error code " + (video.error && video.error.code) + " " + (video.error && video.error.message || "")));
  ["stalled", "waiting", "loadedmetadata", "canplay", "pause", "ended"].forEach(ev => video.addEventListener(ev, () => dbg(ev + " t=" + video.currentTime.toFixed(1) + " ready=" + video.readyState)));

  video.addEventListener("timeupdate", () => { if (video.duration) bar.style.width = (video.currentTime / video.duration * 100) + "%"; });
  video.addEventListener("play", () => { controls.classList.remove("paused"); setEnded(false); pauseBtn.textContent = "Pause"; });
  video.addEventListener("pause", () => { if (current) controls.classList.add("paused"); pauseBtn.textContent = "Play"; });
  video.addEventListener("ended", () => { // film over: move on to its closing panel, or the next section
    if (!current) return;
    current.time = 0; setEnded(true);
    const next = $(".outro", current.el) || current.el.nextElementSibling;
    if (next && !userPaused) next.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });
  const ccBtn = $("#cc-btn");
  ccBtn.addEventListener("click", () => { ccOn = !ccOn; ccBtn.setAttribute("aria-pressed", ccOn); showCaption(); });
  pauseBtn.addEventListener("click", () => { if (video.paused) { userPaused = false; if (current) current.started = true; video.play(); } else { userPaused = true; video.pause(); } });
  playBtn.addEventListener("click", () => { userPaused = false; if (current) current.started = true; video.play(); });
  soundBtn.addEventListener("click", () => { setSound(!soundOn); store.set("aegis-sound", soundOn ? "1" : "0"); if (video.paused && current && !userPaused) play(); });
  // Tap the film area to pause or resume
  root.addEventListener("click", e => {
    if (!current || e.target.closest("a,button,input,textarea,select")) return;
    if (!e.target.closest(".screen")) return;
    if (video.paused) { userPaused = false; video.play(); } else { userPaused = true; video.pause(); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) video.pause(); else if (current && !userPaused) play(); });

  /* ---------- Entry: one tap unlocks sound for every film ---------- */
  const firstFilm = sections.find(s => s.film);

  /* ---------- Native players (phones, tablets, iPhone and iPad) ---------- */
  if (inlineMode) {
    const playing = new Set();
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      const v = e.target;
      if (e.isIntersecting && e.intersectionRatio >= 0.55) {
        inlineVideos.forEach(o => { if (o !== v) o.pause(); });
        if (!v.dataset.userPaused && !(reduced && !entered)) { const p = v.play(); if (p) p.then(() => dbg("inline playing " + (v.muted ? "muted" : "with sound"))).catch(err => dbg("inline play refused: " + err.name)); }
      } else if (!v.paused) { v.dataset.auto = "1"; v.pause(); }
    }), { threshold: [0, 0.55, 1] });
    inlineVideos.forEach(v => {
      io2.observe(v);
      v.addEventListener("pause", () => { if (v.dataset.auto) delete v.dataset.auto; else if (!v.ended) v.dataset.userPaused = "1"; });
      v.addEventListener("play", () => { delete v.dataset.userPaused; });
      v.addEventListener("ended", () => { const sec = sections.find(x => x.inline === v), next = $(".outro", sec.el) || sec.el.nextElementSibling; if (next) next.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }); });
      v.addEventListener("error", () => dbg("inline video error code " + (v.error && v.error.code) + " " + (v.error && v.error.message || "")));
      ["loadedmetadata", "canplay", "stalled", "waiting"].forEach(ev => v.addEventListener(ev, () => dbg("inline " + ev + " ready=" + v.readyState)));
    });
    addEventListener("error", e => dbg("script error: " + e.message));
    // Only one film plays at a time, wherever it is on the page
    document.addEventListener("play", e => { document.querySelectorAll("video").forEach(o => { if (o !== e.target && !o.paused) { o.dataset.auto = "1"; o.pause(); } }); }, true);
    document.querySelectorAll(".gallery-film").forEach(v => v.addEventListener("error", () => dbg("gallery video error code " + (v.error && v.error.code))));
    document.addEventListener("visibilitychange", () => { if (document.hidden) inlineVideos.forEach(v => { if (!v.paused) { v.dataset.auto = "1"; v.pause(); } }); });
  }

  const enter = withSound => {
    if (inlineMode) {
      // Start the first film inside the tap so it may play with sound, then bring it into view
      entered = true; dbg("enter " + (withSound ? "with sound" : "muted") + " (native player)");
      const v = inlineVideos[0];
      if (!v) { sections[0].el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); return; }
      v.muted = !withSound; v.toggleAttribute("muted", !withSound);
      try { v.currentTime = 0; } catch {}
      const p = v.play(); if (p) p.catch(err => dbg("enter play refused: " + err.name));
      v.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      return;
    }
    setSound(withSound); store.set("aegis-sound", withSound ? "1" : "0");
    entered = true; enterHold = Date.now() + 3000; // keep the film running while the page scrolls down to it
    dbg("enter " + (withSound ? "with sound" : "muted"));
    if (firstFilm) {
      // Start the first film from the top inside the tap, so it and every later film may play with sound (required on iPhone)
      if (current !== firstFilm) activate(firstFilm);
      firstFilm.time = 0; firstFilm.started = true; heroLeft = true;
      try { video.currentTime = 0; } catch {}
      setMuted(!withSound);
      const p = video.play(); if (p) p.catch(() => {});
    }
    (firstFilm ? firstFilm.screen : sections[0].el).scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
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
    const heroNow = !inlineMode && innerWidth > 820 && innerHeight >= 600 && !reduced && !!firstFilm && sections[0] === firstFilm && heroR.bottom > vh * 0.55;
    if (heroNow !== heroMode) {
      heroMode = heroNow; showCaption();
      setControls();
    }
    // On wide screens the film sits in a window beside the headline and grows to full screen as you scroll
    const hp = heroMode ? clamp(-heroR.top / (heroR.height * 0.45)) : 1, e = hp * hp * (3 - 2 * hp);
    $("#hero").style.setProperty("--hp", heroMode || heroR.bottom > 0 ? hp : 0);
    video.style.setProperty("--fs", 0.44 + 0.56 * e);
    video.style.setProperty("--fk", 1 - e);
    video.style.setProperty("--fx", (1 - e) * 25 + "vw");
    video.style.setProperty("--fy", (1 - e) * 3 + "vh");
    if (heroMode) active = firstFilm;

    for (const s of sections) {
      const r = s.el.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) activeId = s.id.replace("-text", "");
      if (!s.film || s.inline) continue;
      const sr = s.screen.getBoundingClientRect(); // the film plays while its clear screen is in view
      if (sr.top < vh * 0.6 && sr.bottom > vh * 0.62) active = s; // stops once the closing panel covers a third of the screen
    }
    dim.style.opacity = 0;
    if (!active && firstFilm && Date.now() < enterHold) active = firstFilm;
    activate(active);
    rail.style.opacity = active ? 0 : 1; // nothing over or beside a playing film
    setControls();

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

  root.addEventListener("click", e => {
    const m = e.target.closest(".more");
    if (m) { const d = document.getElementById(m.getAttribute("aria-controls")), open = d.hidden; d.hidden = !open; m.setAttribute("aria-expanded", open); m.querySelector("i").textContent = open ? "\u2212" : "+"; if (open) m.closest(".card").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest", inline: "nearest" }); return; }
    const a = e.target.closest(".arrow"); if (!a) return;
    const track = $("#products .track"), card = $(".card", track);
    track.scrollBy({ left: +a.dataset.dir * (card.offsetWidth + 18) * (innerWidth > 820 ? 2 : 1), behavior: reduced ? "auto" : "smooth" });
  });

  /* ---------- Product films (switched on per product in site.config.js) ---------- */
  const dlg = $("#player"), pv = $("#player-video");
  root.addEventListener("click", e => {
    const card = e.target.closest("[data-film]"); if (!card) return;
    openPlayer(S.products.items[card.dataset.film].film);
  });
  function openPlayer(f) {
    const pk = pick(f);
    pv.querySelectorAll("track").forEach(t => t.remove());
    pv.src = pk.src; pv.poster = pk.poster || "";
    if (f.captions) pv.append(h("track", { kind: "captions", srclang: "en", label: "English", src: f.captions }));
    dlg.showModal(); pv.play().catch(() => {});
  }
  const closePlayer = () => { pv.pause(); pv.removeAttribute("src"); pv.load(); dlg.close(); };
  $("#player-close").addEventListener("click", closePlayer);
  dlg.addEventListener("cancel", e => { e.preventDefault(); closePlayer(); });

  /* ---------- Contact form (same Formspree endpoint as the current site) ---------- */
  const form = $("#contact-form"), statusEl = $("#status");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    statusEl.textContent = "Sending.";
    const fd = new FormData(form);
    fd.append("_subject", fd.get("enquiry") + " via website");
    try {
      const res = await fetch(S.contactEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("send failed");
      statusEl.textContent = "Thank you. Your message has been sent and we will reply within two working days.";
      form.reset();
    } catch {
      // Formspree refuses background sends while its reCAPTCHA is on. Keep the visitor on this site:
      // post the form into a panel here, where Formspree shows its "I'm not a robot" check and then delivers the message.
      statusEl.textContent = "";
      form.querySelectorAll('input[name="_subject"]').forEach(x => x.remove());
      form.append(h("input", { type: "hidden", name: "_subject", value: fd.get("enquiry") + " via website" }));
      const verify = $("#verify"), frame = $("#verify-frame");
      let loads = 0;
      frame.onload = () => { loads++; if (loads >= 2) { // second page in the panel is Formspree's confirmation: the message has gone
        setTimeout(() => { verify.close(); form.reset(); statusEl.textContent = "Thank you. Your message has been sent and we will reply within two working days."; }, 1200); } };
      form.target = "verify-frame";
      verify.showModal();
      form.submit();
      form.removeAttribute("target");
    }
  });

  $("#verify-close").addEventListener("click", () => $("#verify").close());

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
