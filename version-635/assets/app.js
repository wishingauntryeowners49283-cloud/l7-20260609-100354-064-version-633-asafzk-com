(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));
        forms.forEach(function (form) {
            var scope = form.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var empty = scope.querySelector('[data-filter-empty]');
            var search = form.querySelector('[data-filter-search]');
            var region = form.querySelector('[data-filter-region]');
            var type = form.querySelector('[data-filter-type]');
            var year = form.querySelector('[data-filter-year]');
            var params = new URLSearchParams(window.location.search);
            if (search && params.get('q')) {
                search.value = params.get('q');
            }

            function value(element) {
                return element ? element.value.trim().toLowerCase() : '';
            }

            function apply() {
                var query = value(search);
                var regionValue = value(region);
                var typeValue = value(type);
                var yearValue = value(year);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags')
                    ].join(' ').toLowerCase();
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesRegion = !regionValue || (card.getAttribute('data-region') || '').toLowerCase() === regionValue;
                    var matchesType = !typeValue || (card.getAttribute('data-type') || '').toLowerCase() === typeValue;
                    var matchesYear = !yearValue || (card.getAttribute('data-year') || '').toLowerCase() === yearValue;
                    var isVisible = matchesQuery && matchesRegion && matchesType && matchesYear;
                    card.style.display = isVisible ? '' : 'none';
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            form.addEventListener('input', apply);
            form.addEventListener('change', apply);
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                apply();
            });
            apply();
        });
    }

    window.initMoviePlayer = function (streamUrl, videoId) {
        var video = document.getElementById(videoId);
        if (!video) {
            return;
        }
        var shell = video.closest('[data-player]');
        var overlay = shell ? shell.querySelector('.player-overlay') : null;
        var attached = false;
        var hlsPlayer = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsPlayer = new window.Hls({ enableWorker: true });
                hlsPlayer.loadSource(streamUrl);
                hlsPlayer.attachMedia(video);
                return;
            }
            video.src = streamUrl;
        }

        function start() {
            attach();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            video.controls = true;
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
