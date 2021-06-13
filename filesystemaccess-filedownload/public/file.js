import { loadCustomElementContents } from "/elements.js";

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

  set name(value) {
    this.setAttribute("name", value);
  }

  set size(value) {
    this.setAttribute("size", value);
  }

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
    const filename = headers
      .get("content-disposition")
      .match(/filename=\"(.+)\"/)[1];
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
    const fileHandle = await parentDirectoryHandle.getFileHandle(filename, {
      create: true
    });
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
