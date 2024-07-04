/**
 * Icon element that consists of inlined SVG.
 * The HTML attribute "icon" should contain the name of the SVG file.
 */
class JDIcon extends HTMLElement {

  constructor(icon) {
    super();
    this.iconName = icon;
  }

  connectedCallback() {
    this.draw();
  }

  attributeChangedCallback() {
    this.draw();
  }

  draw() {
    // TODO: Clean this up.
    if (this.hasAttribute("src")) {
      httpGet(this.getAttribute("src")).then(svg => {
        this.innerHTML = svg;
        this.classList.remove("placeholder");
      });
      return;
    }

    this.iconName ??= this.getAttribute("icon");
    const safeIconName = encodeURI(this.iconName);

    if (JDIcon.cache[safeIconName] !== undefined) {
      JDIcon.cache[safeIconName].then(svg => {
        this.innerHTML = svg;
      });
      return;
    }

    this.classList.add("placeholder");

    const iconPath = `https://centrale.jeremiedupuis.com/graphics/icons/${safeIconName}.svg`;
    JDIcon.cache[safeIconName] = httpGet(iconPath).then(svg => {
      this.innerHTML = svg;
      this.classList.remove("placeholder");
      return svg;
    });
  }

  // Holds SVG icons. Access with [iconName].
  static cache = {};

  static get observedAttributes() {
    return [ "icon", "src" ];
  }
}

customElements.define("jd-icon", JDIcon);
