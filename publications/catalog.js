(() => {
  const controls = document.getElementById('catalog-controls');
  if (!controls) return;
  const search = document.getElementById('publication-search');
  const filters = Array.from(document.querySelectorAll('.catalog-topics select'));
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
    filters.forEach(select => {
      const group = select.dataset.group;
      const other = group === 'methods' ? 'domains' : 'methods';
      const compatible = records.filter(r => (!query || r.text.includes(query)) &&
        (!selected[other] || r[other].includes(selected[other])));
      Array.from(select.options).forEach(option => {
        const count = compatible.filter(r => !option.value || r[group].includes(option.value)).length;
        const label = option.value || (group === 'methods' ? 'All methods' : 'All research areas');
        option.textContent = `${label} (${count})`;
        // Keep the selected value and the broadening option available for recovery.
        option.disabled = !!option.value && count === 0 && option.value !== selected[group];
      });
      select.value = selected[group];
    });
    document.getElementById('catalog-status').textContent = `${matched.length} matching records · showing ${Math.min(limit, matched.length)}`;
    document.getElementById('catalog-empty').hidden = matched.length !== 0;
    document.getElementById('catalog-empty-message').textContent = query
      ? 'No records match this search with the selected topics. Clear the search, broaden a dropdown, or show all publications.'
      : 'No records currently carry both selected topic tags. Tags are provisional, so this does not establish a gap in the research. Broaden a dropdown or show all publications.';
    document.getElementById('clear-search').hidden = !query;
    more.hidden = matched.length <= limit;
    more.textContent = `Show ${Math.min(20, matched.length - limit)} more publications`;
  };
  search.addEventListener('input', () => { limit = 20; apply(); });
  filters.forEach(select => select.addEventListener('change', () => {
    selected[select.dataset.group] = select.value;
    limit = 20; apply();
  }));
  more.addEventListener('click', () => {
    const oldVisible = new Set(records.filter(r => !r.el.hidden));
    limit += 20; apply();
    const next = records.find(r => !r.el.hidden && !oldVisible.has(r));
    if (next) { next.el.tabIndex = -1; next.el.focus(); }
  });
  const reset = () => {
    search.value = ''; selected.methods = ''; selected.domains = ''; limit = 20; apply();
  };
  document.getElementById('clear-filters').addEventListener('click', reset);
  document.getElementById('empty-reset').addEventListener('click', reset);
  document.getElementById('clear-search').addEventListener('click', () => {
    search.value = ''; limit = 20; apply();
  });
  controls.hidden = false;
  apply();
})();
