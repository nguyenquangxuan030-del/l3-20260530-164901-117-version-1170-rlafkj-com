(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-player-button]');

    if (!video || !button) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var hls = null;

    var prepare = function () {
      if (video.getAttribute('data-ready') === '1') {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }

      video.setAttribute('data-ready', '1');
    };

    var play = function () {
      prepare();
      box.classList.add('is-playing');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    };

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      box.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
