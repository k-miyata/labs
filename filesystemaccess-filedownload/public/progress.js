class Progress extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["value"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "value") this.#updateValues({ [name]: newValue });
  }

  set value(newValue) {
    this.setAttribute("value", newValue);
  }

  #updateValues({ value }) {
    if (value) {
      const progress = this.shadowRoot.querySelector("progress");
      const percentage = this.shadowRoot.querySelector("#percentage");
      if (value === "indeterminate") {
        progress.removeAttribute("value");
        percentage.textContent = "--%";
      } else {
        progress.value = value;
        percentage.textContent = `${Math.floor(value * 100)}%`;
      }
    }
  }
}

customElements.define("x-progress", Progress);
