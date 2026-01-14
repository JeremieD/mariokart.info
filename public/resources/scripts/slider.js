"use strict";

class JDSlider extends HTMLElement {
  #value;
  #linkedInput;

  constructor(value = 0, min = 0, max = 6, step = 1, stops = 6) {
    super();
    this.#value = value;
    this.min = min;
    this.max = max;
    this.step = step;
    this.stops = stops;
    this.held = false;
    this.clickOrigin = undefined;
  }

  connectedCallback() {
    this.init();
    this.draw();
  }

  attributeChangedCallback() {
    this.init();
    this.draw();
  }

  init() {
    this.innerHTML = "";
    if (this.hasAttribute("value")) this.#value = parseFloat(this.getAttribute("value"));
    if (this.hasAttribute("min")) this.min = parseFloat(this.getAttribute("min"));
    if (this.hasAttribute("max")) this.max = parseFloat(this.getAttribute("max"));
    if (this.hasAttribute("step")) this.step = parseFloat(this.getAttribute("step"));
    if (this.hasAttribute("stops")) this.stops = parseInt(this.getAttribute("stops"));
    this.scale = document.createElement("div");
    this.scale.classList.add("scale");
    for (let i = 0; i < this.stops; i++) {
      this.scale.append(document.createElement("div"));
    }
    this.knob = document.createElement("div");
    this.knob.classList.add("knob");
    this.addEventListener("mousedown", this.pointerDownHandler, { passive: true });
    this.addEventListener("touchstart", this.pointerDownHandler, { passive: true });
    addEventListener("mousemove", this.pointerMoveHandler, { passive: false });
    addEventListener("touchmove", this.pointerMoveHandler, { passive: false });
    addEventListener("mouseup", this.pointerUpHandler, { passive: true });
    addEventListener("touchend", this.pointerUpHandler, { passive: true });
    this.append(this.scale, this.knob);
  }

  pointerDownHandler = e => {
    if (e.button === 0 || (e.type === "touchstart" && e.touches.length === 1)) {
      this.held = true;
      this.clickOrigin = e.clientX;
      this.classList.add("held");
      forAllScrollContainers(this, disableScroll);
    }
  }

  pointerMoveHandler = e => {
    if (!this.held || (e.type === "touchend" && e.touches.length > 1)) return;
    e.preventDefault();
    const newValue = this.#getPointerValue(e);
    if (this.#value === newValue) return;
    this.value = newValue;
    this.dispatchEvent(new Event("change"));
  }

  pointerUpHandler = e => {
    if (!this.held || (e.type === "mouseup" && e.button !== 0)) return;
    forAllScrollContainers(this, enableScroll);
    this.classList.remove("held");
    const clickDelta = Math.round(Math.abs(e.clientX - this.clickOrigin));
    this.clickOrigin = undefined;
    this.held = false;
    if (clickDelta < 1) { // Move knob if deltaX is negligeable
      const newValue = this.#getPointerValue(e);
      if (this.#value === newValue) return;
      this.value = newValue;
      this.dispatchEvent(new Event("change"));
    }
  }

  #getPointerValue = e => {
    const scale = this.scale.getBoundingClientRect();
    let value = (unify(e).clientX - scale.left) / scale.width * (this.max - this.min) + this.min;
    if (value < this.min) value = this.min;
    if (value > this.max) value = this.max;
    return toNearestMultiple(value, this.step);
  }

  set value(x) {
    this.#value = parseFloat(x);
    if (isNaN(this.#value)) this.#value = 0;
    if (this.#linkedInput !== undefined) this.#linkedInput.value = this.#value;
    this.draw();
  }

  get value() { return this.#value; }

  set linkedInput(el) {
    this.#linkedInput = el;
    el.addEventListener("input", () => {
      this.#value = parseFloat(el.value);
      if (isNaN(this.#value)) this.#value = 0;
      this.draw();
    });
  }

  draw() {
    const scale = this.scale.getBoundingClientRect();
    let pos = this.#value;
    const min = parseFloat(this.min);
    const max = parseFloat(this.max);
    if (pos < min) pos = min;
    if (pos > max) pos = max;
    pos += Math.abs(this.min);
    pos /= (max - min);
    pos *= scale.width;
    this.knob.style.translate = pos + "px 0";
  }

  static get observedAttributes() {
    return [ "value", "min", "max", "step", "stops" ];
  }
}

function toNearestMultiple(n, p = 1) {
  const factor = 1 / p;
  return Math.round(n * factor) / factor;
}

const unify = e => e.changedTouches ? e.changedTouches[0] : e;

const forAllScrollContainers = (el, fn) => { // except root
  const parent = el.parentElement;
  if (parent === document.documentElement) return;
  if (parent.scrollHeight > parent.clientHeight) fn(parent);
  forAllScrollContainers(parent, fn);
};

customElements.define("jd-slider", JDSlider);
