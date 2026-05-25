<script lang="ts">
  let {
    value = $bindable(""),
    placeholder = "",
    disabled = false,
    rows = 3,
    class: cls = "",
    id,
  }: {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    class?: string;
    id?: string;
  } = $props();
</script>

<textarea
  {id}
  {placeholder}
  {disabled}
  {rows}
  bind:value
  class="flex w-full rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none {cls}"
></textarea>
