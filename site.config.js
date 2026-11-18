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
    kicker: "Counter-drone defence · Physical AI",
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
      { name: "Metatron", role: "Surveillance aircraft", status: "Prototype flown", line: "A reusable aircraft built to watch over people and places, and to report faithfully what it sees.", img: "assets/products/01-metatron.jpg", film: null },
      { name: "Mjolnir", role: "Reusable interceptor", status: "In design", line: "Designed to stop slower attack drones, and to fly home when it is not used.", img: "assets/products/02-mjolnir.jpg", film: null },
      { name: "Keraunos", role: "Interceptor", status: "In design", line: "Designed to stop jet-powered drones, at a price defenders can sustain.", img: "assets/products/03-keraunos.jpg", film: null },
      { name: "Keraunos NATO", role: "Hardened interceptor", status: "Planned", line: "A shielded, hardened class, planned for higher-value threats.", img: "assets/products/04-keraunos-nato.jpg", film: null },
      { name: "Intelligence", role: "Flight control AI", status: "In development", line: "The flight AI built to fly every Aegis Stratos aircraft. Our own flight controller is in design.", img: "assets/products/05-flight-controller.jpg", film: null },
      { name: "Aegis motor", role: "Rocket motor", status: "Planned", line: "A small rocket motor of our own, planned for Keraunos.", img: "assets/products/06-aegis-motor.jpg", film: null },
      { name: "Humanoid research", role: "Research", status: "Research", line: "The same flight AI could go further in time: robots for hazardous work.", img: "assets/products/07-humanoid-prototype.jpg", film: null }
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

  footer: "Product images are concept illustrations, not designs. Statements about the future are ambitions, not forecasts."
};
