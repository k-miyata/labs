<script lang="ts">
  import { afterUpdate } from "svelte";
  import { log } from "./store";

  let containerElement: HTMLDivElement | undefined;

  afterUpdate(() => {
    if (!containerElement) return;
    containerElement.scrollTop = containerElement.scrollHeight;
  });

  const dateTimeFormat = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
</script>

<article>
  <h2>Log</h2>
  <div class="container" bind:this={containerElement}>
    {#each $log as { date, message }}
      <pre class="row"><time class="time" datetime={date.toISOString()}
          >{dateTimeFormat.format(date)}</time
        > {message}</pre>
    {/each}
  </div>
</article>

<style>
  .container {
    overflow-y: auto;
    height: 40vh;
    padding: 0.125rem 0.625rem;
    border: 1px solid hsl(0deg 0% 50% / 15%);
    border-radius: 4px;
    background-color: hsl(0deg 0% 50% / 5%);
  }

  .row {
    margin: 0;
    padding: 0.375em 0;
    font-family: "SF Mono", monospace;
    font-size: 0.75rem;
    white-space: pre-wrap;
  }

  .row:not(:last-child) {
    border-bottom: 1px solid hsl(0deg 0% 50% / 15%);
  }

  .time {
    opacity: 0.6;
  }
</style>
