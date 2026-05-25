<script lang="ts">
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
  role="switch"
  aria-checked={checked}
  {disabled}
  onclick={toggle}
  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 {checked ? 'bg-primary' : 'bg-muted'}"
>
  <span
    class="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform {checked ? 'translate-x-5' : 'translate-x-0'}"
  ></span>
</button>
