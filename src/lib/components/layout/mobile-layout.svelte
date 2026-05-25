<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { i18n } from "$lib/i18n.svelte.js";
  import { authStore } from "$lib/auth.svelte.js";
  import {
    LayoutDashboard, ShoppingBag, ClipboardList, DollarSign,
  } from "@lucide/svelte";

  let { children, title, showBack = false }: {
    children?: Snippet;
    title?: string;
    showBack?: boolean;
  } = $props();

  const tabs = [
    { label: "dashboard", path: "/rep/dashboard", icon: LayoutDashboard },
    { label: "products", path: "/rep/products", icon: ShoppingBag },
    { label: "leads", path: "/rep/leads", icon: ClipboardList },
    { label: "financials", path: "/rep/financials", icon: DollarSign },
  ];

  function isActive(path: string) {
    const currentPath = page.url.pathname;
    return currentPath === path || (path === "/rep/leads" && currentPath === "/rep/leads/new");
  }
</script>

<div class="flex flex-col h-screen bg-background overflow-hidden">
  <!-- Header -->
  <header class="bg-sidebar text-sidebar-foreground px-4 pt-10 pb-4 shrink-0">
    <div class="flex items-center justify-between">
      {#if showBack}
        <button
          class="text-sidebar-foreground/70 hover:text-sidebar-foreground"
          onclick={() => history.back()}
        >
          ←
        </button>
      {:else}
        <div>
          <p class="text-xs text-sidebar-foreground/60">{i18n.t("welcome")}</p>
          <p class="font-semibold">{authStore.user?.name}</p>
        </div>
      {/if}
      {#if title}
        <h1 class="font-semibold text-base">{title}</h1>
      {:else}
        <div class="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
          <span class="text-white font-bold text-sm">G</span>
        </div>
      {/if}
    </div>
  </header>

  <!-- Content -->
  <main class="flex-1 overflow-y-auto">
    {@render children?.()}
  </main>

  <!-- Bottom Nav -->
  <nav class="bg-white border-t border-border px-2 pb-safe shrink-0">
    <div class="flex">
      {#each tabs as tab}
        <button
          class="flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors
            {isActive(tab.path)
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'}"
          onclick={() => goto(tab.path)}
        >
          <tab.icon size={20} />
          <span>{i18n.t(tab.label as any)}</span>
        </button>
      {/each}
    </div>
  </nav>
</div>
