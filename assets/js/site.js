
/* Skythoria website JS — FULL CORE PP3 */
const SKY = {
  discordInvite: "https://discord.gg/fVjtFAJD",
  youtubeUrl: "https://www.youtube.com/@Skythoria",
  contact: { webhook: "https://discord.com/api/webhooks/1403695213163053166/jOQRB2O-RQdwJmzhZLeeePRMmppkeZxS-xv7M4mGpSB_g0KLPamhxS_pkkNnv5VTilSh" },
  serverHost: "skythoria.ooguy.com"
};

let SKY_STATUS = "checking"; // online | offline | checking
const SKY_STATUS_BANNER = { online:"banner_0.png", offline:"banner_3.png", checking:"banner_4.png" };

/* Nav */
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

/* Banner: status-based, no fade */
let _bannerImgEl = null;
function preload(url) {
  return new Promise(res => {
    const t = new Image();
    t.onload = () => res({ ok: true, url });
    t.onerror = () => res({ ok: false, url });
    t.src = url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();
  });
}
async function setBannerForStatus(status) {
  const name = (SKY_STATUS_BANNER[status] || SKY_STATUS_BANNER.checking);
  const url = `/assets/banners/${name}`;
  const r = await preload(url);
  if (!_bannerImgEl) return;
  if (r.ok) _bannerImgEl.src = url + `?t=${Date.now()}`;
}
async function initBannerStatic() {
  const wrap = document.getElementById('banner-rotator'); if (!wrap) return;
  const first = `/assets/banners/${(SKY_STATUS_BANNER.checking || 'banner_0.png')}`;
  _bannerImgEl = document.createElement('img');
  _bannerImgEl.alt = 'Skythoria Banner';
  _bannerImgEl.decoding = 'async';
  _bannerImgEl.src = first + `?t=${Date.now()}`;
  wrap.appendChild(_bannerImgEl);
}

/* Server status + MOTD overlay */
async function renderServerStatus() {
  const box = document.getElementById('serverStatus'); if (!box) return;
  const host = SKY.serverHost;
  box.innerHTML = `<div class="status"><span class="light yellow"></span><div>Checking status…</div></div>`;
  const ov = document.getElementById('banner-overlay');
  async function get(u){ const r=await fetch(u,{cache:'no-cache'}); if(!r.ok) throw 0; return r.json(); }
  try {
    let data; try { data = await get(`https://api.mcsrvstat.us/3/${host}`); } catch { data = await get(`https://api.mcsrvstat.us/2/${host}`); }
    if (data && data.online) {
      SKY_STATUS = "online";
      const players = (data.players && data.players.online) || 0;
      box.innerHTML = `<div class="status"><span class="light green"></span><div><strong>Online</strong> — ${players} player${players===1?'':'s'} online</div></div>`;
      const motd = (data.motd && (data.motd.clean||data.motd)) ? ((data.motd.clean||[]).join ? (data.motd.clean||[]).join(' ') : data.motd) : '';
      if (ov) ov.textContent = motd || '';
    } else {
      SKY_STATUS = "offline";
      box.innerHTML = `<div class="status"><span class="light red"></span><div><strong>Offline</strong> — ${host}</div></div>`;
      if (ov) ov.textContent = '';
    }
  } catch {
    SKY_STATUS = "checking";
    box.innerHTML = `<div class="status"><span class="light yellow"></span><div>Status unavailable (cache). Try again soon.</div></div>`;
    if (ov) ov.textContent = '';
  }
  setBannerForStatus(SKY_STATUS);
}

/* Contact (Discord webhook) */
function initContactForm() {
  const form = document.getElementById('contactForm'); if (!form) return;
  const status = document.getElementById('contactStatus');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = { username: "Skythoria Tickets",
      embeds: [{ title: (data.subject||"Player Ticket"), description: (data.message||"").trim(), color: 0xe53935,
        fields: [{ name: "Player", value: (data.ign||"unknown"), inline: true }, { name: "Reply Email", value: (data.email||"unknown"), inline: true }],
        timestamp: new Date().toISOString(), footer: { text: "Skythoria website ticket" } }] };
    try {
      status.textContent = "Sending...";
      const res = await fetch(SKY.contact.webhook, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (!res.ok) throw 0;
      form.reset(); status.innerHTML = `<span class="badge">Ticket sent to staff Discord</span>`;
    } catch { status.textContent = "Failed to send. Try again later."; }
  });
}

/* Latest news (homepage) */
async function renderLatestNews() {
  const box = document.getElementById('latestNews'); if (!box) return;
  try {
    const r = await fetch('/assets/data/news.json', {cache:'no-cache'});
    const posts = await r.json();
    if (!Array.isArray(posts) || !posts.length) return;
    const p = posts[0];
    box.innerHTML = `<div class="card latest"><div><div class="badge">${p.date}</div><h3 style="margin:.4rem 0 .3rem">${p.title}</h3><p style="margin:0">${p.body}</p></div></div>`;
  } catch {}
}

/* Boot */
document.addEventListener('DOMContentLoaded', () => {
  markActive();
  wireDiscordLinks();
  initBannerStatic();
  renderServerStatus();
  renderLatestNews();
  initContactForm();
});
