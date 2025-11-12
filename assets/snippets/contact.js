const FORMSPREE_ENDPOINT = "https://formspree.io/f/mwpakdbb"; // pre-configured

// EmailJS disabled by default
const EMAILJS_PUBLIC_KEY = "";
const EMAILJS_SERVICE_ID = "";
const EMAILJS_TEMPLATE_ID = "";

const form = document.getElementById("contact-form");
const statusEl = document.getElementById("status");

function deriveSubject(fd){
  const msg = (fd.get("message")||"").toLowerCase();
  if (msg.includes("investor") || msg.includes("investment")) return "Investor enquiry via website";
  if (msg.includes("privacy") || msg.includes("legal") || msg.includes("gdpr")) return "Privacy/Legal enquiry via website";
  return "General enquiry via website";
}

async function sendViaFormspree(formData){
  formData.append("_subject", deriveSubject(formData));
  const res = await fetch(FORMSPREE_ENDPOINT, {method:"POST", body:formData, headers:{"Accept":"application/json"}});
  if(!res.ok) throw new Error("Formspree error");
  return true;
}

form?.addEventListener("submit", async (e)=>{
  e.preventDefault();
  statusEl.textContent = "Sending…";
  const fd = new FormData(form);
  try {
    await sendViaFormspree(fd);
    statusEl.textContent = "Thank you — your message has been sent. We’ll reply within two business days.";
    form.reset();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Sorry, something went wrong. Please try again.";
  }
});
