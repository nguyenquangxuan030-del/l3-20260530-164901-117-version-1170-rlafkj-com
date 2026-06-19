(function () {
    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById('movie-player');
        var cover = document.querySelector('[data-player-cover]');
        var button = document.querySelector('[data-player-start]');
        var hlsInstance = null;
        var ready = false;

        function bindSource() {
            if (ready || !video || !sourceUrl) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            bindSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }
        if (button) {
            button.addEventListener('click', play);
        }
        if (video) {
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
