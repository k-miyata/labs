import { loadCustomElementContents } from "/elements.js";

/**
 * The file element represents a file the user downloads from the server. They
 * can specify the name and size of the file. This element writes the file data
 * from the server directly to the user's local device by using the File System
 * Access API when the element receives a download request from the folder that
 * contains it.
 */
class File extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    loadCustomElementContents(this.shadowRoot, ["x-progress"]);
  }

  static get observedAttributes() {
    return ["name", "size"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "name" || name === "size")
      this.#updateValues({ [name]: newValue });
  }

  /**
   * Sets the value to assign to the `name` attribute. The value of the input
   * element of the name will be updated. This element must be rendered.
   *
   * @param {string} value A string for a new file name.
   */
  set name(value) {
    this.setAttribute("name", value);
  }

  /**
   * Sets the value to assign to the `size` attribute. The value of the input
   * element of the size will be updated. This element must be rendered.
   *
   * @param {number | string} value A number or string for a new file size.
   */
  set size(value) {
    this.setAttribute("size", value);
  }

  /**
   * Downloads the file with the name and size specified by the user and writes
   * it directly to the user's local device by using the File System Access API.
   * The data of the file is streamed from the response from the server to the
   * device. Each fetching and writing stream progress is displayed by the
   * progress element.
   *
   * @param {FileSystemDirectoryHandle} parentDirectoryHandle The directory
   *   handle of the parent folder.
   */
  async download(parentDirectoryHandle) {
    const name = this.shadowRoot.querySelector("input[name=name]").value;
    const size = this.shadowRoot.querySelector("input[name=size]").value;
    const url = new URL("/file", window.location.origin);
    url.searchParams.append("name", name);
    url.searchParams.append("size", size);
    const { body, headers } = await fetch(url.toString());
    const contentLength = parseInt(headers.get("content-length"), 10);
    let fetchedLength = 0;
    let writtenLength = 0;
    const fetchingProgress = this.shadowRoot.querySelector("x-progress#fetching");
    const writingProgress = this.shadowRoot.querySelector("x-progress#writing");
    const filename = headers.get("content-disposition").match(/filename=\"(.+)\"/)[1];

    // Consume the response body as a stream to track the download progress of
    // this file and enqueue the same data to a new readable stream. By
    // separating the streams, you can accurately track the download progress
    // even if the subsequent writes are slow. However, at typical Internet
    // speeds, writing will be faster than downloading.
    const responseBodyReader = body.getReader();
    const readableStream = new ReadableStream({
      start: async (controller) => {
        while (true) {
          const { done, value } = await responseBodyReader.read();
          if (done) break;
          fetchedLength += value.length;
          fetchingProgress.value = fetchedLength / contentLength;
          this.#dispatchProgressEvent({
            fetched: fetchedLength / contentLength,
            written: writtenLength / contentLength
          });
          controller.enqueue(value);
        }
        controller.close();
      }
    });

    // Create an empty file with the name of the content-disposition response
    // header and write the contents to this file with a writable stream.
    const fileHandle = await parentDirectoryHandle.getFileHandle(filename, { create: true });
    const writableFileStream = await fileHandle.createWritable();
    const writer = writableFileStream.getWriter();
    await writer.ready;
    const reader = readableStream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      await writer.write(value);
      writtenLength += value.length;
      writingProgress.value = writtenLength / contentLength;
      this.#dispatchProgressEvent({
        fetched: fetchedLength / contentLength,
        written: writtenLength / contentLength
      });
    }
    await writer.close();
  }

  /**
   * Dispatches the `progress` event of this element. This event is fired
   * periodically when the fetching or writing stream processes more data.
   * Note that this event does not bubble because it is intended to be received
   * only by the parent folder element. The folder element also dispatches the
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

  #updateValues({ name, size }) {
    if (name) this.shadowRoot.querySelector("input[name=name]").value = name;
    if (size) this.shadowRoot.querySelector("input[name=size]").value = size;
  }
}

customElements.define("x-file", File);
