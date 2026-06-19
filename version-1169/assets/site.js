(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startHero();
        });
    });

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startHero();
        });
    }

    startHero();

    var searchInput = document.querySelector('[data-search-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var countNode = document.querySelector('[data-result-count]');

    function filterCards() {
        if (!cards.length) {
            return;
        }

        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var selectedYear = yearSelect ? yearSelect.value : '';
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
            var year = card.getAttribute('data-year') || '';
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedYear = !selectedYear || year === selectedYear;
            var show = matchedKeyword && matchedYear;

            card.style.display = show ? '' : 'none';

            if (show) {
                visibleCount += 1;
            }
        });

        if (countNode) {
            countNode.textContent = String(visibleCount);
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterCards);
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', filterCards);
    }

    filterCards();

    var player = document.querySelector('[data-player]');
    var overlay = document.querySelector('[data-play-overlay]');
    var config = document.getElementById('player-config');

    function loadHls(callback) {
        if (window.Hls) {
            callback();
            return;
        }

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    function readPlayerSource() {
        if (!config) {
            return '';
        }

        try {
            var data = JSON.parse(config.textContent || '{}');
            return data.src || '';
        } catch (error) {
            return '';
        }
    }

    function attachSource(source, done) {
        if (!player || !source) {
            return;
        }

        if (player.canPlayType('application/vnd.apple.mpegurl')) {
            if (player.getAttribute('src') !== source) {
                player.setAttribute('src', source);
            }
            done();
            return;
        }

        loadHls(function () {
            if (window.Hls && window.Hls.isSupported()) {
                if (!player._siteHls) {
                    player._siteHls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    player._siteHls.attachMedia(player);
                }
                player._siteHls.loadSource(source);
                done();
            } else {
                player.setAttribute('src', source);
                done();
            }
        });
    }

    function startPlayback() {
        var source = readPlayerSource();

        if (!player || !source) {
            return;
        }

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        attachSource(source, function () {
            var playAction = player.play();

            if (playAction && typeof playAction.catch === 'function') {
                playAction.catch(function () {});
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    if (player) {
        player.addEventListener('click', function () {
            if (!player.getAttribute('src') && !player._siteHls) {
                startPlayback();
            }
        });
    }
})();
