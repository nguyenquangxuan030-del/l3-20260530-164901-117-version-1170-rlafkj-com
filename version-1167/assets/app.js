(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-mobile-panel]');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            document.body.classList.toggle('no-scroll', panel.classList.contains('is-open'));
        });
    }

    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === current);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
            });
        });
        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    qsa('[data-local-filter]').forEach(function (input) {
        input.addEventListener('input', function () {
            var value = input.value.trim().toLowerCase();
            qsa('[data-card]').forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
            });
        });
    });

    function readQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get('q') || '').trim();
    }

    function createCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<article class="movie-card" data-card data-search="' + escapeHtml(item.search) + '">' +
            '<a class="poster-link" href="./' + item.url + '" aria-label="' + escapeHtml(item.title) + '">' +
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="poster-shade"></span><span class="play-mark">▶</span>' +
            '<span class="card-year">' + escapeHtml(item.year) + '</span></a>' +
            '<div class="card-body"><h3><a href="./' + item.url + '">' + escapeHtml(item.title) + '</a></h3>' +
            '<p class="card-meta">' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</p>' +
            '<p class="card-desc">' + escapeHtml(item.desc) + '</p><div class="tag-row">' + tags + '</div></div></article>';
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    var searchRoot = qs('[data-search-results]');
    if (searchRoot && Array.isArray(window.SEARCH_INDEX)) {
        var input = qs('[data-search-input]');
        var title = qs('[data-search-title]');
        var query = readQuery();
        if (input) {
            input.value = query;
        }
        var normalized = query.toLowerCase();
        var results = normalized ? window.SEARCH_INDEX.filter(function (item) {
            return item.search.toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 240) : [];
        if (title) {
            title.textContent = query ? '搜索：' + query : '影片搜索';
        }
        if (!query) {
            searchRoot.innerHTML = '<div class="empty-state">请输入关键词开始搜索</div>';
        } else if (!results.length) {
            searchRoot.innerHTML = '<div class="empty-state">没有找到匹配影片</div>';
        } else {
            searchRoot.innerHTML = '<div class="movie-grid">' + results.map(createCard).join('') + '</div>';
        }
    }
})();
