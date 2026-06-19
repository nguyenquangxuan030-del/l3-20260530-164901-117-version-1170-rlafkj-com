(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector(".menu-toggle");
    if (menuButton) {
      menuButton.addEventListener("click", function () {
        document.body.classList.toggle("menu-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector(".hero-prev");
      var next = hero.querySelector(".hero-next");
      var current = 0;
      var timer = null;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-slide") || 0));
          restart();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          restart();
        });
      }

      restart();
    }

    var searchInput = document.querySelector("[data-search-input]");
    var list = document.querySelector("[data-card-list]");
    if (searchInput && list) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      searchInput.value = initial;

      function filterCards() {
        var query = searchInput.value.trim().toLowerCase();
        var cards = list.querySelectorAll(".movie-card");
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase() + " " + Array.prototype.map.call(card.attributes, function (attr) {
            return attr.value.toLowerCase();
          }).join(" ");
          card.classList.toggle("is-hidden", query !== "" && text.indexOf(query) === -1);
        });
      }

      searchInput.addEventListener("input", filterCards);
      filterCards();
    }
  });
})();
