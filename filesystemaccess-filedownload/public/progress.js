/**
 * The progress element represents the completion progress of a stream. The
 * `value` attribute specifies how much of the stream that has been completed.
 * It must be a valid floating point number between `0` and `1` or
 * `indeterminate`. The content of this element describes what the progress is.
 */
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

  /**
   * Sets the value to assign to the `value` attribute. The progress display
   * will be updated. This element must be rendered.
   *
   * @param {number | string} newValue A valid floating point number between `0`
   *   and `1` or `indeterminate`.
   *
   * @example
   * const progress = document.querySelector("x-progress");
   * progress.value = 512 / 1024;
   * progress.value = "indeterminate";
   */
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
