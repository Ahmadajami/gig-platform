<script lang="ts">
  import { Check } from "@lucide/svelte";

  let {
    checked = $bindable(false),
    disabled = false,
    id,
    onchange,
  }: {
    checked?: boolean;
    disabled?: boolean;
    id?: string;
    onchange?: (v: boolean) => void;
  } = $props();

  function toggle() {
    if (!disabled) {
      checked = !checked;
      onchange?.(checked);
    }
  }
</script>

<button
  {id}
  type="button"
  role="checkbox"
  aria-checked={checked}
  {disabled}
  onclick={toggle}
  class="h-4 w-4 shrink-0 rounded border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 {checked ? 'bg-primary border-primary' : 'bg-white'}"
>
  {#if checked}
    <Check size={12} class="text-white m-auto" />
  {/if}
</button>
