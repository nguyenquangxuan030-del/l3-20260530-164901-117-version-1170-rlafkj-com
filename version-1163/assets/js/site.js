(function () {
  const nav = document.querySelector('[data-nav]');
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  function setNavState() {
    if (!nav) {
      return;
    }
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  setNavState();
  window.addEventListener('scroll', setNavState, { passive: true });

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const value = input ? input.value.trim() : '';
      const target = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
      window.location.href = target;
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    let current = 0;
    let timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  });

  const filterInput = document.querySelector('[data-filter-input]');
  const filterYear = document.querySelector('[data-filter-year]');
  const filterCount = document.querySelector('[data-filter-count]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));

  if (filterInput && cards.length) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      filterInput.value = q;
    }

    function applyFilter() {
      const text = filterInput.value.trim().toLowerCase();
      const year = filterYear ? filterYear.value : '';
      let visible = 0;
      cards.forEach(function (card) {
        const meta = (card.getAttribute('data-meta') || '').toLowerCase();
        const cardYear = card.getAttribute('data-year') || '';
        const okText = !text || meta.indexOf(text) !== -1;
        const okYear = !year || cardYear === year;
        const ok = okText && okYear;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (filterCount) {
        filterCount.textContent = String(visible);
      }
    }

    filterInput.addEventListener('input', applyFilter);
    if (filterYear) {
      filterYear.addEventListener('change', applyFilter);
    }
    applyFilter();
  }
})();
