
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
  let list = await manifest();
  if (!list) {
    const exts = ['.webp','.png','.jpg','.jpeg']; list = [];
    for (let i=0;i<=50;i++) {
      for (const e of exts) list.push('/assets/banners/banner_' + i + e);
      for (const e of exts) list.push('/assets/banners/Banner_' + i + e);
      for (const e of exts) list.push('/assets/banners/banner' + i + e);
      for (const e of exts) list.push('/assets/banners/Banner' + i + e);
    }
  }
  const found = [];
  for (const url of list) {
    await new Promise(res => {
      const t = new Image();
      t.onload = () => { found.push(url); res(); };
      t.onerror = () => res();
      t.src = url + (url.includes('?')?'&':'?') + 'v=' + Date.now();
    });
  }
  if (!found.length) { const ph=document.createElement('div'); ph.style.height='200px'; el.appendChild(ph); return; }
  const img = document.createElement('img');
  img.alt='Skythoria Banner'; img.decoding='async'; img.src = found[0];
  img.style.transition='opacity .4s ease'; el.appendChild(img);
  if (found.length>1) {
    let i=0; setInterval(()=>{
      i=(i+1)%found.length; img.style.opacity='0.2';
      setTimeout(()=>{ img.src=found[i]; img.style.opacity='1'; }, 180);
    }, 4500);
  }
}

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

document.addEventListener('DOMContentLoaded', () => {
  markActive();
  wireDiscordLinks();
  initBannerRotator();
  initContactForm();
});
