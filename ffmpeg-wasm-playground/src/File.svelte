<script lang="ts">
  import { fetchFile } from "@ffmpeg/ffmpeg";
  import { ffmpeg, file, isReady, log } from "./store";

  let files: FileList | null = null;

  async function writeFileToFS(inputFile?: File) {
    if ($file) {
      $ffmpeg.FS("unlink", $file.name);
      $file = null;
    }
    if (!inputFile) return false;
    $ffmpeg.FS("writeFile", inputFile.name, await fetchFile(inputFile));
    $file = inputFile;
    return true;
  }

  $: writingFileToFS = writeFileToFS(files?.[0]).catch(log.pushError);
</script>

<article>
  <h2>File</h2>
  <input type="file" disabled={!$isReady} bind:files />
  <dl class="properties">
    <div class="name">
      <dt class="key">Name</dt>
      <dd class="value">
        {#if files?.[0]}
          {files[0].name}
        {:else}
          <span class="none">&mdash;</span>
        {/if}
      </dd>
    </div>
    <div>
      <dt class="key">Size</dt>
      <dd class="value">
        {#if files?.[0]}
          {files[0].size} {files[0].size === 1 ? "Byte" : "Bytes"}
        {:else}
          <span class="none">&mdash;</span>
        {/if}
      </dd>
    </div>
    <div>
      <dt class="key">MIME Type</dt>
      <dd class="value">
        {#if files?.[0]}
          {files[0].type}
        {:else}
          <span class="none">&mdash;</span>
        {/if}
      </dd>
    </div>
  </dl>
  {#if $isReady}
    {#await writingFileToFS}
      <p>Loading...</p>
    {:then result}
      {#if result}
        <p>Successfully loaded.</p>
      {:else}
        <p>Select a file.</p>
      {/if}
    {:catch error}
      <p>{error.toString()}</p>
    {/await}
  {:else}
    <p>Preparing...</p>
  {/if}
</article>

<style>
  .properties {
    display: grid;
    grid-template-columns: max-content max-content max-content;
    grid-template-rows: auto auto;
    gap: 0.5em 2em;
  }

  .name {
    grid-column: 1 / -1;
  }

  .key {
    margin-bottom: 0.25em;
    font-size: 0.75rem;
    opacity: 0.6;
  }

  .value {
    margin-inline-start: 0;
  }

  .none {
    opacity: 0.1;
  }
</style>
