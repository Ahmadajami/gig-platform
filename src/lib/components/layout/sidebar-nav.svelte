<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { i18n } from "$lib/i18n.svelte.js";
  import { authStore, logout } from "$lib/auth.svelte.js";
  import {
    LayoutDashboard, Users, Package, FileText, Settings,
    LogOut, Globe, ShoppingBag, ClipboardList, UserCheck,
    DollarSign, ChevronRight,
  } from "@lucide/svelte";

  let { collapsed = false }: { collapsed?: boolean } = $props();

  interface NavItem {
    label: string;
    path: string;
    icon: typeof LayoutDashboard;
  }

  const superadminNav: NavItem[] = [
    { label: "dashboard", path: "/superadmin", icon: LayoutDashboard },
    { label: "users", path: "/superadmin/users", icon: Users },
    { label: "products", path: "/superadmin/products", icon: Package },
    { label: "leads", path: "/superadmin/leads", icon: FileText },
    { label: "settings", path: "/superadmin/settings", icon: Settings },
  ];

  const ownerNav: NavItem[] = [
    { label: "dashboard", path: "/owner", icon: LayoutDashboard },
    { label: "products", path: "/owner/products", icon: Package },
    { label: "leads", path: "/owner/leads", icon: FileText },
    { label: "reps", path: "/owner/reps", icon: UserCheck },
    { label: "financials", path: "/owner/financials", icon: DollarSign },
  ];

  const repNav: NavItem[] = [
    { label: "dashboard", path: "/rep", icon: LayoutDashboard },
    { label: "products", path: "/rep/products", icon: ShoppingBag },
    { label: "leads", path: "/rep/leads", icon: ClipboardList },
    { label: "financials", path: "/rep/financials", icon: DollarSign },
  ];

  let navItems = $derived(
    authStore.user?.role === "superadmin"
      ? superadminNav
      : authStore.user?.role === "owner"
        ? ownerNav
        : repNav,
  );

  function isActive(path: string) {
    return page.url.pathname === path;
  }
</script>

<nav class="flex flex-col h-full">
  <!-- Logo -->
  <div class="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
    <div class="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
      <span class="text-white font-bold text-sm">G</span>
    </div>
    {#if !collapsed}
      <div>
        <p class="font-semibold text-sidebar-foreground text-sm leading-tight">
          {i18n.t("appName")}
        </p>
        <p class="text-xs text-sidebar-foreground/50 leading-tight">{i18n.t("tagline")}</p>
      </div>
    {/if}
  </div>

  <!-- Nav Links -->
  <div class="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
    {#each navItems as item}
      <button
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors w-full text-start
          {isActive(item.path)
            ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}"
        onclick={() => goto(item.path)}
      >
        <item.icon size={16} class="shrink-0" />
        {#if !collapsed}
          <span class="flex-1">{i18n.t(item.label as any)}</span>
          {#if isActive(item.path)}
            <ChevronRight size={14} class="opacity-60" />
          {/if}
        {/if}
      </button>
    {/each}
  </div>

  <!-- Footer -->
  <div class="p-2 border-t border-sidebar-border flex flex-col gap-1">
    <button
      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full text-start transition-colors"
      onclick={() => i18n.toggleLang()}
    >
      <Globe size={16} class="shrink-0" />
      {#if !collapsed}
        <span>{i18n.lang === "ar" ? "English" : "عربي"}</span>
      {/if}
    </button>
    <button
      class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-red-500/10 hover:text-red-400 w-full text-start transition-colors"
      onclick={() => logout()}
      disabled={authStore.isLoggingOut}
    >
      <LogOut size={16} class="shrink-0" />
      {#if !collapsed}
        <span>{i18n.t("logout")}</span>
      {/if}
    </button>
  </div>
</nav>
