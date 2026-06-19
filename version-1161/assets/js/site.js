(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var header = document.querySelector('[data-header]');
        var menuButton = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-nav]');

        function updateHeader() {
            if (!header) {
                return;
            }
            header.classList.toggle('is-scrolled', window.scrollY > 24);
        }

        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });

        if (menuButton && nav) {
            menuButton.addEventListener('click', function () {
                document.body.classList.toggle('is-menu-open');
            });

            nav.addEventListener('click', function (event) {
                if (event.target && event.target.matches('a')) {
                    document.body.classList.remove('is-menu-open');
                }
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var current = 0;

            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    showSlide(index);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(current + 1);
                }, 5600);
            }
        }

        var searchInput = document.querySelector('[data-search-input]');
        var filterButtons = document.querySelector('[data-filter-buttons]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            if (!cards.length) {
                return;
            }

            var keyword = normalize(searchInput ? searchInput.value : '');
            var activeButton = filterButtons ? filterButtons.querySelector('button.is-active') : null;
            var filter = activeButton ? activeButton.getAttribute('data-filter') : 'all';

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var category = card.getAttribute('data-category');
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedFilter = filter === 'all' || category === filter;
                card.classList.toggle('is-hidden', !(matchedKeyword && matchedFilter));
            });
        }

        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query) {
                searchInput.value = query;
            }
            searchInput.addEventListener('input', applyFilters);
        }

        if (filterButtons) {
            filterButtons.addEventListener('click', function (event) {
                var button = event.target.closest('button[data-filter]');
                if (!button) {
                    return;
                }
                filterButtons.querySelectorAll('button').forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                applyFilters();
            });
        }

        applyFilters();
    });
})();
