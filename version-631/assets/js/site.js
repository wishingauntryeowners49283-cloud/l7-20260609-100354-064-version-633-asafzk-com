(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function normalizeText(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupNavigation() {
        var button = document.querySelector(".nav-toggle");
        var links = document.querySelector(".nav-links");

        if (!button || !links) {
            return;
        }

        button.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function setupImageFallback() {
        var images = document.querySelectorAll(".poster img, .hero-card img, .rank-thumb img, .aside-poster img");

        images.forEach(function (image) {
            image.addEventListener("error", function () {
                var parent = image.closest(".poster, .hero-card, .rank-thumb, .aside-poster");
                if (parent) {
                    parent.classList.add("is-fallback");
                }
            }, { once: true });

            if (image.complete && image.naturalWidth === 0) {
                image.dispatchEvent(new Event("error"));
            }
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");

        if (slides.length === 0) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFiltering() {
        var input = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var empty = document.querySelector("[data-empty-state]");
        var reset = document.querySelector("[data-filter-reset]");

        if (!input || cards.length === 0) {
            return;
        }

        function filterCards() {
            var query = normalizeText(input.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalizeText(card.getAttribute("data-index"));
                var matched = !query || haystack.indexOf(query) !== -1;

                card.style.display = matched ? "" : "none";

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        input.addEventListener("input", filterCards);

        if (reset) {
            reset.addEventListener("click", function () {
                input.value = "";
                filterCards();
                input.focus();
            });
        }

        filterCards();
    }

    function setupBackTop() {
        var button = document.querySelector("[data-back-top]");

        if (!button) {
            return;
        }

        window.addEventListener("scroll", function () {
            button.classList.toggle("is-visible", window.scrollY > 500);
        });

        button.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupImageFallback();
        setupHero();
        setupFiltering();
        setupBackTop();
    });
}());
