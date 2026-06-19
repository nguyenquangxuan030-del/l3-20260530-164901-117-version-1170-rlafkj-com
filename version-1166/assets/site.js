(function () {
    var MovieSite = {};

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var header = document.querySelector(".site-header");
        var button = document.querySelector(".nav-toggle");
        if (!header || !button) {
            return;
        }
        button.addEventListener("click", function () {
            var opened = header.classList.toggle("is-open");
            button.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(dotIndex);
                start();
            });
        });

        show(0);
        start();
    }

    function initLocalFilter() {
        var input = document.querySelector("[data-filter-input]");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        input.addEventListener("input", function () {
            var keyword = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                card.style.display = text.indexOf(keyword) === -1 ? "none" : "";
            });
        });
    }

    function createSearchCard(item) {
        var article = document.createElement("article");
        article.className = "search-card fade-in";
        article.innerHTML = [
            '<a class="search-card-image" href="' + item.url + '">',
            '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '">',
            '</a>',
            '<div>',
            '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
            '<p>' + escapeHtml(item.oneLine) + '</p>',
            '<div class="movie-meta-line">',
            '<span>' + escapeHtml(item.year) + '</span>',
            '<span>' + escapeHtml(item.region) + '</span>',
            '<span>' + escapeHtml(item.genre) + '</span>',
            '</div>',
            '</div>'
        ].join("");
        return article;
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function initSearchPage() {
        var results = document.getElementById("search-results");
        var queryInput = document.getElementById("search-query");
        if (!results || !queryInput || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        queryInput.value = query;
        renderSearch(query);

        var form = document.getElementById("search-page-form");
        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var nextQuery = queryInput.value.trim();
                var nextUrl = nextQuery ? "./search.html?q=" + encodeURIComponent(nextQuery) : "./search.html";
                window.history.replaceState({}, "", nextUrl);
                renderSearch(nextQuery);
            });
        }
    }

    function renderSearch(query) {
        var results = document.getElementById("search-results");
        if (!results) {
            return;
        }
        var normalized = String(query || "").trim().toLowerCase();
        results.innerHTML = "";
        if (!normalized) {
            var empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = "输入片名、题材、地区或标签，快速查找想看的影片。";
            results.appendChild(empty);
            return;
        }
        var terms = normalized.split(/\s+/).filter(Boolean);
        var matches = window.SEARCH_INDEX.filter(function (item) {
            var haystack = [item.title, item.oneLine, item.region, item.type, item.genre, item.tags].join(" ").toLowerCase();
            return terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
        }).slice(0, 120);
        if (!matches.length) {
            var none = document.createElement("div");
            none.className = "empty-state";
            none.textContent = "没有找到匹配影片，可以尝试更短的关键词。";
            results.appendChild(none);
            return;
        }
        matches.forEach(function (item) {
            results.appendChild(createSearchCard(item));
        });
    }

    MovieSite.player = function (url) {
        var video = document.getElementById("movie-player");
        var button = document.getElementById("movie-play-button");
        var shell = document.getElementById("movie-player-shell");
        if (!video || !button || !url) {
            return;
        }
        var attached = false;
        var hlsInstance = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();
            button.classList.add("is-hidden");
            var result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            play();
        });

        if (shell) {
            shell.addEventListener("click", function (event) {
                if (event.target === video || event.target === shell) {
                    play();
                }
            });
        }

        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                button.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initLocalFilter();
        initSearchPage();
    });

    window.MovieSite = MovieSite;
})();
