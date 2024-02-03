const tooltip = document.createElement("jd-tooltip");

whenDOMReady(() => {
  document.body.append(tooltip);
  const elementsWithTooltips = document.querySelectorAll("[tooltip]");
  for (const el of elementsWithTooltips) {
    attachTooltip(el);
  }
});

function attachTooltip(el) {
  el.addEventListener("mouseenter", () => {
    showTooltip(el);
  }, { passive: true });

  el.addEventListener("mouseleave", () => {
    hideTooltip();
  }, { passive: true });

  el.addEventListener("focus", e => {
    if (e.target.matches(":focus-visible")) {
      showTooltip(el);
    }
  }, { passive: true });

  el.addEventListener("blur", () => {
    hideTooltip();
  }, { passive: true });
}

function showTooltip(el) {
  tooltip.className = "";

  // Set tooltip content
  tooltip.innerHTML = el.getAttribute("tooltip");

  // Set tooltip style
  const elRect = el.getBoundingClientRect();
  const tooltipAlign = el.getAttribute("tooltip-align")?.trim() ?? "";

  const topRight = () => {
    tooltip.className = "top-right";
    tooltip.style.top = elRect.top - 20 + "px";
    tooltip.style.left = elRect.left + "px";
  };
  const bottomRight = () => {
    tooltip.className = "bottom-right";
    tooltip.style.top = elRect.bottom + 20 + "px";
    tooltip.style.left = elRect.left + "px";
  };
  const leftMiddle = () => {
    tooltip.className = "left-middle";
    tooltip.style.top = elRect.top + elRect.height/2 + "px";
    tooltip.style.left = elRect.left - 20 + "px";
  };
  const topCenter = () => {
    tooltip.className = "top-center";
    tooltip.style.top = elRect.top - 20 + "px";
    tooltip.style.left = elRect.left + elRect.width/2 + "px";
  };
  const bottomCenter = () => {
    tooltip.className = "bottom-center";
    tooltip.style.top = elRect.bottom + 20 + "px";
    tooltip.style.left = elRect.left + elRect.width/2 + "px";
  };

  if (tooltipAlign == "top-right") {
    topRight();
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.y < 8) bottomRight();

  } else if (tooltipAlign == "left-middle") {
    leftMiddle();

  } else {
    topCenter();
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipRect.y < 8) bottomCenter();
  }

  // Show tooltip
  tooltip.classList.add("shown");
}

function hideTooltip() {
  tooltip.classList.remove("shown");
}
