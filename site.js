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
