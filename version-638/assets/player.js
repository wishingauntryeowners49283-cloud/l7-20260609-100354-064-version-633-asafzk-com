(function () {
  function initMoviePlayer(source) {
    var video = document.querySelector(".movie-player");
    var overlay = document.querySelector(".player-overlay");
    var hlsInstance = null;
    var prepared = false;

    if (!video || !overlay || !source) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function play() {
      prepare();
      overlay.classList.add("is-hidden");

      var playback = video.play();

      if (playback && typeof playback.catch === "function") {
        playback.catch(function () {
          var retry = function () {
            video.removeEventListener("canplay", retry);
            video.play().catch(function () {
              overlay.classList.remove("is-hidden");
            });
          };

          video.addEventListener("canplay", retry);
        });
      }
    }

    overlay.addEventListener("click", play);

    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });

    video.addEventListener("ended", function () {
      overlay.classList.remove("is-hidden");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
