<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    open = $bindable(false),
    title,
    description,
    class: cls = "",
    children,
  }: {
    open?: boolean;
    title?: string;
    description?: string;
    class?: string;
    children?: Snippet;
  } = $props();

  function handleBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget) open = false;
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    onclick={handleBackdrop}
    role="dialog"
    aria-modal="true"
  >
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
    <div class="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-md {cls}">
      {#if title || description}
        <div class="p-6 pb-0">
          {#if title}
            <h2 class="text-lg font-semibold text-foreground">{title}</h2>
          {/if}
          {#if description}
            <p class="text-sm text-muted-foreground mt-1">{description}</p>
          {/if}
        </div>
      {/if}
      <div class="p-6">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
