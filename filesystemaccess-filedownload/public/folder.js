import { loadCustomElementContents } from "/elements.js";

/**
 * The folder element represents a folder where the user can add new files and
 * folders, or download them from the server. The user can specify the name of
 * the folder. This element calls the `download` method of each child file and
 * folder element when the user clicks the download button of this element.
 */
class Folder extends HTMLElement {
  /** The number of child files and folders. */
  #count = 0;

  /** The map of the `progress` event values from the child file elements. */
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

  /**
   * Sets the value to assign to the `name` attribute. The value of the input
   * element of the name will be updated. This element must be rendered.
   *
   * @param {string} value A string for a new folder name.
   */
  set name(value) {
    this.setAttribute("name", value);
  }

  /**
   * Creates a directory with a user-specified name on the user's local device
   * by using the File System Access API and calls the `download` method of each
   * child file and folder element to download them. This method is called by
   * the `#requestDownload` method and the `download` method of the parent
   * folder element.
   *
   * @param {FileSystemDirectoryHandle} parentDirectoryHandle The directory
   *   handle of the parent folder.
   */
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

  /**
   * Adds a new folder element to the children of this element.
   */
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

  /**
   * Adds a new file element to the children of this element.
   */
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

  /**
   * Displays the progress of the entire stream, fetching and writing combined,
   * and also dispatches the `progress` event for the parent folder element.
   *
   * @param {CustomEvent} event A `progress` event from the child file and
   *   folder elements.
   */
  #updateProgress = (event) => {
    const { target, detail } = event;
    this.#progressMap.set(target, detail.value);
    const values = [...this.#progressMap.values()];
    this.shadowRoot.querySelector("x-progress").value =
      values.reduce((total, { fetched, written }) => total + (fetched + written) / 2, 0) / this.#count;
    this.#dispatchProgressEvent({
      fetched: values.reduce((total, { fetched }) => total + fetched, 0) / this.#count,
      written: values.reduce((total, { written }) => total + written, 0) / this.#count
    });
  }

  /**
   * Dispatches the `progress` event of this element. This event is fired when
   * this element receives the `progress` event from a child file or folder
   * element. Note that this event does not bubble because it is intended to be
   * received only by the parent folder element. The parent also dispatches the
   * `progress` event.
   *
   * @param {Object} value How much of each stream that has been completed.
   */
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
    downloadButton.textContent =
      `Download ${this.#count} ${this.#count === 1 ? "Entry" : "Entries"}`;
  }

  /**
   * Displays a directory picker for the user to select a destination and
   * downloads each child file and folder to the selected directory. To prevent
   * users from unintentionally overwriting files, creates a subdirectory with a
   * name that includes the current date and time, and writes the downloaded
   * into it.
   */
  #requestDownload = async () => {
    this.shadowRoot.querySelector("x-progress").value = "indeterminate";

    // Start the directory open dialog in the default Downloads folder where
    // downloaded files would typically be stored.
    const downloadDirectoryHandle = await window.showDirectoryPicker({ startIn: "downloads" });

    const downloadSubdirectoryHandle = await downloadDirectoryHandle.getDirectoryHandle(
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
