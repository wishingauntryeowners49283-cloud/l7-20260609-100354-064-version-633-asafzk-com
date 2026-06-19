(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }

    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
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
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        show(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var sections = Array.prototype.slice.call(document.querySelectorAll(".movie-list-section"));

    sections.forEach(function (section) {
      var input = section.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      var counter = section.querySelector("[data-search-count]");
      var filterRow = section.querySelector("[data-filter-row]");
      var activeFilter = "全部";

      if (!cards.length) {
        return;
      }

      function update() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var searchText = (card.getAttribute("data-search") || "").toLowerCase();
          var filterText = card.getAttribute("data-filter") || "";
          var matchQuery = !query || searchText.indexOf(query) !== -1;
          var matchFilter = activeFilter === "全部" || filterText.indexOf(activeFilter) !== -1;
          var show = matchQuery && matchFilter;

          card.classList.toggle("is-hidden-card", !show);

          if (show) {
            visible += 1;
          }
        });

        if (counter) {
          counter.textContent = String(visible);
        }
      }

      if (input) {
        input.addEventListener("input", update);
      }

      if (filterRow) {
        filterRow.addEventListener("click", function (event) {
          var button = event.target.closest("[data-filter-value]");

          if (!button) {
            return;
          }

          activeFilter = button.getAttribute("data-filter-value") || "全部";

          filterRow.querySelectorAll("[data-filter-value]").forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });

          update();
        });
      }

      update();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
