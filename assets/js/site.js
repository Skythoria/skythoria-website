
/* Skythoria JS — STATIC BANNER */
const SKY = {
  discordInvite: "https://discord.gg/fVjtFAJD",
  youtubeUrl: "https://www.youtube.com/@Skythoria",
  contact: { webhook: "https://discord.com/api/webhooks/1403695213163053166/jOQRB2O-RQdwJmzhZLeeePRMmppkeZxS-xv7M4mGpSB_g0KLPamhxS_pkkNnv5VTilSh" }
};

function markActive() {
  const here = location.pathname.replace(/\/+$/,'') || '/';
  document.querySelectorAll('nav a').forEach(a => {
    const href = (a.getAttribute('href')||'').replace(/\/+$/,'') || '/';
    if (href === here || (href !== '/' && here.startsWith(href))) a.classList.add('active');
  });
}
function wireDiscordLinks() {
  document.querySelectorAll('a[data-discord], button[data-discord]').forEach(a => {
    if (a.tagName.toLowerCase()==='a') { a.href = SKY.discordInvite; a.target='_blank'; a.rel='noopener'; }
    else { a.addEventListener('click', () => window.open(SKY.discordInvite,'_blank','noopener')); }
  });
  const d1 = document.getElementById('discordLink'); if (d1) d1.href = SKY.discordInvite;
}

/* Latest news preview */
async function renderLatestNews() {
  const box = document.getElementById('latestNews'); if (!box) return;
  try {
    const r = await fetch('/assets/data/news.json', {cache:'no-cache'});
    const posts = await r.json();
    if (!Array.isArray(posts) || !posts.length) { box.innerHTML = ''; return; }
    const p = posts[0];
    box.innerHTML = `<div class="card latest"><div><div class="badge">${p.date}</div><h3 style="margin:.4rem 0 .3rem">${p.title}</h3><p style="margin:0">${p.body}</p></div></div>`;
  } catch {}
}

/* Contact (Discord webhook) */
function initContactForm() {
  const form = document.getElementById('contactForm'); if (!form) return;
  const status = document.getElementById('contactStatus');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      username: "Skythoria Tickets",
      embeds: [{
        title: (data.subject||"Player Ticket"),
        description: (data.message||"").trim(),
        color: 0xe53935,
        fields: [
          { name: "Player", value: (data.ign||"unknown"), inline: true },
          { name: "Reply Email", value: (data.email||"unknown"), inline: true }
        ],
        timestamp: new Date().toISOString(),
        footer: { text: "Skythoria website ticket" }
      }]
    };
    try {
      status.textContent = "Sending...";
      const res = await fetch(SKY.contact.webhook, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (!res.ok) throw 0;
      form.reset(); status.innerHTML = `<span class="badge">Ticket sent to staff Discord</span>`;
    } catch {
      status.textContent = "Failed to send. Try again later.";
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  markActive();
  wireDiscordLinks();
  renderLatestNews();
  initContactForm();
});
