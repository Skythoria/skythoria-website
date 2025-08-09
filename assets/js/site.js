
/* Config */
const SKY = {
  discordInvite: "https://discord.gg/fVjtFAJD",
  youtubeUrl: "https://www.youtube.com/@Skythoria",
  contact: { webhook: "https://discord.com/api/webhooks/1403695213163053166/jOQRB2O-RQdwJmzhZLeeePRMmppkeZxS-xv7M4mGpSB_g0KLPamhxS_pkkNnv5VTilSh" },
  storeUrl: ""
};

function wireDiscordLinks() {
  document.querySelectorAll('a[data-discord], button[data-discord]').forEach(a => {
    if (a.tagName.toLowerCase()==='a') { a.href = SKY.discordInvite; a.target='_blank'; a.rel='noopener'; }
    else { a.addEventListener('click', () => window.open(SKY.discordInvite,'_blank','noopener')); }
  });
  const d1 = document.getElementById('discordLink'); if (d1) d1.href = SKY.discordInvite;
}

function initContactForm() {
  const form = document.getElementById('contactForm'); if (!form) return;
  const status = document.getElementById('contactStatus');
  if (!(SKY.contact && SKY.contact.webhook)) { status.textContent = "Ticket system not configured."; form.querySelector('button[type=\"submit\"]').disabled = true; return; }
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = {
      username: "Skythoria Tickets",
      embeds: [{
        title: (data.subject||"Player Ticket"),
        description: (data.message||"").trim(),
        color: 0xc62828,
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
      form.reset(); status.innerHTML = `<span class="badge" style="background:#173f2b;border-color:#173f2b">Ticket sent to staff Discord</span>`;
    } catch { status.textContent = "Failed to send. Try again later."; }
  });
}

/* Banner: try manifest first, else look for /assets/banners/banner_0..99 (+ Banner_*, banner0..99) */
async function initBannerRotator() {
  const el = document.getElementById('banner-rotator'); if (!el) return;

  async function fetchManifest() {
    try {
      const r = await fetch('/assets/banners/_list.json', {cache:'no-cache'});
      if (!r.ok) return null;
      const arr = await r.json();
      if (!Array.isArray(arr)) return null;
      return arr.map(name => '/assets/banners/' + name);
    } catch { return null; }
  }

  let list = await fetchManifest();
  if (!list || !list.length) {
    const exts = ['.webp','.png','.jpg','.jpeg'];
    list = [];
    for (let i=0;i<100;i++) {
      const bases = ['banner_'+i, 'Banner_'+i, 'banner'+i, 'Banner'+i];
      for (const b of bases) for (const e of exts) list.push('/assets/banners/' + b + e);
    }
    // Also try generic names
    const generic = ['banner','Banner','header','Header','hero','Hero','main','Main'];
    for (const g of generic) for (const e of exts) list.push('/assets/banners/' + g + e);
  }

  const found = [];
  let started = false;
  function start() {
    if (started || found.length===0) return;
    started = true;
    const img = document.createElement('img');
    img.alt='Skythoria Banner'; img.decoding='async'; img.src = found[0];
    el.appendChild(img);
    let i=0; setInterval(()=>{ i=(i+1)%found.length; img.src = found[i]; }, 5000);
  }

  // Probe candidates
  let any=false;
  await Promise.all(list.map(url => new Promise(res => {
    const t = new Image();
    t.onload = () => { any=true; found.push(url); start(); res(); };
    t.onerror = () => res();
    t.src = url + (url.includes('?')?'&':'?') + 'v=' + Date.now();
  })));
  if (!any) { const ph=document.createElement('div'); ph.style.height='200px'; el.appendChild(ph); }
}

/* News */
async function renderNewsList(sel) {
  const el = document.querySelector(sel); if (!el) return;
  try {
    const r = await fetch('/assets/data/news.json', {cache:'no-cache'});
    const posts = await r.json();
    el.innerHTML = posts.map(p => `<article class="card"><h3>${p.title}</h3><div class="badge">${p.date}</div><p>${p.body}</p></article>`).join('');
  } catch { el.innerHTML = '<div class="card">No news yet.</div>'; }
}

document.addEventListener('includes:ready', () => {
  wireDiscordLinks();
  initContactForm();
  initBannerRotator();
  renderNewsList('#newsListFull');
});
