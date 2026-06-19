(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var video = document.querySelector('[data-player]');
        var button = document.querySelector('[data-play-button]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-play-url');
        var hlsInstance = null;
        var prepared = false;

        function hideButton() {
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        function prepare() {
            if (!source) {
                return;
            }

            if (prepared) {
                hideButton();
                video.play().catch(function () {});
                return;
            }

            prepared = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    video.play().catch(function () {});
                }, { once: true });
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });
            } else {
                video.src = source;
                video.play().catch(function () {});
            }

            hideButton();
        }

        if (button) {
            button.addEventListener('click', prepare);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                prepare();
            }
        });

        video.addEventListener('play', hideButton);

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
