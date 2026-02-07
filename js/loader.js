// Global page loader
(function () {
  var loader = document.getElementById("page-loader");
  if (!loader) return;

  function showLoader() {
    loader.classList.remove("is-hidden");
  }

  function hideLoader() {
    loader.classList.add("is-hidden");
  }

  // Visible by default, but ensure state is correct
  showLoader();

  // Hide once the page fully loads
  window.addEventListener("load", function () {
    requestAnimationFrame(hideLoader);
  });

  // Handle bfcache restores (back/forward)
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) hideLoader();
  });

  // Intercept internal link navigation
  document.addEventListener("click", function (event) {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    var link = event.target.closest("a");
    if (!link) return;

    var href = link.getAttribute("href");
    if (!href) return;

    var target = (link.getAttribute("target") || "").toLowerCase();
    if (target === "_blank") return;

    if (link.hasAttribute("download")) return;

    if (href.startsWith("#")) return;
    if (href.startsWith("mailto:")) return;
    if (href.startsWith("tel:")) return;

    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (err) {
      return;
    }

    if (url.protocol !== "http:" && url.protocol !== "https:" && url.protocol !== "file:") {
      return;
    }

    var current = new URL(window.location.href);
    if (url.origin !== current.origin) return;

    // Same document hash navigation
    if (url.pathname === current.pathname && url.search === current.search && url.hash) {
      return;
    }

    event.preventDefault();
    showLoader();
    requestAnimationFrame(function () {
      window.location.href = url.href;
    });
  });
})();
