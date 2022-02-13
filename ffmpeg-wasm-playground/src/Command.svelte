<script lang="ts">
  import {
    ffmpeg,
    file,
    isReady,
    log,
    outputFileName,
    progressRatio,
  } from "./store";

  $: inputFileOption = $file ? ["-i", $file.name] : null;

  $: displayCommand = [
    "ffmpeg",
    ...(inputFileOption ? [inputFileOption[0], `"${inputFileOption[1]}"`] : []),
  ].join(" ");

  let options = "";
  let output = "";

  async function runFFmpeg() {
    try {
      await $ffmpeg.run(
        ...(inputFileOption ?? []),
        ...options.split(" "),
        output
      );
      $outputFileName = output || undefined;
    } catch (error) {
      log.pushError(error);
    }
  }

  $: progressPercentage = Math.floor($progressRatio * 100);
</script>

<article>
  <h2>Command</h2>
  <form on:submit|preventDefault={runFFmpeg}>
    <pre><code class="command"
        ><span class="command-default">{displayCommand}&nbsp;</span><label
          class="label-options label"
          for="command-options">Options - e.g., -s 1280x720</label
        ><input
          id="command-options"
          class="command-options input"
          type="text"
          bind:value={options}
          disabled={!$isReady}
        /><span class="command-space">&nbsp;</span><label
          class="label-output label"
          for="command-output">Output - e.g., converted.mp4</label
        ><input
          id="command-output"
          class="command-output input"
          type="text"
          bind:value={output}
          disabled={!$isReady}
        /></code
      ></pre>
    <button type="submit" disabled={!$isReady}>Run</button>
  </form>
  <progress value={$progressRatio} />
  {progressPercentage}%
</article>

<style>
  .command {
    display: grid;
    grid-template-columns: max-content 4fr max-content 3fr;
    grid-template-rows: auto auto;
    grid-template-areas:
      ".               label-options   .             label-output  "
      "command-default command-options command-space command-output";
    align-items: baseline;
    row-gap: 0.25em;
    font-family: "SF Mono", monospace;
    font-size: 1rem;
  }

  .command-default {
    grid-area: command-default;
  }

  .label-options {
    grid-area: label-options;
  }

  .command-options {
    grid-area: command-options;
  }

  .command-space {
    grid-area: command-space;
  }

  .label-output {
    grid-area: label-output;
  }

  .command-output {
    grid-area: command-output;
  }

  .label {
    font-size: 0.75rem;
    opacity: 0.6;
  }

  .input {
    font-family: inherit;
    font-size: 1rem;
  }
</style>
