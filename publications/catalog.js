(() => {
  const controls = document.getElementById('catalog-controls');
  if (!controls) return;
  const search = document.getElementById('publication-search');
  const topic = document.getElementById('publication-topic');
  const more = document.getElementById('show-more');
  const records = Array.from(document.querySelectorAll('.catalog-record')).map(el => ({
    el, text: el.textContent.toLocaleLowerCase(), methods: JSON.parse(el.dataset.methods), domains: JSON.parse(el.dataset.domains)
  }));
  let selected = '';
  let limit = 20;
  const apply = () => {
    const query = search.value.trim().toLocaleLowerCase();
    const matched = records.filter(r => (!query || r.text.includes(query)) &&
      (!selected || r.methods.includes(selected) || r.domains.includes(selected)));
    const visible = new Set(matched.slice(0, limit));
    records.forEach(r => { r.el.hidden = !visible.has(r); });
    const searched = records.filter(r => !query || r.text.includes(query));
    Array.from(topic.options).forEach(option => {
      const count = searched.filter(r => !option.value || r.methods.includes(option.value) || r.domains.includes(option.value)).length;
      option.textContent = `${option.value || 'All publications'} (${count})`;
      option.disabled = !!option.value && count === 0 && option.value !== selected;
    });
    topic.value = selected;
    document.getElementById('catalog-status').textContent = `${matched.length} matching records · showing ${Math.min(limit, matched.length)}`;
    document.getElementById('catalog-empty').hidden = matched.length !== 0;
    document.getElementById('catalog-empty-message').textContent = query
      ? 'No records match this search within the selected topic. Clear the search, choose another topic, or show all publications.'
      : 'No records currently match this topic. Choose another topic or show all publications.';
    document.getElementById('clear-search').hidden = !query;
    more.hidden = matched.length <= limit;
    more.textContent = `Show ${Math.min(20, matched.length - limit)} more publications`;
  };
  search.addEventListener('input', () => { limit = 20; apply(); });
  topic.addEventListener('change', () => {
    selected = topic.value;
    limit = 20; apply();
  });
  more.addEventListener('click', () => {
    const oldVisible = new Set(records.filter(r => !r.el.hidden));
    limit += 20; apply();
    const next = records.find(r => !r.el.hidden && !oldVisible.has(r));
    if (next) { next.el.tabIndex = -1; next.el.focus(); }
  });
  const reset = () => {
    search.value = ''; selected = ''; limit = 20; apply();
  };
  document.getElementById('clear-filters').addEventListener('click', reset);
  document.getElementById('empty-reset').addEventListener('click', reset);
  document.getElementById('clear-search').addEventListener('click', () => {
    search.value = ''; limit = 20; apply();
  });
  controls.hidden = false;
  apply();
})();
