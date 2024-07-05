"use strict";

class JDSelect extends HTMLElement {
  #value;
  #outputEl;
  #options = [];
  #dropdownEl;
  #optionEls = [];

  constructor() {
    super();
    this.#outputEl = document.createElement("output");
    this.#dropdownEl = document.createElement("ol");
    this.#dropdownEl.inert = true;
  }

  connectedCallback() {
    this.tabIndex = 0;
    const optionEls = this.querySelectorAll("option");
    this.innerHTML = "";
    const icon = new JDIcon("chevron-down");
    this.append(this.#outputEl, icon, this.#dropdownEl);
    for (const option of optionEls) {
      this.addOption(option.innerText, option.value);
      if (option.hasAttribute("selected")) this.value = option.value;
    }
    this.draw();

    this.addEventListener("click", this.open, { passive: true } );
    addEventListener("click", e => {
      if (isOutside(this.#dropdownEl, e)) this.close();
    }, { passive: true });
    this.addEventListener("keydown", this.keydownHandler);
  }

  get value() { return this.#value; }
  set value(v) {
    if (!this.#options.includes(v)) return;
    this.#value = v;
    this.draw();
    this.dispatchEvent(new Event("change"));
    this.close();
  }

  draw() {
    for (const optionEl of this.#optionEls) {
      const optionElValue = optionEl.getAttribute("value");
      const isSelected = optionElValue == this.#value;
      optionEl.classList.toggle("selected", isSelected);
      if (isSelected) this.#outputEl.innerText = optionEl.innerText;
    }
  }

  open(e) {
    this.classList.add("open");
    this.#dropdownEl.inert = false;
    if (e.type == "click") {
      e.stopPropagation();
    } else if (e.type == "keydown") {
      for (const optionEl of this.#optionEls) {
        if (optionEl.getAttribute("value") == this.#value) {
          optionEl.focus();
          break;
        }
      }
    }
  }

  close() {
    this.classList.remove("open");
    this.#dropdownEl.inert = true;
  }

  keydownHandler(e) {
    let newOptIndex;
    switch (e.code) {
      case "Space":
      case "Enter":
        e.preventDefault();
        if (e.target === this) {
          this.open(e);
        } else {
          this.value = e.target.getAttribute("value");
        }
        break;
      case "Tab":
      case "Escape":
        this.close();
        break;
      case "ArrowDown":
        e.preventDefault();
        newOptIndex = this.#options.indexOf(e.target.getAttribute("value")) + 1;
        if (newOptIndex >= this.#options.length) newOptIndex = 0;
        for (const optionEl of this.#optionEls) {
          if (optionEl.getAttribute("value") == this.#options[newOptIndex]) {
            optionEl.focus();
            break;
          }
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        newOptIndex = this.#options.indexOf(e.target.getAttribute("value")) - 1;
        if (newOptIndex < 0) newOptIndex = this.#options.length - 1;
        for (const optionEl of this.#optionEls) {
          if (optionEl.getAttribute("value") == this.#options[newOptIndex]) {
            optionEl.focus();
            break;
          }
        }
        break;
    }
  }

  addOption(label, value) {
    const optionEl = document.createElement("li");
    optionEl.setAttribute("value", value);
    optionEl.innerText = label;
    optionEl.tabIndex = -1;
    optionEl.prepend(new JDIcon("checkmark"));
    this.#optionEls.push(optionEl);
    this.#options.push(value);
    optionEl.addEventListener("click", e => {
      e.stopPropagation();
      this.value = value;
    });
    this.#dropdownEl.append(optionEl);
  }
}

customElements.define("jd-select", JDSelect);
