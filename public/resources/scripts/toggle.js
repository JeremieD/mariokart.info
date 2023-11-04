class JDToggle extends HTMLElement {
  constructor() {
    super();

    this.state = false;

    this.addEventListener("click", e => {
      if (this.toggle()) this.dispatchEvent(new Event("change"));
    });
    this.addEventListener("keyup", e => {
      if (e.code === "Space") {
        if (this.toggle()) this.dispatchEvent(new Event("change"));
      }
    });
  }

  connectedCallback() {
    this.state = false;
    this.tabIndex = 0;
    if (this.hasAttribute("selected")) this.set(true);
  }

  set(value) {
    if (this.state !== value) {
      this.state = value;
      if (value) {
        this.setAttribute("selected", "");
      } else {
          this.removeAttribute("selected");
      }
      return true;
    }
    return false;
  }

  toggle() {
    return this.set(!this.state);
  }
}

class JDToggleGroup extends HTMLElement {
  constructor() {
    super();

    this.options = [];
    this.lastChanged;
  }

  connectedCallback() {
    // @TODO: I could eventually allow arbitrarily many choices using these settings.
    // this.dataset.min ??= 1;
    // this.dataset.max ??= 1;
    this.dataset.type ??= "default";

    if (this.dataset.type === "radio") {
      setTimeout(() => { // Hack. Workaround for missing "content parsed" event..
        for (const option of this.querySelectorAll("jd-toggle")) {
          this.options.push(option);
          if (this.dataset.type === "radio") {
            option.tabIndex = option.state ? 0 : -1;
          }
          option.addEventListener("change", () => {
            this.lastChanged = option;
            this.set(option.dataset.value, option.state);
          });
          option.addEventListener("keyup", e => {
            switch (e.code) {
              case "ArrowDown":
              case "ArrowRight":
                this.next(option.dataset.value);
                break;
              case "ArrowUp":
              case "ArrowLeft":
                this.previous(option.dataset.value);
                break;
            }
          });
        }
      });
    }
  }

  set(value, state) {
    for (const option of this.options) {
      option.set(option.dataset.value === value);
      if (this.dataset.type === "radio") {
        option.tabIndex = option.state ? 0 : -1;
      }
    }
  }

  next(fromValue) {
    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].dataset.value === fromValue) {
        const targetIndex = (i + 1) % this.options.length;
        this.options[targetIndex].focus();
        if (this.dataset.type === "radio") {
          this.set(this.options[targetIndex].dataset.value, true);
        }
      }
    }
  }

  previous(fromValue) {
    for (let i = 0; i < this.options.length; i++) {
      if (this.options[i].dataset.value === fromValue) {
        const targetIndex = (this.options.length + i - 1) % this.options.length;
        this.options[targetIndex].focus();
        if (this.dataset.type === "radio") {
          this.set(this.options[targetIndex].dataset.value, true);
        }
      }
    }
  }
}

customElements.define("jd-toggle", JDToggle);
customElements.define("jd-toggle-group", JDToggleGroup);
