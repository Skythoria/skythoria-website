/* Skythoria website JS — PP2 */
const SKY = {
  discordInvite: "https://discord.gg/fVjtFAJD",
  youtubeUrl: "https://www.youtube.com/@Skythoria",
  contact: { webhook: "https://discord.com/api/webhooks/1403695213163053166/jOQRB2O-RQdwJmzhZLeeePRMmppkeZxS-xv7M4mGpSB_g0KLPamhxS_pkkNnv5VTilSh" },
  serverHost: "skythoria.ooguy.com"
};

let SKY_STATUS = "checking"; // "online" | "offline" | "checking"

/* ---------- Nav / Links ---------- */
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

/* ---------- Banner: fixed filenames, instant paint, non-blocking preload ---------- */
const SKY_BANNERS = ["banner_0.png","banner_1.png","banner_2.png","banner_3.png","banner_4.png"];

async function initBannerRotator() {
  const wrap = document.getElementById('banner-rotator'); if (!wrap) return;

  // 1) Paint first image immediately
  const img = document.createElement('img');
  img.alt = 'Skythoria Banner';
  img.decoding = 'async';
  img.style.transition = 'opacity .4s ease';
  img.src = `/assets/banners/${SKY_BANNERS[0]}?v=${Date.now()}`; // instant first frame
  wrap.appendChild(img);

  // 2) Choose which set to use by status (edit these indices to taste)
  const sets = {
    online:   [0,1,2],   // rotate these when server is online
    offline:  [3],       // show just one when offline (static)
    checking: [0,4]      // while checking, bounce between two
  };
  function pickSet() {
    const idxs = sets[SKY_STATUS] || [0,1,2,3,4];
    return idxs.filter(i => i>=0 && i<SKY_BANNERS.length);
  }

  // 3) Preload chosen images, then start rotation once we have 2+
  function preload(name) {
    return new Promise(res => {
      const t = new Image();
      t.onload  = () => res({ok:true,  src: `/assets/banners/${name}`});
      t.onerror = () => res({ok:false, src: `/assets/banners/${name}`});
      t.src = `/assets/banners/${name}?v=${Date.now()}`;
    });
  }

  async function startRotation() {
    const use = pickSet().map(i => SKY_BANNERS[i]);
    const loaded = [];
    for (const name of use) {
      const r = await preload(name);
      if (r.ok) loaded.push(r.src);
      if (loaded.length >= 6) break; // safety cap
    }
    if (loaded.length <= 1) return; // keep static if only 1 ready

    let i = 0;
    setInterval(() => {
      i = (i + 1) % loaded.length;
      img.style.opacity = '0.2';
      setTimeout(() => {
        img.src = loaded[i] + `?t=${Date.now()}`; // bust any edge cache
        img.style.opacity = '1';
      }, 180);
    }, 6000);
  }

  startRotation();
}

/* ---------- Server status (traffic lights) + MOTD overlay ---------- */
async function renderServerStatus() {
  const box = document.getElementById('serverStatus'); if (!box) return;
  const host = SKY.serverHost;
  box.innerHTML = `<div class="status"><span class="light yellow"></span><div>Checking status…</div></div>`;
  async function get(u){ const r=await fetch(u,{cache:'no-cache'}); if(!r.ok) throw 0; return r.json(); }
  try {
    let data; try { data = await get(`https://api.mcsrvstat.us/3/${host}`); } catch { data = await get(`https://api.mcsrvstat.us/2/${host}`); }
    if (data && data.online) {
      SKY_STATUS = "online";
      const players = (data.players && data.players.online) || 0;
      box.innerHTML = `<div class="status"><span class="light green"></span><div><strong>Online</strong> — ${players} player${players===1?'':'s'} online</div></div>`;
      // MOTD overlay (if present)
      const motd = (data.motd && (data.motd.clean||data.motd)) ? ((data.motd.clean||[]).join ? (data.motd.clean||[]).join(' ') : data.motd) : '';
      const ov = document.getElementById('banner-overlay');
      if (ov) ov.textContent = motd || '';
    } else {
      SKY_STATUS = "offline";
      box.innerHTML = `<div class="status"><span class="light red"></span><div><strong>Offline</strong> — ${host}</div></div>`;
    }
  } catch {
    SKY_STATUS = "checking";
    box.innerHTML = `<div class="status"><span class="light yellow"></span><div>Status unavailable (cache). Try again soon.</div></div>`;
  }
}

/* ---------- Contact (Discord webhook ticket) ---------- */
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
    } catch { status.textContent = "Failed to send. Try again later."; }
  });
}

/* ---------- Latest News (homepage preview) ---------- */
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

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', () => {
  markActive();
  wireDiscordLinks();
  renderServerStatus();     // sets SKY_STATUS
  initBannerRotator();      // reads SKY_STATUS to pick images
  renderLatestNews();
  initContactForm();
});
