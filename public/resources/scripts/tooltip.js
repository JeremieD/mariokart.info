// Display a tooltip when hovering an element with the “tooltip” attribute.
whenDOMReady(() => {
  const elementsWithTooltips = document.querySelectorAll("[tooltip]");

  for (const el of elementsWithTooltips) {
    attachTooltip(el);
  }
});

function attachTooltip(el) {
  if (!el.hasAttribute("tabindex")) { el.tabIndex = 0; }

  el.abortController;

  el.tooltipElement = document.createElement("jd-tooltip");
  el.tooltipElement.innerHTML = el.getAttribute("tooltip");

  const show = el => {
    if (el.tooltipElement.classList.contains("out")) {
      el.abortController?.abort();
      el.tooltipElement.classList.remove("out");
    }

    if (!el.tooltipElement.classList.contains("in")) {
      el.appendChild(el.tooltipElement);
      el.tooltipElement.classList.add("in");
    }
  };

  const hide = el => {
    // Reset AbortController
    el.abortController = new AbortController();

    el.tooltipElement.addEventListener("transitionend", () => {
      el.tooltipElement.remove();
      el.tooltipElement.classList.remove("in");
    }, { passive: true, once: true, signal: el.abortController.signal });

    el.tooltipElement.classList.add("out");
  };

  el.addEventListener("mouseenter", () => {
    show(el);
  }, { passive: true });

  el.addEventListener("mouseleave", () => {
    hide(el);
  }, { passive: true });

  el.addEventListener("focus", e => {
    if (e.target.matches(":focus-visible")) {
      show(el);
    }
  }, { passive: true });

  el.addEventListener("blur", () => {
    hide(el);
  }, { passive: true });
}
