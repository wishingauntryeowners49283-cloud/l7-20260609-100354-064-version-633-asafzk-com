(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
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
    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
        restart();
      });
    });
    restart();
  }

  function matchYear(year, range) {
    if (range === "all") {
      return true;
    }
    if (range === "after-2025") {
      return year >= 2025;
    }
    if (range === "2020-2024") {
      return year >= 2020 && year <= 2024;
    }
    if (range === "2010-2019") {
      return year >= 2010 && year <= 2019;
    }
    if (range === "2000-2009") {
      return year >= 2000 && year <= 2009;
    }
    if (range === "before-2000") {
      return year < 2000;
    }
    return true;
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var typeSelect = panel.querySelector("[data-filter-type]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var list = document.querySelector("[data-filter-list]");
      var empty = document.querySelector("[data-empty-state]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var typeValue = typeSelect ? typeSelect.value : "all";
        var yearValue = yearSelect ? yearSelect.value : "all";
        var shown = 0;
        cards.forEach(function (card) {
          var text = card.textContent.toLowerCase() + " " + (card.getAttribute("data-tags") || "").toLowerCase();
          var type = card.getAttribute("data-type") || "";
          var year = parseInt(card.getAttribute("data-year") || "0", 10);
          var okQuery = !query || text.indexOf(query) !== -1;
          var okType = typeValue === "all" || type.indexOf(typeValue) !== -1 || text.indexOf(typeValue.toLowerCase()) !== -1;
          var okYear = matchYear(year, yearValue);
          var visible = okQuery && okType && okYear;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [input, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  ready(function () {
    setupMobileNav();
    setupHeroSlider();
    setupFilters();
  });
})();

function setupMoviePlayer(sourceUrl) {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.querySelector("[data-movie-video]");
    var cover = document.querySelector("[data-movie-play]");
    var hlsInstance = null;
    var loaded = false;

    if (!video || !cover || !sourceUrl) {
      return;
    }

    function playVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    function start() {
      cover.classList.add("is-hidden");
      if (loaded) {
        playVideo();
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        playVideo();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        return;
      }
      video.src = sourceUrl;
      playVideo();
    }

    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  });
}
