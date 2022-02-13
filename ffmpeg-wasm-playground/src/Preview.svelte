<script lang="ts">
  import { ffmpeg, outputFileName } from "./store";

  let mimeType = "video/mp4";

  function createObjectUrl(fileName?: string, type?: string) {
    if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    if (!fileName || !type) return undefined;
    const blob = new Blob([$ffmpeg.FS("readFile", fileName)], { type });
    return window.URL.createObjectURL(blob);
  }

  $: objectUrl = createObjectUrl($outputFileName, mimeType);
</script>

<article>
  <h2>Preview</h2>
  <div class="section">
    <label>MIME Type: <input type="text" bind:value={mimeType} /></label>
  </div>
  {#if objectUrl}
    <div class="section">
      <a href={objectUrl} download={$outputFileName}>Download</a>
    </div>
    <div class="section">
      <video src={objectUrl} controls>
        <track kind="captions" />
      </video>
    </div>
  {:else}
    <p>No outputs.</p>
  {/if}
</article>

<style>
  .section {
    margin-block: 1rem;
  }
</style>
