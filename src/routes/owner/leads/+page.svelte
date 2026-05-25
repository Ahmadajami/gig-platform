<script lang="ts">
  import DesktopLayout from "$lib/components/layout/desktop-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { toast } from "$lib/toast.svelte.js";
  import api, { type Lead } from "$lib/api.js";
  import Button from "$lib/components/ui/button.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import { Check, X } from "@lucide/svelte";
  import { formatSYP } from "$lib/currency.js";

  let leads = $state<Lead[]>([]);
  let loading = $state(true);
  let filter = $state("all");

  async function load() {
    loading = true;
    leads = await api.leads.list();
    loading = false;
  }

  $effect(() => { load(); });

  let displayed = $derived(
    filter === "all" ? leads : leads.filter((l) => l.status === filter),
  );

  function statusVariant(s: string) {
    if (s === "approved") return "success";
    if (s === "rejected") return "destructive";
    return "warning";
  }

  async function approve(id: number) {
    try {
      await api.leads.approve(id);
      await load();
      toast({ title: i18n.t("leadApproved") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    }
  }

  async function reject(id: number) {
    try {
      await api.leads.reject(id);
      await load();
      toast({ title: i18n.t("leadRejected") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    }
  }

  const filters = [
    { value: "all", label: i18n.t("all") },
    { value: "pending", label: i18n.t("pending") },
    { value: "approved", label: i18n.t("approved") },
    { value: "rejected", label: i18n.t("rejected") },
  ];
</script>

<DesktopLayout title={i18n.t("leads")}>
  <div class="space-y-4">
    <!-- Filter tabs -->
    <div class="flex gap-1 bg-muted/30 rounded-lg p-1 w-fit">
      {#each filters as f}
        <button
          class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors {filter === f.value ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
          onclick={() => (filter = f.value)}
        >
          {f.label}
        </button>
      {/each}
    </div>

    {#if loading}
      <div class="flex justify-center py-12">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <div class="bg-white rounded-xl border border-border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-muted/30 border-b border-border">
            <tr>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("businessName")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("contactName")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("product")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("rep")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("status")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("commission")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {#each displayed as lead}
              <tr class="border-b border-border last:border-0 hover:bg-muted/10">
                <td class="p-3 font-medium">{lead.businessName}</td>
                <td class="p-3 text-muted-foreground">{lead.contactName}</td>
                <td class="p-3 text-muted-foreground">{lead.productName ?? "—"}</td>
                <td class="p-3 text-muted-foreground">{lead.repName ?? "—"}</td>
                <td class="p-3">
                  <Badge variant={statusVariant(lead.status) as any}>{i18n.t(lead.status as any)}</Badge>
                </td>
                <td class="p-3">{lead.repCommission != null ? formatSYP(lead.repCommission) : "—"}</td>
                <td class="p-3">
                  {#if lead.status === "pending"}
                    <div class="flex gap-1">
                      <Button size="sm" variant="ghost" onclick={() => approve(lead.id)} class="h-7 px-2 text-emerald-600 hover:bg-emerald-50">
                        <Check size={14} />
                      </Button>
                      <Button size="sm" variant="ghost" onclick={() => reject(lead.id)} class="h-7 px-2 text-amber-600 hover:bg-amber-50">
                        <X size={14} />
                      </Button>
                    </div>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if displayed.length === 0}
          <p class="text-center text-muted-foreground py-10">{i18n.t("noLeadsYet")}</p>
        {/if}
      </div>
    {/if}
  </div>
</DesktopLayout>
