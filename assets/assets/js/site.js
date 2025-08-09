/* Site config */
const SKY = {
  discordInvite: "https://discord.gg/fVjtFAJD",
  youtubeUrl: "https://www.youtube.com/@Skythoria",
  contact: { webhook: "https://discord.com/api/webhooks/1403695213163053166/jOQRB2O-RQdwJmzhZLeeePRMmppkeZxS-xv7M4mGpSB_g0KLPamhxS_pkkNnv5VTilSh" },
  storeUrl: ""
};

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

function initContactForm() {
  const form = document.getElementById('contactForm'); if (!form) return;
  const status = document.getElementById('contactStatus');
  const configured = !!(SKY.contact && SKY.contact.webhook);
  if (!configured) { status.textContent = "Ticket system not configured."; form.querySelector('button[type=\"submit\"]').disabled = true; return; }
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
        fields: [{ name: "Player", value: ign, inline: true }, { name: "Reply Email", value: email, inline: true }],
        timestamp: new Date().toISOString(),
        footer: { text: "Skythoria website ticket" }
      }]
    };
    try {
      const res = await fetch(SKY.contact.webhook, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (!res.ok) throw 0;
      form.reset();
      status.innerHTML = `<span class="badge" style="background:#173f2b;border-color:#173f2b">Ticket sent to staff Discord</span>`;
    } catch { status.textContent = "Failed to send. Try again later."; }
  });
}

function wireDiscordLinks() {
  document.querySelectorAll('a[data-discord], button[data-discord]').forEach(a => {
    if (a.tagName.toLowerCase() === 'a') { a.href = SKY.discordInvite; a.target='_blank'; a.rel='noopener'; }
    else { a.addEventListener('click', () => window.open(SKY.discordInvite, '_blank', 'noopener')); }
  });
  const d1 = document.getElementById('discordLink'); if (d1) d1.href = SKY.discordInvite;
  const d2 = document.getElementById('discordBtn');  if (d2) d2.href = SKY.discordInvite;
}

function installImageFallbacks() {
  const els = document.querySelectorAll('img[data-img-candidates]');
  els.forEach(imgEl => {
    const list = (() => { try { return JSON.parse(imgEl.getAttribute('data-img-candidates') || '[]'); } catch { return []; } })();
    if (!list.length) return;
    let i = 0;
    const tryNext = () => {
      if (i >= list.length) return;
      const test = new Image();
      const url = list[i++];
      test.onload = () => { imgEl.src = url; };
      test.onerror = tryNext;
      test.src = url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();
    };
    tryNext();
  });
}

function initBannerRotator() {
  const el = document.getElementById('banner-rotator'); if (!el) return;
  // Candidate folders and filenames
  const folders = ['/assets/banners/', '/assets/img/banners/'];
  const names = ['banner','banner0','banner1','banner2','banner3','banner4','banner5','header','main','hero'];
  const exts  = ['.png','.jpg','.jpeg','.webp'];
  const candidates = [];
  for (const f of folders) for (const n of names) for (const e of exts) candidates.push(f + n + e);

  const loaded = [];
  let idx = 0, started = false;

  function startRotator() {
    if (started || loaded.length === 0) return;
    started = true;
    const img = document.createElement('img');
    img.alt = 'Skythoria Banner'; img.decoding='async'; img.src = loaded[0];
    el.appendChild(img);
    setInterval(() => { idx = (idx + 1) % loaded.length; img.src = loaded[idx]; }, 5000);
  }

  let pending = candidates.length, any = false;
  candidates.forEach(url => {
    const test = new Image();
    test.onload = () => { loaded.push(url); any = true; startRotator(); };
    test.onerror = () => {};
    test.src = url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();
  });

  // If nothing loaded after a bit, show a quiet placeholder so layout isn't broken
  setTimeout(() => { if (!any) { const ph = document.createElement('div'); ph.style.height='200px'; el.appendChild(ph); } }, 1500);
}

// Ensure we run AFTER includes have injected header/footer/banner
document.addEventListener('includes:ready', () => {
  renderNewsList('#newsListHome', 3);
  renderNewsList('#newsListFull');
  initContactForm();
  wireDiscordLinks();
  installImageFallbacks();
  initBannerRotator();
});
