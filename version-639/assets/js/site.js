(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('.nav-toggle');
        var menu = document.querySelector('.nav-menu');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var minis = selectAll('[data-hero-mini]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function setSlide(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
            minis.forEach(function (mini, i) {
                mini.classList.toggle('is-active', i === index);
            });
        }
        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                setSlide(index + 1);
            }, 5600);
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                setSlide(Number(dot.getAttribute('data-hero-dot') || 0));
                play();
            });
        });
        minis.forEach(function (mini) {
            mini.addEventListener('mouseenter', function () {
                setSlide(Number(mini.getAttribute('data-hero-mini') || 0));
            });
        });
        setSlide(0);
        play();
    }

    function initFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-search-input]');
            var chips = selectAll('[data-filter]', scope);
            var cards = selectAll('[data-card]', scope);
            var activeFilter = 'all';
            function apply() {
                var query = input ? input.value.trim().toLowerCase() : '';
                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-keywords') || card.textContent || '').toLowerCase();
                    var byText = !query || text.indexOf(query) !== -1;
                    var byFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
                    card.classList.toggle('is-hidden-by-search', !(byText && byFilter));
                });
            }
            if (input) {
                input.addEventListener('input', apply);
            }
            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    activeFilter = chip.getAttribute('data-filter') || 'all';
                    chips.forEach(function (item) {
                        item.classList.toggle('is-active', item === chip);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    function initPlayer(src) {
        var video = document.querySelector('[data-player-video]');
        var frame = document.querySelector('[data-player-frame]');
        var trigger = document.querySelector('[data-play-trigger]');
        if (!video || !frame || !trigger || !src) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;
        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            video.controls = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }
        }
        function start() {
            attach();
            trigger.classList.add('is-hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }
        trigger.addEventListener('click', start);
        frame.addEventListener('click', function (event) {
            if (event.target === frame) {
                start();
            }
        });
        video.addEventListener('play', function () {
            trigger.classList.add('is-hidden');
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    }

    window.StaticSite = {
        start: function () {
            initMenu();
            initHero();
            initFilters();
        },
        initPlayer: initPlayer
    };
})();
