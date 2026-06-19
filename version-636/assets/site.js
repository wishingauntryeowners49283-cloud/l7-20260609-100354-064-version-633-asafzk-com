(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = parseInt(dot.getAttribute("data-hero-dot"), 10);
                if (!Number.isNaN(next)) {
                    show(next);
                    start();
                }
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function yearMatches(cardYear, filterYear) {
        if (!filterYear || filterYear === "all") {
            return true;
        }
        var parsed = parseInt(cardYear, 10);
        if (filterYear === "older") {
            return parsed > 0 && parsed < 2020;
        }
        return cardYear.indexOf(filterYear) !== -1;
    }

    function applyFilter(scope) {
        var panel = scope.querySelector("[data-filter-panel]");
        if (!panel) {
            return;
        }
        var searchInput = panel.querySelector("[data-search-input]");
        var categorySelect = panel.querySelector("[data-category-filter]");
        var yearSelect = panel.querySelector("[data-year-filter]");
        var state = panel.querySelector("[data-filter-state]");
        var query = normalize(searchInput ? searchInput.value : "");
        var category = categorySelect ? categorySelect.value : "all";
        var year = yearSelect ? yearSelect.value : "all";
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-text"));
            var cardCategory = card.getAttribute("data-category") || "";
            var cardYear = card.getAttribute("data-year") || "";
            var matchesSearch = !query || text.indexOf(query) !== -1;
            var matchesCategory = !category || category === "all" || cardCategory === category;
            var matchesYear = yearMatches(cardYear, year);
            var shouldShow = matchesSearch && matchesCategory && matchesYear;
            card.hidden = !shouldShow;
            if (shouldShow) {
                visible += 1;
            }
        });

        if (state) {
            state.textContent = visible > 0 ? "正在显示匹配影片" : "未找到匹配影片";
        }
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
        scopes.forEach(function (scope) {
            var panel = scope.querySelector("[data-filter-panel]");
            if (!panel) {
                return;
            }
            var controls = Array.prototype.slice.call(panel.querySelectorAll("input, select"));
            var reset = panel.querySelector("[data-filter-reset]");
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            var searchInput = panel.querySelector("[data-search-input]");

            if (q && searchInput) {
                searchInput.value = q;
            }

            controls.forEach(function (control) {
                control.addEventListener("input", function () {
                    applyFilter(scope);
                });
                control.addEventListener("change", function () {
                    applyFilter(scope);
                });
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    controls.forEach(function (control) {
                        if (control.tagName === "SELECT") {
                            control.value = "all";
                        } else {
                            control.value = "";
                        }
                    });
                    applyFilter(scope);
                });
            }

            applyFilter(scope);
        });
    }

    function initQuickSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-quick-search]"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var q = input ? input.value.trim() : "";
                var target = q ? "library.html?q=" + encodeURIComponent(q) : "library.html";
                window.location.href = target;
            });
        });
    }

    function attachPlayer(video, cover, source) {
        var loaded = false;
        var hlsInstance = null;

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            load();
            if (cover) {
                cover.hidden = true;
            }
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.hidden = true;
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }

    window.SitePlayer = {
        init: function (videoId, coverId, source) {
            var video = document.getElementById(videoId);
            var cover = document.getElementById(coverId);
            if (!video || !source) {
                return;
            }
            attachPlayer(video, cover, source);
        }
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initQuickSearch();
    });
})();
