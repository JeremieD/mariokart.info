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
    if (this.hasAttribute("icon")) {
      this.iconName = this.getAttribute("icon");
    }

    const safeIconName = encodeURI(this.iconName);

    if (JDIcon.cache[safeIconName] !== undefined) {
      JDIcon.cache[safeIconName].then(svg => {
        this.innerHTML = svg;
      });
      return;
    }

    this.classList.add("placeholder");

    const iconPath = `/resources/graphics/icons/${safeIconName}.svg`;
    JDIcon.cache[safeIconName] = httpGet(iconPath).then(svg => {
      this.innerHTML = svg;
      this.classList.remove("placeholder");
      return svg;
    });
  }

  // Holds SVG icons. Access with [iconName].
  static cache = {};
}

customElements.define("jd-icon", JDIcon);
