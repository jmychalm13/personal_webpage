/* ==========================================================================
   Site behaviour: theme toggle, scroll reveal, scroll-spy, progress bar,
   and the stat count-up. No dependencies.

   Everything degrades safely: the reveal styles are scoped to `.js-reveal`
   (added by the inline script in <head>), so if this file fails to load the
   page still renders as ordinary static content.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var supportsIO = "IntersectionObserver" in window;

  /* --- Theme toggle ----------------------------------------------------- */
  function initTheme() {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;

    function currentTheme() {
      var set = document.documentElement.getAttribute("data-theme");
      if (set) return set;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    function apply(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      // Bootstrap 5.3 reads this to theme its own cards, dropdown and inputs.
      document.documentElement.setAttribute("data-bs-theme", theme);
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      );
      var meta = document.querySelector('meta[name="theme-color"]:not([media])');
      if (meta) meta.setAttribute("content", theme === "dark" ? "#161d17" : "#2a3a29");
    }

    apply(currentTheme());

    btn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      apply(next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        /* private browsing — the choice just won't persist */
      }
    });

    // Follow the OS if the user has never made an explicit choice.
    var sysDark = window.matchMedia("(prefers-color-scheme: dark)");
    var onSysChange = function (e) {
      var stored = null;
      try {
        stored = localStorage.getItem("theme");
      } catch (err) {}
      if (!stored) apply(e.matches ? "dark" : "light");
    };
    if (sysDark.addEventListener) sysDark.addEventListener("change", onSysChange);
    else if (sysDark.addListener) sysDark.addListener(onSysChange);
  }

  /* --- Scroll reveal ---------------------------------------------------- */
  function initReveal() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll("[data-reveal]")
    );
    if (!items.length) return;

    // Stagger siblings inside a grid so cards cascade rather than pop as one.
    items.forEach(function (el) {
      if (el.style.getPropertyValue("--i")) return;
      var group = el.getAttribute("data-reveal-group");
      if (!group) return;
      var siblings = el.parentElement
        ? Array.prototype.slice
            .call(el.parentElement.children)
            .filter(function (c) {
              return c.getAttribute("data-reveal-group") === group;
            })
        : [];
      el.style.setProperty("--i", String(siblings.indexOf(el)));
    });

    if (reduceMotion.matches || !supportsIO) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target); // reveal once, not on every pass
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    items.forEach(function (el) {
      io.observe(el);
    });
  }

  /* --- Hero parallax ---------------------------------------------------- */
  /* Drives the botanical layers, the copy and the portrait from one place.
     Every element carries its own `data-parallax` rate: positive lags the
     scroll (reads as distant), negative leads it (reads as close to the
     lens). Returns an update function for initScrollChrome to call, so the
     whole page still runs on a single rAF-throttled scroll handler. */
  function initParallax() {
    var hero = document.querySelector(".hero");
    if (!hero || reduceMotion.matches) return null;

    var items = Array.prototype.slice.call(
      hero.querySelectorAll("[data-parallax]")
    );
    if (!items.length) return null;

    var layers = items.map(function (el) {
      return {
        el: el,
        rate: parseFloat(el.getAttribute("data-parallax")) || 0,
        pull: parseFloat(el.getAttribute("data-pointer")) || 0,
        fade: parseFloat(el.getAttribute("data-fade")) || 0,
      };
    });

    // Pointer drift is a desktop nicety; a touch device has no hover to
    // track, and the tilt would only ever fire on tap.
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    var pointerX = 0;
    var amp = 1;
    var height = hero.offsetHeight || 1;
    var wasVisible = true;

    function measure() {
      height = hero.offsetHeight || 1;
      // Shorter travel on phones: the same offsets read as a lurch there.
      amp = window.innerWidth < 768 ? 0.5 : 1;
    }

    // The copy holds full strength for the first third of the hero, then
    // fades out — starting the fade at the first pixel of scroll makes the
    // headline look washed out while it's still the main thing on screen.
    var FADE_START = 0.3;

    function paint(y) {
      var progress = Math.min(y / height, 1);
      layers.forEach(function (l) {
        l.el.style.setProperty(
          "--py",
          (y * l.rate * amp).toFixed(1) + "px"
        );
        if (l.pull) {
          l.el.style.setProperty(
            "--px",
            (pointerX * l.pull * amp).toFixed(1) + "px"
          );
        }
        if (l.fade > FADE_START) {
          var f = (progress - FADE_START) / (l.fade - FADE_START);
          l.el.style.setProperty(
            "--fade",
            (1 - Math.min(Math.max(f, 0), 1)).toFixed(3)
          );
        }
      });
    }

    function update(y) {
      // Nothing to do once the hero is off screen — but paint one last frame
      // on the way out so it never freezes mid-transform.
      var visible = y < height;
      if (!visible && !wasVisible) return;
      wasVisible = visible;
      paint(visible ? y : height);
    }

    function onPointerMove(e) {
      // -0.5 .. 0.5 across the viewport.
      pointerX = e.clientX / window.innerWidth - 0.5;
    }

    if (finePointer.matches) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
    }
    window.addEventListener(
      "resize",
      function () {
        measure();
      },
      { passive: true }
    );

    measure();
    return update;
  }

  /* --- Nav state + scroll progress -------------------------------------- */
  function initScrollChrome(onScrollUpdate) {
    var nav = document.querySelector(".navbar");
    var bar = document.querySelector(".scroll-progress");
    var ticking = false;

    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop;

      if (nav) nav.classList.toggle("is-scrolled", y > 12);

      if (bar) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        bar.style.setProperty("--progress", max > 0 ? String(y / max) : "0");
      }

      if (onScrollUpdate) onScrollUpdate(y);
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
  }

  /* --- Scroll-spy ------------------------------------------------------- */
  function initScrollSpy() {
    if (!supportsIO) return;

    var links = Array.prototype.slice
      .call(document.querySelectorAll('.navbar .nav-link[href^="#"]'))
      .filter(function (a) {
        return a.getAttribute("href").length > 1;
      });
    if (!links.length) return;

    var map = {};
    var sections = [];
    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = link;
      sections.push(section);
    });
    if (!sections.length) return;

    var visible = {};

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting
            ? entry.intersectionRatio
            : 0;
        });

        // Highlight whichever tracked section occupies the most viewport.
        var best = null;
        var bestRatio = 0;
        Object.keys(visible).forEach(function (id) {
          if (visible[id] > bestRatio) {
            bestRatio = visible[id];
            best = id;
          }
        });

        links.forEach(function (l) {
          l.classList.remove("is-active");
          l.removeAttribute("aria-current");
        });
        if (best && map[best]) {
          map[best].classList.add("is-active");
          map[best].setAttribute("aria-current", "true");
        }
      },
      {
        rootMargin: "-15% 0px -55% 0px",
        threshold: [0, 0.15, 0.35, 0.6, 0.9],
      }
    );

    sections.forEach(function (s) {
      io.observe(s);
    });
  }

  /* --- Stat count-up ---------------------------------------------------- */
  function initCounters() {
    var nums = Array.prototype.slice.call(
      document.querySelectorAll("[data-count]")
    );
    if (!nums.length) return;

    function paint(el, value) {
      var target = el.querySelector(".stat-value") || el;
      target.textContent = String(value);
    }

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      if (isNaN(target)) return;

      if (reduceMotion.matches) {
        paint(el, target);
        return;
      }

      var duration = 1300;
      var start = null;

      function step(now) {
        if (start === null) start = now;
        var t = Math.min((now - start) / duration, 1);
        // easeOutCubic. Deliberately not easeOutExpo: that curve is so
        // front-loaded that a small target (6 years, say) reaches its final
        // digit within ~200ms and the count-up never reads as motion.
        var eased = 1 - Math.pow(1 - t, 3);
        paint(el, Math.round(target * eased));
        if (t < 1) window.requestAnimationFrame(step);
      }

      window.requestAnimationFrame(step);
    }

    if (!supportsIO) {
      nums.forEach(function (el) {
        paint(el, parseFloat(el.getAttribute("data-count")) || 0);
      });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(entry.target);
          io.unobserve(entry.target); // count once only
        });
      },
      { threshold: 0.4 }
    );

    nums.forEach(function (el) {
      paint(el, 0);
      io.observe(el);
    });
  }

  /* --- Collapse the mobile menu after tapping an in-page link ----------- */
  function initMenuAutoClose() {
    var collapse = document.getElementById("navbarNavDropdown");
    if (!collapse) return;

    collapse.addEventListener("click", function (e) {
      var link = e.target.closest('a.nav-link[href^="#"]');
      if (!link || link.classList.contains("dropdown-toggle")) return;
      if (!collapse.classList.contains("show")) return;

      if (window.bootstrap && window.bootstrap.Collapse) {
        var inst = window.bootstrap.Collapse.getOrCreateInstance(collapse, {
          toggle: false,
        });
        inst.hide();
      }
    });
  }

  function init() {
    initTheme();
    initReveal();
    initScrollChrome(initParallax());
    initScrollSpy();
    initCounters();
    initMenuAutoClose();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
