(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function() {
                mobileNav.classList.toggle("open");
            });
        }

        var hero = document.querySelector("[data-hero-parallax]");
        if (hero) {
            var ticking = false;
            var updateHero = function() {
                var offset = Math.round(window.scrollY * 0.18);
                hero.style.backgroundPosition = "center calc(50% + " + offset + "px)";
                ticking = false;
            };
            window.addEventListener("scroll", function() {
                if (!ticking) {
                    window.requestAnimationFrame(updateHero);
                    ticking = true;
                }
            }, { passive: true });
        }

        var searchInput = document.querySelector("[data-search-input]");
        var filterSelects = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

        if (cards.length && (searchInput || filterSelects.length)) {
            var normalize = function(value) {
                return String(value || "").toLowerCase().replace(/\s+/g, "");
            };

            var applyFilters = function() {
                var query = normalize(searchInput ? searchInput.value : "");
                var values = {};

                filterSelects.forEach(function(select) {
                    values[select.getAttribute("data-filter")] = select.value;
                });

                cards.forEach(function(card) {
                    var text = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-tags")
                    ].join(" "));

                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesCategory = !values.category || card.getAttribute("data-category") === values.category;
                    var matchesYear = !values.year || card.getAttribute("data-year") === values.year;
                    var matchesType = !values.type || card.getAttribute("data-type") === values.type;

                    card.hidden = !(matchesQuery && matchesCategory && matchesYear && matchesType);
                });
            };

            if (searchInput) {
                searchInput.addEventListener("input", applyFilters);
            }

            filterSelects.forEach(function(select) {
                select.addEventListener("change", applyFilters);
            });
        }
    });
})();
