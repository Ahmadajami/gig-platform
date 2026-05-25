<script lang="ts">
  import MobileLayout from "$lib/components/layout/mobile-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import api, { type Lead, type DashboardSummary } from "$lib/api.js";
  import { formatSYP } from "$lib/currency.js";
  import Badge from "$lib/components/ui/badge.svelte";
  import { TrendingUp } from "@lucide/svelte";

  let leads = $state<Lead[]>([]);
  let summary = $state<DashboardSummary | null>(null);
  let loading = $state(true);

  $effect(() => {
    Promise.all([
      api.leads.list({ status: "approved" }),
      api.dashboard.summary(),
    ])
      .then(([l, s]) => { leads = l; summary = s; })
      .finally(() => { loading = false; });
  });

  let totalEarnings = $derived(leads.reduce((s, l) => s + (l.repCommission ?? 0), 0));
</script>

<MobileLayout title={i18n.t("financials")}>
  <div class="p-4 space-y-4">
    {#if loading}
      <div class="flex justify-center py-8">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <!-- Earnings card -->
      <div class="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-5 text-white">
        <div class="flex items-center gap-2 mb-1">
          <TrendingUp size={16} class="opacity-70" />
          <p class="text-sm text-white/70">{i18n.t("totalEarnings")}</p>
        </div>
        <p class="text-3xl font-bold">{formatSYP(totalEarnings)}</p>
        <p class="text-sm text-white/60 mt-1">{leads.length} {i18n.t("approvedLeads")}</p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white rounded-xl border border-border p-4">
          <p class="text-lg font-bold">{summary?.myCertifications ?? 0}</p>
          <p class="text-xs text-muted-foreground">{i18n.t("certifications")}</p>
        </div>
        <div class="bg-white rounded-xl border border-border p-4">
          <p class="text-lg font-bold">{summary?.myLeads ?? 0}</p>
          <p class="text-xs text-muted-foreground">{i18n.t("totalLeads")}</p>
        </div>
      </div>

      <!-- Lead history -->
      {#if leads.length > 0}
        <div>
          <p class="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{i18n.t("approvedLeads")}</p>
          <div class="space-y-2">
            {#each leads as lead}
              <div class="bg-white rounded-xl border border-border p-3 flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium">{lead.businessName}</p>
                  <p class="text-xs text-muted-foreground">{lead.productName ?? "—"}</p>
                </div>
                <p class="text-sm font-semibold text-emerald-700">{formatSYP(lead.repCommission)}</p>
              </div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="text-center text-muted-foreground text-sm py-8">{i18n.t("noLeadsYet")}</div>
      {/if}
    {/if}
  </div>
</MobileLayout>
