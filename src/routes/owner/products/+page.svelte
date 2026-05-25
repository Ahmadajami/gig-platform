<script lang="ts">
  import DesktopLayout from "$lib/components/layout/desktop-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { toast } from "$lib/toast.svelte.js";
  import { goto } from "$app/navigation";
  import api, { type Product } from "$lib/api.js";
  import Button from "$lib/components/ui/button.svelte";
  import Dialog from "$lib/components/ui/dialog.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Select from "$lib/components/ui/select.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import { Plus, ExternalLink } from "@lucide/svelte";
  import { formatSYP } from "$lib/currency.js";

  let products = $state<Product[]>([]);
  let loading = $state(true);
  let showCreate = $state(false);
  let saving = $state(false);

  let form = $state({
    name: "", description: "", prerequisites: "",
    rewardStructure: "per_subscription", subscriptionPrice: "0",
    commissionRate: "10", leadBounty: "0", platformFeeRate: "10",
  });

  async function load() {
    loading = true;
    products = await api.products.list();
    loading = false;
  }

  $effect(() => { load(); });

  async function create() {
    saving = true;
    try {
      await api.products.create({
        name: form.name, description: form.description, prerequisites: form.prerequisites,
        rewardStructure: form.rewardStructure as Product["rewardStructure"],
        subscriptionPrice: parseFloat(form.subscriptionPrice),
        commissionRate: parseFloat(form.commissionRate) / 100,
        leadBounty: form.rewardStructure === "per_lead" ? parseFloat(form.leadBounty) : null,
        platformFeeRate: parseFloat(form.platformFeeRate) / 100,
      });
      await load();
      showCreate = false;
      form = { name: "", description: "", prerequisites: "", rewardStructure: "per_subscription", subscriptionPrice: "0", commissionRate: "10", leadBounty: "0", platformFeeRate: "10" };
      toast({ title: i18n.t("createdSuccessfully") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      saving = false;
    }
  }

  const structureOptions = [
    { value: "per_subscription", label: i18n.t("perSubscription") },
    { value: "per_lead", label: i18n.t("perLead") },
  ];
</script>

<DesktopLayout title={i18n.t("products")}>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">{products.length} {i18n.t("products")}</p>
      <Button size="sm" onclick={() => (showCreate = true)}>
        <Plus size={14} /> {i18n.t("addProduct")}
      </Button>
    </div>

    {#if loading}
      <div class="flex justify-center py-12">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each products as p}
          <div class="bg-white rounded-xl border border-border p-5 flex flex-col gap-3">
            <div class="flex items-start justify-between gap-2">
              <h3 class="font-semibold text-foreground leading-tight">{p.name}</h3>
              <Button size="sm" variant="ghost" onclick={() => goto(`/owner/products/${p.id}`)} class="h-7 px-2 shrink-0">
                <ExternalLink size={14} />
              </Button>
            </div>
            <p class="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
            <div class="text-sm space-y-1 border-t border-border pt-3 mt-auto">
              <div class="flex justify-between">
                <span class="text-muted-foreground">{i18n.t("price")}</span>
                <span class="font-medium">{formatSYP(p.subscriptionPrice)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">{i18n.t("rewardStructure")}</span>
                <span class="font-medium">{i18n.t(p.rewardStructure as any)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">{i18n.t("questions")}</span>
                <span>{p.questionCount}</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
      {#if products.length === 0}
        <div class="text-center py-16 text-muted-foreground">{i18n.t("noProductsYet")}</div>
      {/if}
    {/if}
  </div>

  <Dialog bind:open={showCreate} title={i18n.t("addProduct")} class="max-w-lg">
    <div class="space-y-3">
      <div class="space-y-1">
        <label class="text-sm font-medium">{i18n.t("name")}</label>
        <Input bind:value={form.name} placeholder={i18n.t("productName")} />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">{i18n.t("description")}</label>
        <Textarea bind:value={form.description} placeholder={i18n.t("description")} />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">{i18n.t("prerequisites")}</label>
        <Textarea bind:value={form.prerequisites} rows={2} placeholder={i18n.t("prerequisites")} />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("rewardStructure")}</label>
          <Select bind:value={form.rewardStructure} options={structureOptions} />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("platformFeeRate")} (%)</label>
          <Input bind:value={form.platformFeeRate} type="number" min="0" max="100" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("subscriptionPrice")} (SYP)</label>
          <Input bind:value={form.subscriptionPrice} type="number" min="0" />
        </div>
        {#if form.rewardStructure === "per_subscription"}
          <div class="space-y-1">
            <label class="text-sm font-medium">{i18n.t("commissionRate")} (%)</label>
            <Input bind:value={form.commissionRate} type="number" min="0" max="100" />
          </div>
        {:else}
          <div class="space-y-1">
            <label class="text-sm font-medium">{i18n.t("leadBounty")} (SYP)</label>
            <Input bind:value={form.leadBounty} type="number" min="0" />
          </div>
        {/if}
      </div>
      <div class="flex gap-2 pt-2">
        <Button onclick={create} disabled={saving || !form.name}>{i18n.t("create")}</Button>
        <Button variant="outline" onclick={() => (showCreate = false)}>{i18n.t("cancel")}</Button>
      </div>
    </div>
  </Dialog>
</DesktopLayout>
