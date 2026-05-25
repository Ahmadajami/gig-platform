<script lang="ts">
  import DesktopLayout from "$lib/components/layout/desktop-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { toast } from "$lib/toast.svelte.js";
  import api, { type Product } from "$lib/api.js";
  import Button from "$lib/components/ui/button.svelte";
  import Dialog from "$lib/components/ui/dialog.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Select from "$lib/components/ui/select.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";
  import { Plus, Trash2, Pencil } from "@lucide/svelte";
  import { formatSYP } from "$lib/currency.js";

  let products = $state<Product[]>([]);
  let loading = $state(true);
  let showForm = $state(false);
  let editProduct = $state<Product | null>(null);
  let saving = $state(false);

  type FormData = {
    name: string; description: string; prerequisites: string;
    rewardStructure: string; subscriptionPrice: string;
    commissionRate: string; leadBounty: string; platformFeeRate: string;
  };

  let form = $state<FormData>({
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

  function openCreate() {
    editProduct = null;
    form = { name: "", description: "", prerequisites: "", rewardStructure: "per_subscription", subscriptionPrice: "0", commissionRate: "10", leadBounty: "0", platformFeeRate: "10" };
    showForm = true;
  }

  function openEdit(p: Product) {
    editProduct = p;
    form = {
      name: p.name, description: p.description, prerequisites: p.prerequisites,
      rewardStructure: p.rewardStructure, subscriptionPrice: String(p.subscriptionPrice),
      commissionRate: String(Math.round(p.commissionRate * 100)),
      leadBounty: String(p.leadBounty ?? 0),
      platformFeeRate: String(Math.round(p.platformFeeRate * 100)),
    };
    showForm = true;
  }

  async function save() {
    saving = true;
    try {
      const data = {
        name: form.name, description: form.description, prerequisites: form.prerequisites,
        rewardStructure: form.rewardStructure as Product["rewardStructure"],
        subscriptionPrice: parseFloat(form.subscriptionPrice),
        commissionRate: parseFloat(form.commissionRate) / 100,
        leadBounty: parseFloat(form.leadBounty) || null,
        platformFeeRate: parseFloat(form.platformFeeRate) / 100,
      };
      if (editProduct) {
        await api.products.update(editProduct.id, data);
      } else {
        await api.products.create(data);
      }
      await load();
      showForm = false;
      toast({ title: i18n.t("savedSuccessfully") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      saving = false;
    }
  }

  async function del(id: number) {
    if (!confirm(i18n.t("confirmDelete"))) return;
    try {
      await api.products.delete(id);
      await load();
      toast({ title: i18n.t("deletedSuccessfully") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
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
      <Button size="sm" onclick={openCreate}>
        <Plus size={14} /> {i18n.t("addProduct")}
      </Button>
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
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("name")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("owner")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("rewardStructure")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("price")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {#each products as p}
              <tr class="border-b border-border last:border-0 hover:bg-muted/10">
                <td class="p-3 font-medium">{p.name}</td>
                <td class="p-3 text-muted-foreground">{p.ownerName ?? "—"}</td>
                <td class="p-3 text-muted-foreground">{i18n.t(p.rewardStructure as any)}</td>
                <td class="p-3">{formatSYP(p.subscriptionPrice)}</td>
                <td class="p-3">
                  <div class="flex gap-1">
                    <Button size="sm" variant="ghost" onclick={() => openEdit(p)} class="h-7 px-2">
                      <Pencil size={14} />
                    </Button>
                    <Button size="sm" variant="ghost" onclick={() => del(p.id)} class="h-7 px-2 text-destructive hover:bg-destructive/10">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if products.length === 0}
          <p class="text-center text-muted-foreground py-10">{i18n.t("noProductsYet")}</p>
        {/if}
      </div>
    {/if}
  </div>

  <Dialog bind:open={showForm} title={editProduct ? i18n.t("editProduct") : i18n.t("addProduct")} class="max-w-lg">
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
        <Button onclick={save} disabled={saving || !form.name}>{i18n.t("save")}</Button>
        <Button variant="outline" onclick={() => (showForm = false)}>{i18n.t("cancel")}</Button>
      </div>
    </div>
  </Dialog>
</DesktopLayout>
