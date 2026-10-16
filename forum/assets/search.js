/**
 * Recherche côté client – Fuse.js sur search-index.json
 */
(function () {
  let fuse = null;
  const input   = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  if (!input || !results) return;

  // Charger l'index au premier focus
  input.addEventListener('focus', loadIndex, { once: true });
  input.addEventListener('input', onInput);

  // Fermer avec Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.getElementById('search-overlay').classList.remove('active');
    }
  });

  async function loadIndex() {
    try {
      const res  = await fetch('search-index.json');
      const data = await res.json();
      fuse = new Fuse(data, {
        keys: [
          { name: 'title',     weight: 0.6 },
          { name: 'forumName', weight: 0.2 },
          { name: 'excerpt',   weight: 0.2 }
        ],
        threshold: 0.35,
        includeScore: true,
        minMatchCharLength: 2
      });
    } catch (err) {
      console.warn('Impossible de charger search-index.json', err);
    }
  }

  function onInput() {
    const q = input.value.trim();
    if (!fuse || q.length < 2) {
      results.innerHTML = '';
      results.classList.remove('visible');
      return;
    }

    const hits = fuse.search(q, { limit: 10 });
    if (hits.length === 0) {
      results.innerHTML = '<div class="search-empty">Aucun résultat pour « ' + esc(q) + ' »</div>';
      results.classList.add('visible');
      return;
    }

    results.innerHTML = hits.map(({ item }) => `
      <a href="${esc(item.url)}" class="search-result-item">
        <div class="sr-title">${esc(item.title)}</div>
        <div class="sr-forum">${esc(item.forumName)}</div>
        <div class="sr-excerpt">${esc(item.excerpt)}</div>
      </a>
    `).join('');
    results.classList.add('visible');
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
