(() => {
  const controls = document.getElementById('catalog-controls');
  if (!controls) return;
  const search = document.getElementById('publication-search');
  const buttons = Array.from(document.querySelectorAll('.topic-button'));
  const more = document.getElementById('show-more');
  const records = Array.from(document.querySelectorAll('.catalog-record')).map(el => ({
    el, text: el.textContent.toLocaleLowerCase(), methods: JSON.parse(el.dataset.methods), domains: JSON.parse(el.dataset.domains)
  }));
  const selected = {methods: '', domains: ''};
  let limit = 20;
  const apply = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const matched = records.filter(r => (!query || r.text.includes(query)) &&
      (!selected.methods || r.methods.includes(selected.methods)) && (!selected.domains || r.domains.includes(selected.domains)));
    const visible = new Set(matched.slice(0, limit));
    records.forEach(r => { r.el.hidden = !visible.has(r); });
    buttons.forEach(b => b.setAttribute('aria-pressed', String(selected[b.dataset.group] === b.dataset.topic)));
    document.getElementById('catalog-status').textContent = `${matched.length} matching records · showing ${Math.min(limit, matched.length)}`;
    document.getElementById('catalog-empty').hidden = matched.length !== 0;
    more.hidden = matched.length <= limit;
    more.textContent = `Show ${Math.min(20, matched.length - limit)} more publications`;
  };
  search.addEventListener('input', () => { limit = 20; apply(); });
  buttons.forEach(b => b.addEventListener('click', () => {
    selected[b.dataset.group] = selected[b.dataset.group] === b.dataset.topic ? '' : b.dataset.topic;
    limit = 20; apply();
  }));
  more.addEventListener('click', () => {
    const oldVisible = new Set(records.filter(r => !r.el.hidden));
    limit += 20; apply();
    const next = records.find(r => !r.el.hidden && !oldVisible.has(r));
    if (next) { next.el.tabIndex = -1; next.el.focus(); }
  });
  document.getElementById('clear-filters').addEventListener('click', () => {
    search.value = ''; selected.methods = ''; selected.domains = ''; limit = 20; apply();
  });
  if (window.matchMedia('(max-width: 700px)').matches) document.querySelectorAll('.topic-group').forEach(el => { el.open = false; });
  controls.hidden = false;
  apply();
})();
