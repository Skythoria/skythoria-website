
/* HTML includes + active nav + root-safe links (GitHub Pages + CNAME). */
(function () {
  const BASE = '/';

  function fixRootLinks(scope) {
    scope.querySelectorAll('a[data-root]').forEach(a => {
      const href = a.getAttribute('href')||'/';
      if (!href.startsWith('http') && !href.startsWith('/')) {
        a.href = BASE + href.replace(/^\.?\//,'');
      }
    });
  }
  function markActive(scope) {
    const here = location.pathname.replace(/\/+$/,'') || '/';
    scope.querySelectorAll('nav a').forEach(a => {
      const href = (a.getAttribute('href')||'').replace(/\/+$/,'') || '/';
      if (href === here || (href !== '/' && here.startsWith(href))) a.classList.add('active');
    });
  }
  async function injectIncludes() {
    const parts = Array.from(document.querySelectorAll('[data-include]'));
    await Promise.all(parts.map(async el => {
      const url = el.getAttribute('data-include'); if (!url) return;
      try {
        const res = await fetch(url, {cache:'no-cache'}); if (!res.ok) throw 0;
        const html = await res.text(); el.outerHTML = html;
      } catch { console.warn('Include failed:', url); }
    }));
    fixRootLinks(document); markActive(document);
  }
  document.addEventListener('DOMContentLoaded', injectIncludes);
})();
