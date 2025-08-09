
/* Config */
const SKY = {
  discordInvite: "https://discord.gg/fVjtFAJD",
  youtubeUrl: "https://www.youtube.com/@Skythoria",
  contact: { webhook: "https://discord.com/api/webhooks/1403695213163053166/jOQRB2O-RQdwJmzhZLeeePRMmppkeZxS-xv7M4mGpSB_g0KLPamhxS_pkkNnv5VTilSh" },
  storeUrl: ""
};

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

function wireDiscordLinks() {
  document.querySelectorAll('a[data-discord], button[data-discord]').forEach(a => {
    if (a.tagName.toLowerCase()==='a') { a.href = SKY.discordInvite; a.target='_blank'; a.rel='noopener'; }
    else { a.addEventListener('click', () => window.open(SKY.discordInvite,'_blank','noopener')); }
  });
  const d1 = document.getElementById('discordLink'); if (d1) d1.href = SKY.discordInvite;
}

/* Banner rotator: supports banner_0, Banner_1, etc. */
function initBannerRotator() {
  const el = document.getElementById('banner-rotator'); if (!el) return;
  const folders = ['/assets/banners/','/assets/img/banners/'];
  const bases = ['banner','Banner','BANNER','banner_','Banner_','BANNER_'];
  const nums  = Array.from({length:20}, (_,i)=>String(i));
  const plain = ['banner','Banner','BANNER','header','Header','main','Main','hero','Hero'];
  const exts  = ['.webp','.png','.jpg','.jpeg'];
  const candidates = [];
  for (const f of folders) {
    for (const b of bases) for (const n of nums) for (const e of exts) candidates.push(f + b + n + e);
    for (const p of plain) for (const e of exts) candidates.push(f + p + e);
  }
  const loaded = [];
  function add(url){ loaded.push(url); if (loaded.length===1) start(); }
  function start(){
    const img = document.createElement('img');
    img.alt='Skythoria Banner'; img.decoding='async'; img.src = loaded[0];
    el.appendChild(img);
    let i=0; setInterval(()=>{ i=(i+1)%loaded.length; img.src = loaded[i]; }, 5000);
  }
  let foundAny=false;
  candidates.forEach(u => {
    const test = new Image();
    test.onload = () => { foundAny=true; add(u); };
    test.onerror = () => {};
    test.src = u + (u.includes('?')?'&':'?') + 'v=' + Date.now();
  });
  setTimeout(()=>{ if(!foundAny){ const ph=document.createElement('div'); ph.style.height='200px'; el.appendChild(ph);} }, 1500);
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
