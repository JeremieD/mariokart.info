"use strict";

const Tooltip = {
  tt: document.createElement("jd-tooltip"),
  timeout: undefined
};

whenDOMReady(() => {
  document.body.append(Tooltip.tt);
  // TODO: Auto attach?
});

Tooltip.attach = el => {
  el.addEventListener("pointerenter", () => {
    showTooltip(el);
  }, { passive: true });

  el.addEventListener("pointerleave", () => {
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
  clearTimeout(Tooltip.timeout);

  const el = opts.el;
  opts.pos ??= "top"; // Point of the anchor element to anchor to.
  opts.align ??= "center"; // Tooltip alignment relative to anchor point.
  opts.time ??= 3000; // Time shown in ms
  opts.dialog ??= undefined; // Top-layer element to display in.

  if (opts.dialog) {
    opts.dialog.append(Tooltip.tt);
  } else {
    document.body.append(Tooltip.tt);
  }

  const tt = Tooltip.tt;
  tt.innerHTML = content;
  tt.style = "";
  tt.className = "";

  const elRect = el.getBoundingClientRect();
  switch (opts.pos) {
    case "top":
      tt.style.left = el.offsetLeft + elRect.width/2 + "px";
      tt.style.top = el.offsetTop + "px";
      break;
    case "bot":
    case "bottom":
      tt.style.top = el.offsetTop + elRect.height + "px";
      switch (opts.align) {
        case "center":
          tt.style.left = el.offsetLeft + elRect.width/2 + "px";
          break;
        case "left":
          tt.style.left = el.offsetLeft + "px";
          break;
        case "right":
          tt.style.left = el.offsetLeft + elRect.width + "px";
      }
      break;
    case "left":
      tt.style.left = el.offsetLeft + "px";
      tt.style.top = el.offsetTop + elRect.height/2 + "px";
      break;
    case "right":
      tt.style.left = el.offsetLeft + elRect.width + "px";
      tt.style.top = el.offsetTop + elRect.height/2 + "px";
      break;
    default:
      throw "Error: Unknown anchoring method: “" + opts.pos + "”";
  }

  tt.classList.add("pos-" + opts.pos);
  tt.classList.add("align-" + opts.align);

  // Show tooltip
  tt.style.setProperty("--tt-time", opts.time + "ms");
  tt.classList.add("shown");

  Tooltip.timeout = setTimeout(Tooltip.hide, opts.time);
}

Tooltip.hide = () => {
  Tooltip.tt.classList.remove("shown");
}
