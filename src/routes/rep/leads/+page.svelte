<script lang="ts">
  import MobileLayout from "$lib/components/layout/mobile-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { goto } from "$app/navigation";
  import api, { type Lead } from "$lib/api.js";
  import Badge from "$lib/components/ui/badge.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import { Plus } from "@lucide/svelte";
  import { formatSYP } from "$lib/currency.js";

  let leads = $state<Lead[]>([]);
  let loading = $state(true);
  let filter = $state("all");

  $effect(() => {
    api.leads.list()
      .then((d) => { leads = d; })
      .finally(() => { loading = false; });
  });

  let displayed = $derived(
    filter === "all" ? leads : leads.filter((l) => l.status === filter),
  );

  function statusVariant(s: string) {
    if (s === "approved") return "success";
    if (s === "rejected") return "destructive";
    return "warning";
  }

  const filters = [
    { value: "all", label: i18n.t("all") },
    { value: "pending", label: i18n.t("pending") },
    { value: "approved", label: i18n.t("approved") },
    { value: "rejected", label: i18n.t("rejected") },
  ];
</script>

<MobileLayout title={i18n.t("leads")}>
  <div class="p-4 space-y-3">
    <!-- Filter + New -->
    <div class="flex items-center justify-between gap-2">
      <div class="flex gap-1 bg-muted/30 rounded-lg p-0.5 flex-1">
        {#each filters as f}
          <button
            class="flex-1 py-1 rounded-md text-xs font-medium transition-colors {filter === f.value ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground'}"
            onclick={() => (filter = f.value)}
          >
            {f.label}
          </button>
        {/each}
      </div>
      <Button size="sm" onclick={() => goto("/rep/leads/new")}>
        <Plus size={14} />
      </Button>
    </div>

    {#if loading}
      <div class="flex justify-center py-8">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      {#each displayed as lead}
        <div class="bg-white rounded-xl border border-border p-4">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <p class="font-semibold text-foreground text-sm">{lead.businessName}</p>
              <p class="text-xs text-muted-foreground">{lead.contactName} · {lead.contactPhone}</p>
            </div>
            <Badge variant={statusVariant(lead.status) as any}>{i18n.t(lead.status as any)}</Badge>
          </div>
          <div class="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2 mt-2">
            <span>{lead.productName ?? "—"}</span>
            {#if lead.repCommission != null}
              <span class="font-medium text-emerald-700">{formatSYP(lead.repCommission)}</span>
            {/if}
          </div>
        </div>
      {/each}
      {#if displayed.length === 0}
        <div class="text-center text-muted-foreground py-10 text-sm">{i18n.t("noLeadsYet")}</div>
      {/if}
    {/if}
  </div>
</MobileLayout>
