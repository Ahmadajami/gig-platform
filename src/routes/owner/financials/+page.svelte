<script lang="ts">
  import DesktopLayout from "$lib/components/layout/desktop-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import api, { type Lead } from "$lib/api.js";
  import { formatSYP } from "$lib/currency.js";
  import Badge from "$lib/components/ui/badge.svelte";

  let leads = $state<Lead[]>([]);
  let loading = $state(true);

  $effect(() => {
    api.leads.list({ status: "approved" })
      .then((d) => { leads = d; })
      .finally(() => { loading = false; });
  });

  let totalCommissions = $derived(leads.reduce((s, l) => s + (l.repCommission ?? 0), 0));
  let totalFees = $derived(leads.reduce((s, l) => s + (l.platformFee ?? 0), 0));
</script>

<DesktopLayout title={i18n.t("financials")}>
  <div class="space-y-6">
    <div class="grid sm:grid-cols-2 gap-4">
      <div class="bg-white rounded-xl border border-border p-5">
        <p class="text-sm text-muted-foreground">{i18n.t("totalCommissions")}</p>
        <p class="text-2xl font-bold text-foreground mt-1">{formatSYP(totalCommissions)}</p>
      </div>
      <div class="bg-white rounded-xl border border-border p-5">
        <p class="text-sm text-muted-foreground">{i18n.t("totalPlatformFees")}</p>
        <p class="text-2xl font-bold text-foreground mt-1">{formatSYP(totalFees)}</p>
      </div>
    </div>

    {#if loading}
      <div class="flex justify-center py-8">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <div class="bg-white rounded-xl border border-border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-muted/30 border-b border-border">
            <tr>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("businessName")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("product")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("rep")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("commission")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("platformFee")}</th>
            </tr>
          </thead>
          <tbody>
            {#each leads as lead}
              <tr class="border-b border-border last:border-0 hover:bg-muted/10">
                <td class="p-3 font-medium">{lead.businessName}</td>
                <td class="p-3 text-muted-foreground">{lead.productName ?? "—"}</td>
                <td class="p-3 text-muted-foreground">{lead.repName ?? "—"}</td>
                <td class="p-3 font-medium text-emerald-700">{lead.repCommission != null ? formatSYP(lead.repCommission) : "—"}</td>
                <td class="p-3 font-medium text-primary">{lead.platformFee != null ? formatSYP(lead.platformFee) : "—"}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if leads.length === 0}
          <p class="text-center text-muted-foreground py-10">{i18n.t("noLeadsYet")}</p>
        {/if}
      </div>
    {/if}
  </div>
</DesktopLayout>
