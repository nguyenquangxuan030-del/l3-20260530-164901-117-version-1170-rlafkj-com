import { H as Hls } from './hls-dru42stk.js';

document.addEventListener('DOMContentLoaded', function () {
  var card = document.querySelector('[data-stream]');
  if (!card) {
    return;
  }

  var shell = card.querySelector('.player-shell');
  var video = card.querySelector('video');
  var button = card.querySelector('[data-play]');
  var stream = card.getAttribute('data-stream');
  var hasAttached = false;
  var hlsInstance = null;

  function attachStream() {
    if (!video || !stream || hasAttached) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      hasAttached = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      hasAttached = true;
      return;
    }

    video.src = stream;
    hasAttached = true;
  }

  function startPlayback() {
    attachStream();
    if (!video) {
      return;
    }
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('play', function () {
      card.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        card.classList.remove('is-playing');
      }
    });
    video.addEventListener('error', function () {
      card.classList.remove('is-playing');
      if (shell) {
        shell.classList.add('has-error');
      }
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      hasAttached = false;
    });
  }
});
