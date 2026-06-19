(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".site-nav");

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupGlobalSearch() {
        var forms = document.querySelectorAll("[data-global-search]");

        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();

                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";

                if (query) {
                    window.location.href = "./library.html?q=" + encodeURIComponent(query);
                } else {
                    window.location.href = "./library.html";
                }
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

        if (!slides.length || !dots.length) {
            return;
        }

        var current = 0;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
            });
        });

        window.setInterval(function () {
            show(current + 1);
        }, 5600);
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty-state]");

        if (!cards.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : "";
            var selectedYear = year ? year.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var matchesQuery = !query || haystack.indexOf(query) !== -1;
                var matchesYear = !selectedYear || cardYear === selectedYear;
                var isVisible = matchesQuery && matchesYear;

                card.style.display = isVisible ? "" : "none";

                if (isVisible) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            input.addEventListener("input", apply);
        }

        if (year) {
            year.addEventListener("change", apply);
        }

        apply();
    }

    function setupPlayers() {
        var players = document.querySelectorAll(".player-shell");

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            var url = player.getAttribute("data-play");
            var attached = false;
            var hlsInstance = null;

            if (!video || !url) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = url;
                    attached = true;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(video);
                    attached = true;
                    return;
                }

                video.src = url;
                attached = true;
            }

            function start() {
                attach();

                if (cover) {
                    cover.hidden = true;
                }

                video.controls = true;
                video.play().catch(function () {});
            }

            if (cover) {
                cover.addEventListener("click", start);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupGlobalSearch();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
