<script lang="ts">
  let {
    value = $bindable(""),
    options,
    placeholder,
    disabled = false,
    class: cls = "",
    id,
    onchange,
  }: {
    value?: string;
    options: Array<{ label: string; value: string }>;
    placeholder?: string;
    disabled?: boolean;
    class?: string;
    id?: string;
    onchange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;
  } = $props();
</script>

<select
  {id}
  {disabled}
  bind:value
  {onchange}
  class="flex h-9 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 {cls}"
>
  {#if placeholder}
    <option value="" disabled selected={!value}>{placeholder}</option>
  {/if}
  {#each options as opt}
    <option value={opt.value}>{opt.label}</option>
  {/each}
</select>
