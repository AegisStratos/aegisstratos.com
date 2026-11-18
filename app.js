/* Aegis Stratos website: "the page is the film".
   A fixed theatre shows one act at a time. Scrolling chooses the act and the beat; each beat then plays its own timed animation,
   so wherever the visitor stops, the frame is finished. No video is used in the journey, so it runs by itself on every phone. */
(() => {
  const $ = (q, el = document) => el.querySelector(q);
  const $$ = (q, el = document) => [...el.querySelectorAll(q)];
  const h = (tag, attrs = {}, html = "") => { const e = document.createElement(tag); for (const k in attrs) e.setAttribute(k, attrs[k]); e.innerHTML = html; return e; };
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const phone = matchMedia("(max-width: 860px)");
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- Content that is easier to keep as data ---------- */
  const SITE = {
    contactEndpoint: "https://formspree.io/f/mwpakdbb",
    // Web traffic analytics: Cloudflare Web Analytics (free, no cookies). Paste the site token to switch it on.
    analytics: { cloudflareToken: "", requireConsent: true },
    // AI imagery ("blue hour"). Each background fades in when its file exists; a list plays as a slow slideshow.
    images: {
      hero: ["assets/scenes/airport.jpg", "assets/scenes/stadium.jpg", "assets/scenes/london.jpg"],
      power: ["assets/scenes/power-station.jpg"],
      britain: ["assets/scenes/works.jpg"]
    },
    // The films. To add one (for example the agentic code factory film), add an entry; an entry with src: null is left out entirely.
    films: [
      { title: "Physical AI and the product company", length: "2 min 43", src: "assets/films/physical-ai.mp4?v=3", portrait: "assets/films/physical-ai-portrait.mp4?v=3", start: 5 },
      { title: "For defenders", length: "1 min 38", src: "assets/films/customers.mp4?v=3", portrait: "assets/films/customers-portrait.mp4?v=3", start: 4 },
      { title: "The agentic code factory", length: "", src: null, portrait: null },
      { title: "The founders", length: "", src: null, portrait: null }
    ],
    // Narration for the journey: one audio file, one stretch per act (seconds). Empty = no sound button.
    voice: { src: "assets/voice/journey.m4a", acts: {"act-hero": [0.02, 6.65], "act-threat": [8.02, 18.81], "act-build": [20.02, 30.49], "act-loop": [32.02, 49.45], "act-britain": [51.02, 60.45], "act-team": [62.02, 70.73], "act-next": [72.02, 81.85]} },
    range: [
      { name: "Intelligence", role: "Flight control AI", status: "In development", img: "assets/products/05-flight-controller.jpg", line: "One flight AI across every product. Improve it once and everything we fly improves." },
      { name: "Metatron", role: "Surveillance", status: "Prototype flown", img: "assets/products/01-metatron.jpg", line: "Watches, searches and reports. Then comes home to fly again." },
      { name: "Mjolnir", role: "Reusable interceptor", status: "In development", img: "assets/products/02-mjolnir.jpg", line: "Stops slower attack drones, and flies home when it is not used." },
      { name: "Keraunos", role: "Interceptor", status: "In development", img: "assets/products/03-keraunos.jpg", line: "Rocket-propelled, for fast jet-powered drones, at a cost defenders can sustain." },
      { name: "Keraunos NATO", role: "Hardened interceptor", status: "Planned", img: "assets/products/04-keraunos-nato.jpg", line: "Shielded and hardened, for the highest-value threats." },
      { name: "Aegis motor", role: "Rocket motor", status: "In development", img: "assets/products/06-aegis-motor.jpg", line: "Our own solid-fuel rocket motor. Designed and made in Britain." },
      { name: "Flight controller", role: "Autopilot board", status: "In development", img: "assets/products/05-flight-controller.jpg", line: "Our own flight controller boards. Designed and made in Britain." },
      { name: "Humanoid", role: "Research", status: "Research", img: "assets/products/07-humanoid-prototype.jpg", line: "The same brain, in time, in robots that do hazardous work for people." }
    ]
  };

  /* ---------- Prepare the acts ---------- */
  // Split headlines into words so they rise in one by one, keeping bold and gold emphasis
  $$(".h").forEach(el => {
    let i = 0;
    const wrap = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(t => { if (!t.trim()) { if (t) frag.append(" "); return; } const s = h("span", { class: "w", style: `--i:${i++}` }); s.textContent = t; frag.append(s); });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) wrap(n);
      });
    };
    wrap(el);
  });

  const theatre = $("#theatre"), journey = $("#journey"), progressBar = $("#progress i");
  const acts = $$(".act", theatre).map(el => ({
    el, id: el.id, beats: +el.dataset.beats, beat: -1,
    shots: $$(".shot", el).map(s => ({ el: s, from: +s.dataset.from, to: +s.dataset.to })),
    items: $$("[data-at]", el).map(i => ({ el: i, at: +i.dataset.at })),
    bgs: $$(".bg", el)
  }));

  // How far you scroll through each act: a little under half a screen per beat, a little more for the hero
  const layout = () => {
    const vh = innerHeight, per = phone.matches ? 0.42 : 0.5;
    let y = 0;
    acts.forEach(a => { a.start = y; a.len = Math.max(0.7, a.beats * per) * vh; y += a.len; });
    journey.style.height = (y + vh) + "px";
    $$(".anchor").forEach(an => { const a = acts.find(x => x.id === an.dataset.act); if (a) an.style.top = (a.start + 2) + "px"; });
    return y;
  };
  let total = layout();
  window.aegisActs = () => acts.map(a => ({ id: a.id, start: a.start, len: a.len, beats: a.beats })); // used by the test scripts

  // Counters
  const runCount = el => {
    if (el.dataset.done) return; el.dataset.done = "1";
    const to = +el.dataset.count, pre = el.dataset.prefix || "", t0 = performance.now(), dur = reduced ? 1 : 1100;
    const tick = now => { const k = clamp((now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = pre + Math.round(to * e).toLocaleString("en-GB"); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };

  const setBeat = (a, beat) => {
    if (a.beat === beat) return;
    a.beat = beat;
    a.shots.forEach(s => s.el.classList.toggle("live", beat >= s.from && beat <= s.to));
    a.items.forEach(i => {
      const on = beat >= i.at;
      i.el.classList.toggle("in", on);
      if (!on) $$("[data-count]", i.el).forEach(c => delete c.dataset.done);
      else $$("[data-count]", i.el).forEach(runCount);
    });
    a.bgs.forEach(b => { if (b.dataset.until) b.style.visibility = beat > +b.dataset.until ? "hidden" : ""; });
  };

  let current = null;
  const navLinks = $$("#nav a");
  const frame = () => {
    ticking = false;
    const y = scrollY - journey.offsetTop;
    const inJourney = y < total - 1;
    theatre.classList.toggle("off", !inJourney);
    progressBar.style.width = (clamp(y / total) * 100) + "%";
    if (!inJourney) { if (current) { current.el.classList.remove("on"); current = null; voiceStop(); } navLinks.forEach(l => l.classList.remove("active")); return; }
    let a = acts[0];
    for (const x of acts) if (y >= x.start) a = x;
    const p = clamp((y - a.start) / a.len);
    const beat = Math.min(a.beats - 1, Math.floor(p * a.beats));
    if (a !== current) {
      if (current) { current.el.classList.remove("on"); setBeat(current, -1); }
      current = a; a.el.classList.add("on");
      voiceAct(a.id);
      navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + ({ "act-build": "build", "act-loop": "loop", "act-britain": "britain", "act-team": "team" }[a.id] || "")));
    }
    setBeat(a, beat);
    a.el.style.setProperty("--p", p.toFixed(3));
  };
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", onScroll, { passive: true });
  let lastW = innerWidth;
  addEventListener("resize", () => { if (innerWidth !== lastW || !phone.matches) { lastW = innerWidth; total = layout(); } onScroll(); }); // ignore the phone address bar sliding

  /* ---------- AI imagery: fade each background in once it has loaded; lists play as a slow slideshow ---------- */
  $$(".bg").forEach(bg => {
    const list = SITE.images[bg.dataset.img] || [];
    const loaded = [];
    list.forEach(src => { const im = new Image(); im.onload = () => { loaded.push(src); if (loaded.length === 1) { bg.style.backgroundImage = `url(${src})`; bg.classList.add("ready"); } }; im.src = src; });
    if (list.length > 1 && !reduced) {
      let i = 0;
      setInterval(() => {
        if (loaded.length < 2 || !bg.closest(".act").classList.contains("on")) return;
        i = (i + 1) % loaded.length;
        bg.classList.remove("ready");
        setTimeout(() => { bg.style.backgroundImage = `url(${loaded[i]})`; bg.classList.add("ready"); }, 900);
      }, 5200);
    }
  });

  /* ---------- Optional narration: one audio element, started inside the visitor's tap, one stretch per act ---------- */
  const soundBtn = $("#sound-btn"), voice = new Audio();
  let soundOn = false, voiceEnd = 0;
  voice.preload = "none";
  const voiceStop = () => { if (!voice.paused) voice.pause(); };
  function voiceAct(id) {
    if (!soundOn) return;
    const seg = SITE.voice.acts[id];
    if (!seg) { voiceStop(); return; }
    voiceEnd = seg[1];
    try { voice.currentTime = seg[0]; } catch {}
    voice.play().catch(() => {});
  }
  voice.addEventListener("timeupdate", () => { if (voiceEnd && voice.currentTime >= voiceEnd) voice.pause(); });
  if (SITE.voice.src) {
    soundBtn.hidden = false; voice.src = SITE.voice.src;
    const heroSound = $("#hero-sound");
    const setSoundUI = () => { soundBtn.setAttribute("aria-pressed", soundOn); $("#sound-label").textContent = soundOn ? "Sound on" : "Sound"; if (heroSound) heroSound.textContent = soundOn ? "Sound is on" : "Play with sound"; };
    const toggleSound = () => {
      soundOn = !soundOn; setSoundUI();
      // The first play must happen inside this tap: that is what lets later acts speak by themselves on phones
      if (soundOn) { const seg = current && SITE.voice.acts[current.id]; if (seg) { voiceEnd = seg[1]; try { voice.currentTime = seg[0]; } catch {} } voice.play().catch(() => { soundOn = false; setSoundUI(); }); }
      else voiceStop();
    };
    soundBtn.addEventListener("click", toggleSound);
    if (heroSound) { heroSound.hidden = false; heroSound.addEventListener("click", toggleSound); }
    document.addEventListener("visibilitychange", () => { if (document.hidden) voiceStop(); });
  }

  /* ---------- The range ---------- */
  const track = $("#range-track");
  track.innerHTML = SITE.range.map(it => `
    <article class="card"><div class="img"><img src="${it.img}" alt="${it.name}" loading="lazy"></div>
      <div class="txt"><p class="kicker">${it.role}</p><span class="status">${it.status}</span><h3>${it.name}</h3><p>${it.line}</p></div></article>`).join("");
  $$(".arrow").forEach(b => b.addEventListener("click", () => track.scrollBy({ left: +b.dataset.dir * 712, behavior: reduced ? "auto" : "smooth" })));

  /* ---------- The films: plain native players (the form proven on a real iPhone: no poster, no captions track, no scripted start) ---------- */
  const grid = $("#film-grid");
  const portrait = matchMedia("(orientation: portrait) and (max-width: 860px)").matches;
  SITE.films.filter(f => f.src).forEach(f => {
    const src = (portrait && f.portrait ? f.portrait : f.src) + (f.start ? "#t=" + f.start : ""); // #t shows a real frame before play, not the blank opening
    const card = h("div", { class: "film" }, `<video controls playsinline preload="metadata" src="${src}" style="aspect-ratio:${portrait && f.portrait ? "9/16" : "16/9"}"></video><span class="kicker">${f.length}</span><strong>${f.title}</strong>`);
    grid.append(card);
    const v = $("video", card);
    let first = true;
    v.addEventListener("play", () => { voiceStop(); if (first && f.start) { first = false; try { v.currentTime = 0; } catch {} } $$("video", grid).forEach(o => { if (o !== v) o.pause(); }); });
  });

  /* ---------- Work with us ---------- */
  const form = $("#contact-form"), statusEl = $("#status"), select = $("select", form);
  const choose = door => { select.value = door; $$(".door").forEach(d => d.classList.toggle("chosen", d.dataset.door === door)); };
  document.addEventListener("click", e => {
    const d = e.target.closest("[data-door]"); if (!d) return;
    choose(d.dataset.door);
    if (d.classList.contains("door")) { form.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" }); $("[name=name]", form).focus({ preventScroll: true }); }
  });
  select.addEventListener("change", () => choose(select.value));
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    statusEl.textContent = "Sending.";
    const fd = new FormData(form);
    fd.append("_subject", fd.get("enquiry") + " via website");
    try {
      const res = await fetch(SITE.contactEndpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("send failed");
      statusEl.textContent = "Thank you. Your message has been sent and we will reply within two working days.";
      form.reset();
    } catch {
      // Formspree refuses background sends while its reCAPTCHA is on. Keep the visitor on this site:
      // post the form into a panel here, where Formspree shows its "I'm not a robot" check and then delivers the message.
      statusEl.textContent = "";
      $$('input[name="_subject"]', form).forEach(x => x.remove());
      form.append(h("input", { type: "hidden", name: "_subject", value: fd.get("enquiry") + " via website" }));
      const verify = $("#verify"), frameEl = $("#verify-frame");
      let loads = 0;
      frameEl.onload = () => { loads++; if (loads >= 2) setTimeout(() => { verify.close(); form.reset(); statusEl.textContent = "Thank you. Your message has been sent and we will reply within two working days."; }, 1200); };
      form.target = "verify-frame";
      verify.showModal();
      form.submit();
      form.removeAttribute("target");
    }
  });
  $("#verify-close").addEventListener("click", () => $("#verify").close());

  /* ---------- Your choices (consent) and analytics ---------- */
  const loadAnalytics = () => {
    const A = SITE.analytics;
    if (!A.cloudflareToken || $("#cf-analytics")) return;
    document.head.append(h("script", { id: "cf-analytics", defer: "", src: "https://static.cloudflareinsights.com/beacon.min.js", "data-cf-beacon": JSON.stringify({ token: A.cloudflareToken }) }));
  };
  addEventListener("aegis-consent-all", loadAnalytics);
  if (!SITE.analytics.requireConsent) loadAnalytics();
  const banner = $("#cookies");
  const consent = v => { store.set("aegis-consent", v); banner.hidden = true; if (v === "all") dispatchEvent(new Event("aegis-consent-all")); };
  if (!store.get("aegis-consent")) banner.hidden = false; else if (store.get("aegis-consent") === "all") dispatchEvent(new Event("aegis-consent-all"));
  $("#cookies-essential").addEventListener("click", () => consent("essential"));
  $("#cookies-all").addEventListener("click", () => consent("all"));
  $("#cookie-settings").addEventListener("click", e => { e.preventDefault(); banner.hidden = false; });

  // Start: wait for the fonts so the first headline animates in its real typeface, then play the opening beat
  const start = () => { document.documentElement.classList.add("ready"); frame(); };
  (document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]) : Promise.resolve()).then(start);
})();
