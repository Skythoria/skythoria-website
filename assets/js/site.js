
/* Site config (update in one place) */
const SKY = {
  discordInvite: "https://discord.gg/fVjtFAJD",
  youtubeUrl: "https://www.youtube.com/@Skythoria",
  contact: { webhook: "https://discord.com/api/webhooks/1403695213163053166/jOQRB2O-RQdwJmzhZLeeePRMmppkeZxS-xv7M4mGpSB_g0KLPamhxS_pkkNnv5VTilSh" },   // <-- Paste a Discord webhook URL here to enable tickets
  storeUrl: ""
};

/* Render news from /assets/data/news.json */
async function renderNewsList(sel, limit) {
  const el = document.querySelector(sel); if (!el) return;
  try {
    const res = await fetch('/assets/data/news.json', {cache:'no-cache'});
    const items = await res.json();
    const posts = (limit? items.slice(0, limit) : items);
    el.innerHTML = posts.map(p => `
      <article class="card">
        <div class="post">
          ${p.image ? `<img src="${p.image}" alt="">` : ``}
          <div>
            <h3 style="margin:0">${p.title}</h3>
            <div class="badge">${p.date}</div>
            <p>${p.body}</p>
          </div>
        </div>
      </article>
    `).join('');
  } catch {
    el.innerHTML = `<div class="notice">No news yet.</div>`;
  }
}

/* CONTACT: Discord webhook only (no email fallback, to avoid exposing address) */
function initContactForm() {
  const form = document.getElementById('contactForm'); if (!form) return;
  const status = document.getElementById('contactStatus');
  const configured = !!(SKY.contact && SKY.contact.webhook);

  if (!configured) {
    status.innerHTML = "Ticket system not configured. (Admin: paste a Discord webhook in <code>assets/js/site.js</code>.)";
    form.querySelector("button[type='submit']").disabled = true;
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const subject = data.subject?.trim() || "Player Ticket";
    const email = data.email?.trim() || "unknown";
    const ign = data.ign?.trim() || "unknown";
    const msg = data.message?.trim() || "";
    if (!msg) { status.textContent = "Message cannot be empty."; return; }

    status.textContent = "Sending...";
    const payload = {
      username: "Skythoria Tickets",
      embeds: [{
        title: subject,
        description: msg,
        color: 0xc62828,
        fields: [
          { name: "Player", value: ign, inline: true },
          { name: "Reply Email", value: email, inline: true }
        ],
        timestamp: new Date().toISOString(),
        footer: { text: "Skythoria website ticket" }
      }]
    };
    try {
      const res = await fetch(SKY.contact.webhook, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw 0;
      form.reset();
      status.innerHTML = `<span class="badge" style="background:#173f2b;border-color:#173f2b">Ticket sent to staff Discord</span>`;
    } catch {
      status.textContent = "Failed to send. Try again later.";
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderNewsList('#newsListHome', 3);
  renderNewsList('#newsListFull');
  initContactForm();
  const d1 = document.getElementById('discordLink'); if (d1) d1.href = SKY.discordInvite;
  const d2 = document.getElementById('discordBtn');  if (d2) d2.href = SKY.discordInvite;
});
