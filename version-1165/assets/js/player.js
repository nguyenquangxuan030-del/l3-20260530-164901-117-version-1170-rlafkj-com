(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var src = shell.getAttribute("data-src");
      var hls = null;

      function attach() {
        if (!video || !src || video.getAttribute("data-loaded") === "true") {
          return;
        }
        video.setAttribute("data-loaded", "true");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function play() {
        attach();
        shell.classList.add("is-playing");
        video.controls = true;
        var started = video.play();
        if (started && typeof started.catch === "function") {
          started.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0) {
            shell.classList.remove("is-playing");
          }
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
