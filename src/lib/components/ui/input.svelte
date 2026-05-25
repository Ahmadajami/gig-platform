<script lang="ts">
  let {
    value = $bindable(""),
    type = "text",
    placeholder = "",
    disabled = false,
    class: cls = "",
    id,
    min,
    max,
    step,
    oninput,
    onchange,
    onkeydown,
  }: {
    value?: string | number;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
    id?: string;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
    onkeydown?: (e: KeyboardEvent & { currentTarget: HTMLInputElement }) => void;
  } = $props();
</script>

<input
  {id}
  {type}
  {placeholder}
  {disabled}
  {min}
  {max}
  {step}
  bind:value
  {oninput}
  {onchange}
  {onkeydown}
  class="flex h-9 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 {cls}"
/>
