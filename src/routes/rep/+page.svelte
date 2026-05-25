<script lang="ts">
  import MobileLayout from "$lib/components/layout/mobile-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { goto } from "$app/navigation";
  import api from "$lib/api.js";
  import { formatSYP } from "$lib/currency.js";
  import {
    TrendingUp,
    Users,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
  } from "@lucide/svelte";

  let summary = $state<any>(null);
  let loading = $state(true);

  $effect(() => {
    api.dashboard.summary().then((s) => {
      summary = s;
      loading = false;
    });
  });
</script>

<MobileLayout title={i18n.t("dashboard")}>
  <div class="p-4 space-y-4">
    {#if loading}
      <div class="grid grid-cols-2 gap-3">
        {#each Array(4) as _}
          <div class="h-24 bg-white rounded-xl border border-border animate-pulse"></div>
        {/each}
      </div>
    {:else if summary}
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white p-4 rounded-xl border border-border">
          <div class="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp size={14} />
            <span class="text-xs">{i18n.t("earnings")}</span>
          </div>
          <p class="text-lg font-bold text-foreground leading-none">
            {formatSYP(summary.totalEarnings)}
          </p>
        </div>

        <div class="bg-white p-4 rounded-xl border border-border">
          <div class="flex items-center gap-2 text-muted-foreground mb-1">
            <Users size={14} />
            <span class="text-xs">{i18n.t("leads")}</span>
          </div>
          <p class="text-lg font-bold text-foreground leading-none">
            {summary.totalLeads}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-3">
        <button
          class="flex flex-col items-center justify-center gap-2 p-6 bg-primary text-primary-foreground rounded-2xl shadow-sm hover:opacity-90 transition-opacity"
          onclick={() => goto("/rep/products")}
        >
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Package size={20} />
          </div>
          <span class="text-sm font-semibold">{i18n.t("browseProducts")}</span>
        </button>

        <button
          class="flex flex-col items-center justify-center gap-2 p-6 bg-sidebar-primary text-white rounded-2xl shadow-sm hover:opacity-90 transition-opacity"
          onclick={() => goto("/rep/new-lead")}
        >
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Plus size={20} />
          </div>
          <span class="text-sm font-semibold">{i18n.t("newLead")}</span>
        </button>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white rounded-2xl border border-border overflow-hidden">
        <div class="p-4 border-b border-border flex items-center justify-between">
          <h3 class="font-bold text-foreground">{i18n.t("recentLeads")}</h3>
        </div>
        <div class="divide-y divide-border">
          {#each summary.recentLeads as lead}
            <div class="p-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium">{lead.customerName}</p>
                <p class="text-xs text-muted-foreground">{lead.productName}</p>
              </div>
              <div class="text-right">
                <p class="text-xs font-medium {lead.status === 'approved' ? 'text-emerald-600' : lead.status === 'rejected' ? 'text-destructive' : 'text-amber-600'}">
                  {i18n.t(lead.status)}
                </p>
                <p class="text-[10px] text-muted-foreground mt-0.5">{new Date(lead.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          {/each}
          {#if summary.recentLeads.length === 0}
            <div class="p-8 text-center text-sm text-muted-foreground">
              {i18n.t("noLeadsYet")}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</MobileLayout>
