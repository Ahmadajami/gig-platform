<script lang="ts">
  import type { Snippet } from "svelte";
  import SidebarNav from "./sidebar-nav.svelte";

  let { children, title }: { children?: Snippet; title?: string } = $props();
</script>

<div class="flex h-screen bg-background overflow-hidden">
  <!-- Sidebar -->
  <aside class="w-56 shrink-0 bg-sidebar flex flex-col overflow-hidden">
    <SidebarNav />
  </aside>

  <!-- Main content -->
  <main class="flex-1 overflow-y-auto">
    {#if title}
      <div class="px-6 py-4 border-b border-border bg-white sticky top-0 z-10">
        <h1 class="text-lg font-semibold text-foreground">{title}</h1>
      </div>
    {/if}
    <div class="p-6">
      {@render children?.()}
    </div>
  </main>
</div>
