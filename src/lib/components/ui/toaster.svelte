<script lang="ts">
  import { toastStore } from "$lib/toast.svelte.js";
  import { X } from "@lucide/svelte";
</script>

<div class="fixed bottom-4 end-4 z-[100] flex flex-col gap-2 w-80">
  {#each toastStore.toasts as t (t.id)}
    <div
      class="relative flex flex-col gap-1 rounded-xl border p-4 shadow-md text-sm bg-white animate-in slide-in-from-bottom-2 {t.variant === 'destructive' ? 'border-destructive/30 bg-destructive/5' : 'border-border'}"
    >
      <button
        class="absolute top-2 end-2 text-muted-foreground hover:text-foreground"
        onclick={() => toastStore.remove(t.id)}
      >
        <X size={14} />
      </button>
      {#if t.title}
        <p class="font-semibold {t.variant === 'destructive' ? 'text-destructive' : 'text-foreground'}">
          {t.title}
        </p>
      {/if}
      {#if t.description}
        <p class="text-muted-foreground text-xs">{t.description}</p>
      {/if}
    </div>
  {/each}
</div>
