(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;

    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    if (slides.length > 1) {
      var timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);

      var restart = function () {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5000);
      };

      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')));
          restart();
        });
      });
    }
  }

  var normalize = function (value) {
    return (value || '').toString().trim().toLowerCase();
  };

  var getCards = function () {
    return Array.prototype.slice.call(document.querySelectorAll('[data-card-list] .movie-card, [data-card-list] .rank-item'));
  };

  var emptyState = document.querySelector('[data-empty-state]');
  var activeCategory = 'all';

  var applyFilter = function () {
    var queryInput = document.querySelector('[data-local-search]');
    var query = normalize(queryInput ? queryInput.value : '');
    var visible = 0;

    getCards().forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' '));
      var category = card.getAttribute('data-category') || '';
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesCategory = activeCategory === 'all' || category === activeCategory;
      var shouldShow = matchesQuery && matchesCategory;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  };

  var localInputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-search]'));
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  localInputs.forEach(function (input) {
    if (query) {
      input.value = query;
    }
    input.addEventListener('input', applyFilter);
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]')).forEach(function (button) {
    button.addEventListener('click', function () {
      activeCategory = button.getAttribute('data-filter-button') || 'all';
      Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]')).forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilter();
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = new URL(form.getAttribute('action'), window.location.href);
      if (value) {
        target.searchParams.set('q', value);
      }
      window.location.href = target.toString();
    });
  });

  if (localInputs.length || query) {
    applyFilter();
  }
})();
