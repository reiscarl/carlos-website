/* Carlos Reis site behaviour.
   Everything here is an enhancement: the page is fully usable without it. */

(function () {
  "use strict";

  /* ---------- Footer year ---------- */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Active section in nav ---------- */

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          var current = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", current);
          // Announce the current section rather than signalling it by colour alone.
          if (current) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ---------- Mobile menu ---------- */

  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("mobile-menu");

  if (toggle && menu) {
    // Everything the overlay covers. Marked inert while it is open so the page
    // behind cannot be tabbed into or read out through the overlay.
    var behindMenu = [
      document.querySelector(".skip-link"),
      document.querySelector(".nav-name"),
      document.querySelector(".nav-links"),
      document.querySelector(".nav-cta"),
      document.getElementById("main"),
      document.querySelector(".footer"),
      document.getElementById("consent")
    ].filter(Boolean);

    var setMenu = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";

      // The toggle is deliberately not in this list: it stays reachable so the
      // menu can be closed.
      behindMenu.forEach(function (el) {
        if (open) {
          el.setAttribute("inert", "");
        } else {
          el.removeAttribute("inert");
        }
      });

      if (open) {
        var first = menu.querySelector("a");
        if (first) first.focus();
      }
    };

    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    // Widening past the mobile breakpoint hides the close button, so close the
    // menu rather than stranding the visitor behind a full-screen overlay.
    var mobileQuery = window.matchMedia("(max-width: 860px)");
    var onBreakpoint = function (event) {
      if (!event.matches) setMenu(false);
    };

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", onBreakpoint);
    } else if (mobileQuery.addListener) {
      mobileQuery.addListener(onBreakpoint); // Safari < 14
    }
  }

  /* ---------- Cookie consent & deferred HubSpot ---------- */

  var HUBSPOT_SRC = "https://js.hs-scripts.com/21685469.js";
  var STORAGE_KEY = "cr-consent";

  var banner = document.getElementById("consent");
  var accept = document.getElementById("consent-accept");
  var decline = document.getElementById("consent-decline");
  var settings = document.getElementById("cookie-settings");

  function loadHubSpot() {
    if (document.getElementById("hs-script-loader")) return;
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.id = "hs-script-loader";
    script.async = true;
    script.defer = true;
    script.src = HUBSPOT_SRC;
    document.body.appendChild(script);
  }

  function readConsent() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      return null; // private browsing or storage disabled
    }
  }

  function writeConsent(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (err) {
      /* nothing to do: the choice just won't persist */
    }
  }

  // Cookies HubSpot sets once it runs. Withdrawing consent has to remove these,
  // not just stop the script, or the tracking identifiers survive the opt-out.
  var HUBSPOT_COOKIES = ["__hstc", "hubspotutk", "__hssrc", "__hssc", "messagesUtk"];

  function clearHubSpotCookies() {
    var past = "Thu, 01 Jan 1970 00:00:00 GMT";
    var host = window.location.hostname;
    // No domain, the host, and the dot-prefixed host. HubSpot uses the last two,
    // and these cover the registrable domain without guessing at the public suffix.
    var domains = ["", host, "." + host];

    HUBSPOT_COOKIES.forEach(function (name) {
      domains.forEach(function (domain) {
        document.cookie = name + "=;expires=" + past + ";path=/" +
          (domain ? ";domain=" + domain : "");
      });
    });

    try {
      Object.keys(window.localStorage).forEach(function (key) {
        if (/^(hubspot|messagesUtk|__hs)/i.test(key)) window.localStorage.removeItem(key);
      });
    } catch (err) {
      /* storage unavailable: nothing to clear */
    }
  }

  // True only when the banner was reopened from the footer control, which is
  // the one case where returning focus (and scroll) to the footer is correct.
  var openedFromSettings = false;

  function setSettingsLabel(value) {
    if (!settings) return;
    settings.textContent = value === "granted" ? "Cookie settings (accepted)"
      : value === "denied" ? "Cookie settings (declined)"
      : "Cookie settings";
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    banner.focus();
  }

  function setConsent(value) {
    writeConsent(value);

    if (banner) {
      banner.hidden = true;

      // The focused button just disappeared, so move focus deliberately rather
      // than letting it fall back to <body>. Only scroll the visitor if they
      // came from the footer control; otherwise focus without moving the page.
      if (settings && openedFromSettings) {
        settings.focus();
      } else {
        var heading = document.querySelector("h1");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
      }
      openedFromSettings = false;
    }

    setSettingsLabel(value);

    if (value === "granted") {
      loadHubSpot();
      return;
    }

    // Opting out, possibly after opting in: remove what HubSpot left behind.
    var wasLoaded = !!document.getElementById("hs-script-loader");
    clearHubSpotCookies();
    if (wasLoaded) window.location.reload();
  }

  var stored = readConsent();

  if (stored === "granted") {
    loadHubSpot();
  } else if (stored !== "denied") {
    showBanner();
  }

  if (accept) accept.addEventListener("click", function () { setConsent("granted"); });
  if (decline) decline.addEventListener("click", function () { setConsent("denied"); });

  if (settings && banner) {
    settings.addEventListener("click", function () {
      openedFromSettings = true;
      banner.hidden = false;
      if (accept) accept.focus();
    });
  }

  // Reflect the stored choice so the footer control is not a dead end.
  setSettingsLabel(stored);
})();
