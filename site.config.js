/*
  Aegis Stratos website content.
  Everything the page shows is driven from this file.

  To turn a film on, set its `film` field:
    film: { src: "assets/films/name.mp4", captions: "assets/films/name.vtt", poster: "assets/posters/name.jpg" }
  To turn it off, set `film: null`. The page lays itself out so that nothing looks missing.
*/
window.SITE = {
  contactEndpoint: "https://formspree.io/f/mwpakdbb", // same endpoint as the current live form

  // Web traffic analytics: Cloudflare Web Analytics (free, no cookies). Paste the site token to switch it on.
  // requireConsent: true loads it only after a visitor chooses "Accept all" on the cookie banner; false counts every visit.
  analytics: { cloudflareToken: "", requireConsent: true },

  hero: {
    kicker: "Counter-drone defence · Physical AI · Made in Britain",
    title: "Protection through <b>innovation.</b>",
    sub: "We build Physical AI to protect people and critical infrastructure from the drone threat, at a price defenders can sustain.",
    art: "assets/products/01-metatron.jpg"
  },

  chapters: [
    {
      id: "physical-ai",
      nav: "Physical AI",
      filmTitle: "Physical AI and the product company", length: "2 min 43",
      kicker: "Physical AI · A product company",
      title: "Not a line. <em>A loop.</em>",
      sub: "Why defence needs a product company, and what Physical AI makes possible.",
      film: { src: "assets/films/physical-ai.mp4", portrait: "assets/films/physical-ai-portrait.mp4", captions: "assets/films/physical-ai.vtt", poster: "assets/posters/physical-ai.jpg", posterPortrait: "assets/posters/physical-ai-portrait.jpg" }, // investor film v2.1
      cta: { label: "Investor enquiries", enquiry: "Investor enquiry", line: "Defence can move at the speed of the threat." }
    },
    {
      id: "customers",
      nav: "For defenders",
      filmTitle: "For defenders", length: "1 min 38",
      kicker: "For defenders",
      title: "Defenders are not losing on skill. <em>They are losing on cost.</em>",
      sub: "Interceptors priced against the threat, not against a missile. Aircraft that come home and fly again.",
      film: { src: "assets/films/customers.mp4", portrait: "assets/films/customers-portrait.mp4", captions: "assets/films/customers.vtt", poster: "assets/posters/customers.jpg", posterPortrait: "assets/posters/customers-portrait.jpg" },
      cta: { label: "Request a briefing", enquiry: "Customer briefing", line: "Protection you can afford to keep using." }
    }
    ,{
      // AGENTIC CODE FACTORY FILM: switched off until the film exists. Set `film` to switch the whole chapter on.
      id: "code-factory",
      nav: "Code factory",
      kicker: "Agentic code factory",
      title: "AI builds. <em>People approve.</em>",
      sub: "How our engineering pipeline of AI agents designs, tests and documents every part, with a person approving every step.",
      film: null,
      cta: null
    }
    // A chapter with film: null is left out of the page and the menu entirely, so nothing looks missing.
    // A film may also carry a portrait cut for phones: film: { src, portrait, captions, poster, posterPortrait }
  ],

  products: {
    id: "products",
    nav: "Products",
    kicker: "Products",
    title: "One platform. <b>One brain.</b>",
    sub: "Aircraft, interceptors and one flight AI, with our own controller and motor in development. A person authorises every consequential action.",
    note: "Concept illustrations, not designs.",
    items: [
      { name: "Metatron", role: "Surveillance aircraft", status: "Prototype flown", line: "A reusable aircraft built to watch over people and places, and to report faithfully what it sees.", img: "assets/products/01-metatron.jpg", detail: "A medium-sized aircraft that takes off, watches and comes home to fly again. It carries the sensors for the task. Intelligence, our flight control AI, is being built to fly it.", facts: [["Purpose", "Watch, search and report"], ["Reusable", "Designed to be reusable"]], film: null },
      { name: "Mjolnir", role: "Reusable interceptor", status: "In development", line: "Designed to stop slower attack drones, and to fly home when it is not used.", img: "assets/products/02-mjolnir.jpg", detail: "An interceptor built on the Metatron platform for slower, propeller-driven attack drones. If it is launched and not needed, it returns to be used again.", facts: [["Purpose", "Stop slower attack drones"], ["Reusable", "Designed to be reusable"]], film: null },
      { name: "Keraunos", role: "Interceptor", status: "In development", line: "Designed to stop jet-powered drones, at a price defenders can sustain.", img: "assets/products/03-keraunos.jpg", detail: "A one-way, rocket-propelled interceptor for fast, jet-powered drones. It is being designed around our own airframe, flight controller and rocket motor.", facts: [["Purpose", "Stop jet-powered drones"], ["Reusable", "No, one-way"]], film: null },
      { name: "Keraunos NATO", role: "Hardened interceptor", status: "Planned", line: "A shielded, hardened class, planned for higher-value threats.", img: "assets/products/04-keraunos-nato.jpg", detail: "The Keraunos design in a shielded, hardened form for higher-value threats, planned around a hardened version of our own flight controller.", facts: [["Purpose", "Higher-value threats"], ["Reusable", "No, one-way"]], film: null },
      { name: "Intelligence", role: "Flight control AI", status: "In development", line: "The flight AI built to fly every Aegis Stratos aircraft. Our own flight controller boards are in development.", img: "assets/products/05-flight-controller.jpg", detail: "One flight control AI shared by every aircraft, so an improvement to one reaches all of them. It will run on our own flight controller boards, which we will produce in Britain.", facts: [["Purpose", "Flies every aircraft"], ["Hardware", "Our own controller boards"]], film: null },
      { name: "Aegis motor", role: "Rocket motor", status: "In development", line: "Our own solid-fuel rocket motor, built to power Keraunos.", img: "assets/products/06-aegis-motor.jpg", detail: "A small solid-fuel rocket motor of our own, to power Keraunos. We will manufacture it in Britain.", facts: [["Purpose", "Powers Keraunos"], ["Made", "In Britain"]], film: null },
      { name: "Humanoid research", role: "Research", status: "Research", line: "The same flight AI could go further in time: robots for hazardous work.", img: "assets/products/07-humanoid-prototype.jpg", detail: "Longer-term research into taking the same flight AI beyond aircraft, into robots that can do hazardous work in place of people.", facts: [["Purpose", "Hazardous work"], ["Stage", "Research"]], film: null }
    ]
  },

  made: {
    id: "made",
    nav: "Made in Britain",
    kicker: "Made in Britain",
    title: "Designed in Britain. <em>Made in Britain.</em>",
    sub: "A British-Swedish company with a NATO supply chain.",
    band: ["Made in Britain", "NATO supply chain", "British and Swedish owned", "UK-first sourcing"],
    pillars: [
      { title: "Made in Britain", text: "Our aircraft are designed and built in Britain, and our production will be too. The people who design each part work beside the people who make it." },
      { title: "A NATO supply chain", text: "We buy from the United Kingdom first, then from NATO allies. Our supply chain is being built to contain no critical parts from outside the alliance." },
      { title: "British and Swedish owned", text: "Aegis Stratos is a British-Swedish company, registered in the United Kingdom, with British and Swedish ownership." },
      { title: "Unique in defence", text: "No other defence company is built this way. One flight AI serves every aircraft. The airframe, flight controller and rocket motor are all being designed under one roof." }
    ],
    buildingKicker: "What we are bringing in-house",
    building: [
      { title: "Solid-fuel rocket motors", status: "In development", img: "assets/products/06-aegis-motor.jpg", text: "We are developing our own solid-fuel rocket motors and will manufacture them in the United Kingdom." },
      { title: "Flight controller boards", status: "In development", img: "assets/products/05-flight-controller.jpg", text: "We are designing our own flight controller boards and will produce them in the United Kingdom." }
    ]
  },

  founders: {
    id: "story",
    nav: "Our story",
    kicker: "Why we formed",
    title: "The arithmetic is against <em>the people being protected.</em>",
    film: null, // FOUNDERS FILM: add here when ready; it plays above the story
    paragraphs: [
      "Night after night, cheap drones fly at homes, hospitals and power stations. Ukraine has shown the world what that looks like.",
      "Defenders answer with missiles that cost many times more, and that cannot be made fast enough.",
      "That is not a failure of courage or skill. It is arithmetic, and it runs against the people being protected.",
      "None of us planned to start a defence company. We came from engineering, defence and military service, and we had seen how the usual way works: a fixed specification and a programme that runs for years. The threat changes in weeks.",
      "So we formed a different kind of company. A product company, built with AI from the first day. AI drafts and tests the engineering. People direct it and approve the work.",
      "We are designing the parts that matter ourselves, so that we can change them quickly. And a person authorises every consequential action.",
      "Our first aircraft has flown. Field trials come next.",
      "Our ambition is to become a £3bn defence product company, and to make protection affordable for those who need it.",
      "Protection through innovation."
    ]
  },

  filmsSection: {
    id: "films",
    nav: "Films",
    kicker: "Watch",
    title: "The films, <b>in full.</b>",
    sub: "Each film on its own, full screen, with player controls."
  },

  contact: {
    id: "contact",
    nav: "Contact",
    kicker: "Contact",
    title: "Talk <b>to us.</b>",
    sub: "For customer briefings, partnership and investor enquiries.",
    enquiries: ["Customer briefing", "Investor enquiry", "Partnership", "General enquiry"]
  },

  footer: "The product images here are concept illustrations, and our plans for the future are ambitions we are working towards."
};
