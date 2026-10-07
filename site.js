(() => {
  if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') return;
  const routes = {
    research: '/research/#research', resources: '/research/#resources',
    publications: '/publications/#publications', people: '/people/#people',
    ddkg: '/research/#ddkg', dulca: '/research/#dulca', devmap: '/research/#devmap',
    devgraph: '/research/#devgraph', 'ai-ml': '/research/#ai-ml',
    physics: '/research/#physics', biophysics: '/research/#biophysics'
  };
  const routeLegacyAnchor = () => {
    const target = routes[window.location.hash.slice(1)];
    if (target) window.location.replace(target);
  };
  window.addEventListener('hashchange', routeLegacyAnchor);
  routeLegacyAnchor();
})();

(() => {
  const button = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('main-nav');
  if (!button || !navigation) return;
  const closeMenu = () => { button.setAttribute('aria-expanded', 'false'); navigation.classList.remove('is-open'); };
  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    navigation.classList.toggle('is-open', !expanded);
  });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') { closeMenu(); button.focus(); } });
  window.matchMedia('(min-width: 851px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
})();
