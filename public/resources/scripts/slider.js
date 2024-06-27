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
    this.addEventListener("mousedown", this.mouseDownHandler);
    addEventListener("mousemove", this.mouseMoveHandler);
    addEventListener("mouseup", this.mouseUpHandler);
    this.append(this.scale, this.knob);
  }

  mouseDownHandler = e => {
    this.held = true;
  }

  mouseMoveHandler = e => {
    if (!this.held) return;
    const scale = this.scale.getBoundingClientRect();
    let value = (e.clientX - scale.left) / scale.width * (this.max - this.min) + this.min;
    if (value < this.min) value = this.min;
    if (value > this.max) value = this.max;
    this.value = toNearestMultiple(value, this.step);
    this.dispatchEvent(new Event("change"));
    this.draw();
  }

  mouseUpHandler = e => {
    if (!this.held) return;
    this.held = false;
  }

  set value(x) {
    this.#value = parseFloat(x);
      if (isNaN(this.#value)) this.#value = parseFloat(this.getAttribute("value"));
    if (this.#linkedInput !== undefined) this.#linkedInput.value = x;
    this.draw();
  }

  get value() { return this.#value; }

  set linkedInput(el) {
    this.#linkedInput = el;
    el.addEventListener("input", () => {
      this.#value = parseFloat(el.value);
      if (isNaN(this.#value)) this.#value = parseFloat(this.getAttribute("value"));
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
    this.knob.style.left = pos + "px";
  }

  static get observedAttributes() {
    return [ "value", "min", "max", "step", "stops" ];
  }
}

function toNearestMultiple(n, p = 1) {
  const factor = 1 / p;
  return Math.round(n * factor) / factor;
}


customElements.define("jd-slider", JDSlider);
