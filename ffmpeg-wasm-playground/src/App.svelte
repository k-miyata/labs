<script lang="ts">
  import Command from "./Command.svelte";
  import File from "./File.svelte";
  import Log from "./Log.svelte";
  import Preview from "./Preview.svelte";
  import { ffmpeg, isReady } from "./store";

  $ffmpeg.load().then(() => ($isReady = true));
</script>

<h1>FFmpeg</h1>
<File />
<Command />
<Preview />
<Log />
