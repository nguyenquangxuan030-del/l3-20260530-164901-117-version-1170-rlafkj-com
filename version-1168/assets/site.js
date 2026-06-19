(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const siteNav = document.querySelector('[data-site-nav]');

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  document.querySelectorAll('[data-play-video]').forEach(function (button) {
    button.addEventListener('click', function () {
      const target = document.getElementById(button.getAttribute('data-play-video'));
      if (!target) {
        return;
      }
      target.play().catch(function () {
        target.setAttribute('controls', 'controls');
      });
      button.style.display = 'none';
    });
  });

  document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
    const input = bar.querySelector('[data-filter-input]');
    const sort = bar.querySelector('[data-sort-select]');
    const scope = bar.closest('section') || document;
    const grid = scope.querySelector('[data-movie-grid]') || document.querySelector('[data-movie-grid]');
    const cards = grid ? Array.from(grid.querySelectorAll('[data-movie-card]')) : [];
    const empty = scope.querySelector('[data-empty-result]') || document.querySelector('[data-empty-result]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      const keyword = normalize(input ? input.value : '');
      let visibleCount = 0;
      cards.forEach(function (card) {
        const haystack = normalize(card.textContent + ' ' + card.dataset.title + ' ' + card.dataset.year + ' ' + card.dataset.region + ' ' + card.dataset.type);
        const visible = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });
      if (empty) {
        empty.style.display = visibleCount ? 'none' : 'block';
      }
    }

    function applySort() {
      if (!grid || !sort) {
        return;
      }
      const value = sort.value;
      cards.sort(function (a, b) {
        const ay = Number(a.dataset.year || 0);
        const by = Number(b.dataset.year || 0);
        const at = a.dataset.title || '';
        const bt = b.dataset.title || '';
        if (value === 'year-asc') {
          return ay - by || at.localeCompare(bt, 'zh-CN');
        }
        if (value === 'title-asc') {
          return at.localeCompare(bt, 'zh-CN');
        }
        return by - ay || at.localeCompare(bt, 'zh-CN');
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      applyFilter();
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (sort) {
      sort.addEventListener('change', applySort);
    }
    applySort();
  });
})();
