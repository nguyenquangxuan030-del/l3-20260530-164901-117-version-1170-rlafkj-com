(function () {
  function attach(video, url) {
    if (!video || !url || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.setAttribute('data-ready', '1');
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video.hls = hls;
      video.setAttribute('data-ready', '1');
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('.video-cover');
    if (!video || !button) {
      return;
    }

    const url = video.getAttribute('data-play');

    function begin() {
      attach(video, url);
      player.classList.add('is-playing');
      video.controls = true;
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    button.addEventListener('click', begin);
    video.addEventListener('click', function () {
      if (video.getAttribute('data-ready') !== '1') {
        begin();
      }
    });
  });
})();
