
const SKY = {
  discordInvite: "https://discord.gg/fVjtFAJD",
  youtubeUrl: "https://www.youtube.com/@Skythoria",
  contact: { webhook: "https://discord.com/api/webhooks/1403695213163053166/jOQRB2O-RQdwJmzhZLeeePRMmppkeZxS-xv7M4mGpSB_g0KLPamhxS_pkkNnv5VTilSh" },
  serverHost: "skythoria.ooguy.com"
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

/* Banners */
async function initBannerRotator() {
  const el = document.getElementById('banner-rotator'); if (!el) return;
  async function manifest() {
    try {
      const r = await fetch('/assets/banners/_list.json', {cache:'no-cache'});
      if (!r.ok) return null;
      const arr = await r.json();
      if (!Array.isArray(arr) || !arr.length) return null;
      return arr.map(x => '/assets/banners/' + x);
    } catch { return null; }
  }
  function candidates() {
    const folders = ['/assets/banners','/assets/img/banners'];
    const prefixes = ['banner_','Banner_','banner','Banner'];
    const generics = ['banner','Banner','header','Header','hero','Hero','main','Main'];
    const exts = ['.webp','.png','.jpg','.jpeg','.WEBP','.PNG','.JPG','.JPEG'];
    const list = [];
    for (const f of folders) {
      for (let i=0;i<=80;i++) for (const p of prefixes) for (const e of exts) list.push(`${f}/${p}${i}${e}`);
      for (const g of generics) for (const e of exts) list.push(`${f}/${g}${e}`);
    }
    return list;
  }
  const list = (await manifest()) || candidates();
  const loaded = [];
  async function preload(url) {
    return new Promise(res => {
      const t = new Image();
      t.onload = () => res({ok:true, url});
      t.onerror = () => res({ok:false, url});
      t.src = url + (url.includes('?')?'&':'?') + 'v=' + Date.now();
    });
  }
  for (const u of list) {
    if (loaded.length >= 12) break;
    const r = await preload(u);
    if (r.ok) loaded.push(r.url);
  }
  if (!loaded.length) { const ph=document.createElement('div'); ph.style.height='200px'; el.appendChild(ph); return; }
  const img = document.createElement('img');
  img.alt='Skythoria Banner'; img.decoding='async'; img.src = loaded[0];
  img.style.transition='opacity .4s ease'; el.appendChild(img);
  if (loaded.length === 1) return;
  let i=0;
  setInterval(()=>{ i=(i+1)%loaded.length; img.style.opacity='0.2';
    setTimeout(()=>{ img.src=loaded[i]; img.style.opacity='1'; }, 180);
  }, 4500);
}

/* Server status with traffic lights */
async function renderServerStatus() {
  const box = document.getElementById('serverStatus'); if (!box) return;
  const host = SKY.serverHost;
  box.innerHTML = `<div class="status"><span class="light yellow"></span><div>Checking status…</div></div>`;
  async function get(url) { const r = await fetch(url, {cache:'no-cache'}); if (!r.ok) throw 0; return r.json(); }
  try {
    let data; try { data = await get(`https://api.mcsrvstat.us/3/${host}`); } catch { data = await get(`https://api.mcsrvstat.us/2/${host}`); }
    if (data && data.online) {
      const players = (data.players && data.players.online) || 0;
      box.innerHTML = `<div class="status"><span class="light green"></span><div><strong>Online</strong> — ${players} player${players===1?'':'s'} online</div></div>` +
                      (data.motd && (data.motd.clean||data.motd) ? `<div class="help" style="margin-top:6px">${(data.motd.clean||[]).join ? (data.motd.clean||[]).join(' ') : data.motd}</div>` : '');
    } else {
      box.innerHTML = `<div class="status"><span class="light red"></span><div><strong>Offline</strong> — ${host}</div></div>`;
    }
  } catch {
    box.innerHTML = `<div class="status"><span class="light yellow"></span><div>Status unavailable right now (may be caching). Try again in a minute.</div></div>`;
  }
}

/* Contact */
function initContactForm() {
  const form = document.getElementById('contactForm'); if (!form) return;
  const status = document.getElementById('contactStatus');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const payload = { username: "Skythoria Tickets",
      embeds: [{ title: (data.subject||"Player Ticket"), description: (data.message||"").trim(), color: 0xe53935,
        fields: [{ name: "Player", value: (data.ign||"unknown"), inline: true }, { name: "Reply Email", value: (data.email||"unknown"), inline: true }],
        timestamp: new Date().toISOString(), footer: { text: "Skythoria website ticket" } }]
    };
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
    box.innerHTML = `<div class="card latest">
      <div>
        <div class="badge">${p.date}</div>
        <h3 style="margin:.4rem 0 .3rem">${p.title}</h3>
        <p style="margin:0">${p.body}</p>
      </div>
    </div>`;
  } catch {}
}

document.addEventListener('DOMContentLoaded', () => {
  markActive();
  wireDiscordLinks();
  initBannerRotator();
  renderServerStatus();
  renderLatestNews();
  initContactForm();
});
