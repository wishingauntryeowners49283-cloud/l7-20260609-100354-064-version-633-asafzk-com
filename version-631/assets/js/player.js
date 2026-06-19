(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setStatus(text, isError) {
        var status = document.querySelector("[data-player-status]");

        if (!status) {
            return;
        }

        status.textContent = text;
        status.style.color = isError ? "#dc2626" : "";
    }

    function playVideo(video, source) {
        if (!video || !source) {
            setStatus("没有检测到播放源。", true);
            return;
        }

        var shell = video.closest(".player-shell");

        function startPlayback() {
            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    setStatus("浏览器阻止了自动播放，请再次点击播放按钮。", true);
                });
            }

            if (shell) {
                shell.classList.add("is-playing");
            }

            setStatus("正在加载播放源，请稍候。", false);
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            startPlayback();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);

            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                startPlayback();
            });

            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setStatus("播放源加载失败，请检查网络或更换 m3u8 地址。", true);
                    hls.destroy();
                }
            });

            return;
        }

        setStatus("当前浏览器不支持 HLS 播放，请换用 Safari、Edge、Chrome 或支持 HLS 的浏览器。", true);
    }

    ready(function () {
        var video = document.querySelector("[data-hls-player]");
        var button = document.querySelector("[data-player-start]");

        if (!video || !button) {
            return;
        }

        var source = video.getAttribute("data-src");

        button.addEventListener("click", function () {
            playVideo(video, source);
        });

        video.addEventListener("playing", function () {
            var shell = video.closest(".player-shell");
            if (shell) {
                shell.classList.add("is-playing");
            }
        });

        video.addEventListener("pause", function () {
            var shell = video.closest(".player-shell");
            if (shell && video.currentTime === 0) {
                shell.classList.remove("is-playing");
            }
        });
    });
}());
