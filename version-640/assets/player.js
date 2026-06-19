(function() {
    window.initMoviePlayer = function(videoUrl) {
        var video = document.getElementById("movieVideo");
        var button = document.getElementById("playerStart");
        var hlsInstance = null;
        var attached = false;

        if (!video || !videoUrl) {
            return;
        }

        function attachVideo() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }
        }

        function startPlayback() {
            attachVideo();

            if (button) {
                button.classList.add("is-hidden");
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function() {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", startPlayback);
        }

        video.addEventListener("click", function() {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener("play", function() {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function() {
            if (button && video.currentTime === 0) {
                button.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function() {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
