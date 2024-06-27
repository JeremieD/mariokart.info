"use strict";

const Tooltip = {
  tt: document.createElement("jd-tooltip")
};

whenDOMReady(() => {
  document.body.append(Tooltip.tt);
  // TODO: Auto attach?
});

Tooltip.attach = el => {
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

Tooltip.draw = (content, opts = {}) => {
  opts.el;
  opts.pos ??= "top"; // Point of the anchor element to anchor to.
  opts.align ??= "center"; // Tooltip alignment relative to anchor point.
  opts.time ??= 3000; // in ms

  const tt = Tooltip.tt;
  tt.innerHTML = content;
  tt.style = "";

  const elRect = opts.el.getBoundingClientRect();
  switch (opts.pos) {
    case "top":
      tt.style.left = elRect.x + elRect.width/2 + "px";
      tt.style.top = elRect.y + "px";
      break;
    case "bot":
    case "bottom":
      tt.style.left = elRect.x + elRect.width/2 + "px";
      tt.style.top = elRect.y + elRect.height + "px";
      break;
    case "left":
      tt.style.left = elRect.x + "px";
      tt.style.top = elRect.y + elRect.height/2 + "px";
      break;
    case "right":
      tt.style.left = elRect.x + elRect.width + "px";
      tt.style.top = elRect.y + elRect.height/2 + "px";
      break;
    default:
      throw "Error: Unknown anchoring method: “" + opts.pos + "”";
  }

  tt.classList.add("anchor-" + opts.pos);
  tt.classList.add("align-" + opts.align);

  // Show tooltip
  tt.style.setProperty("--tt-time", opts.time + "ms");
  tt.classList.add("shown");

  setTimeout(Tooltip.hide, opts.time);
}

Tooltip.hide = () => {
  Tooltip.tt.classList.remove("shown");
}
