import { loadCustomElementContents } from "/elements.js";

class Folder extends HTMLElement {
  #count = 0;
  #progressMap = new Map();

  constructor() {
    super();
  }

  connectedCallback() {
    loadCustomElementContents(this.shadowRoot, ["x-progress"]);
    this.#addHandlers();
  }

  static get observedAttributes() {
    return ["name"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "name") this.#updateValues({ [name]: newValue });
  }

  set name(value) {
    this.setAttribute("name", value);
  }

  async download(parentDirectoryHandle) {
    const directoryHandle = await parentDirectoryHandle.getDirectoryHandle(
      this.shadowRoot.querySelector("input[name=name]").value,
      { create: true }
    );
    await Promise.all(
      [...this.querySelectorAll(":scope > x-folder, :scope > x-file")].map(
        (entry) => entry.download(directoryHandle)
      )
    );
  }

  #addHandlers() {
    this.shadowRoot
      .querySelector("button#folder-addition")
      .addEventListener("click", this.#addFolder);
    this.shadowRoot
      .querySelector("button#file-addition")
      .addEventListener("click", this.#addFile);
    this.shadowRoot
      .querySelector("button#download")
      .addEventListener("click", this.#requestDownload);
  }

  #addFolder = () => {
    const template = document.querySelector("template#x-folder");
    const fragment = template.content.cloneNode(true);
    const folder = fragment.querySelector("x-folder");
    this.#count++;
    folder.setAttribute("name", `Folder ${this.#count}`);
    folder.addEventListener("progress", this.#updateProgress);
    this.appendChild(fragment);
    this.#updateDownloadButtonLabel();
  };

  #addFile = () => {
    const template = document.querySelector("template#x-file");
    const fragment = template.content.cloneNode(true);
    const file = fragment.querySelector("x-file");
    this.#count++;
    file.setAttribute("name", `File ${this.#count}`);
    file.setAttribute("size", 32 * this.#count);
    file.addEventListener("progress", this.#updateProgress);
    this.appendChild(fragment);
    this.#updateDownloadButtonLabel();
  };

  #updateProgress = (event) => {
    const { target, detail } = event;
    this.#progressMap.set(target, detail.value);
    const values = [...this.#progressMap.values()];
    this.shadowRoot.querySelector("x-progress").value =
      values.reduce(
        (total, { fetched, written }) => total + (fetched + written) / 2,
        0
      ) / this.#count;
    this.#dispatchProgressEvent({
      fetched:
        values.reduce((total, { fetched }) => total + fetched, 0) / this.#count,
      written:
        values.reduce((total, { written }) => total + written, 0) / this.#count
    });
  }

  #dispatchProgressEvent(value) {
    const event = new CustomEvent("progress", {
      bubbles: false,
      composed: true,
      detail: { value }
    });
    this.dispatchEvent(event);
  }

  #updateDownloadButtonLabel() {
    const downloadButton = this.shadowRoot.querySelector("button#download");
    downloadButton.disabled = false;
    downloadButton.textContent = `Download ${this.#count} ${
      this.#count === 1 ? "Entry" : "Entries"
    }`;
  }

  #requestDownload = async () => {
    this.shadowRoot.querySelector("x-progress").value = "indeterminate";
    const downloadDirectoryHandle = await window.showDirectoryPicker({
      startIn: "downloads"
    });
    const downloadSubdirectoryHandle =
      await downloadDirectoryHandle.getDirectoryHandle(
        `Downloaded from the Lab at ${Date.now()}`,
        { create: true }
      );
    await this.download(downloadSubdirectoryHandle);
    console.log("Done!");
  };

  #updateValues({ name }) {
    if (name) this.shadowRoot.querySelector("input[name=name]").value = name;
  }
}

customElements.define("x-folder", Folder);
