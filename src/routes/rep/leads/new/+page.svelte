<script lang="ts">
  import MobileLayout from "$lib/components/layout/mobile-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { goto } from "$app/navigation";
  import { toast } from "$lib/toast.svelte.js";
  import api, { type Product, type Certification } from "$lib/api.js";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Select from "$lib/components/ui/select.svelte";
  import Textarea from "$lib/components/ui/textarea.svelte";

  let products = $state<Product[]>([]);
  let certifications = $state<Certification[]>([]);
  let loading = $state(true);
  let submitting = $state(false);

  let form = $state({
    productId: "",
    businessName: "",
    contactName: "",
    contactPhone: "",
    notes: "",
  });

  $effect(() => {
    Promise.all([api.products.list(), api.certifications.list()])
      .then(([p, c]) => {
        products = p;
        certifications = c;
      })
      .finally(() => { loading = false; });
  });

  let certifiedProducts = $derived(
    products.filter((p) => certifications.some((c) => c.productId === p.id && c.passed)),
  );

  let productOptions = $derived(
    certifiedProducts.map((p) => ({ value: String(p.id), label: p.name })),
  );

  async function submit(e: Event) {
    e.preventDefault();
    if (!form.productId) {
      toast({ title: i18n.t("selectProduct"), variant: "destructive" });
      return;
    }
    submitting = true;
    try {
      await api.leads.create({
        productId: parseInt(form.productId),
        businessName: form.businessName,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        notes: form.notes || undefined,
      });
      toast({ title: i18n.t("leadSubmitted") });
      goto("/rep/leads");
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      submitting = false;
    }
  }
</script>

<MobileLayout title={i18n.t("submitLead")} showBack>
  <div class="p-4">
    {#if loading}
      <div class="flex justify-center py-8">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else if certifiedProducts.length === 0}
      <div class="text-center py-12 space-y-3">
        <p class="text-muted-foreground text-sm">{i18n.t("noCertifiedProducts")}</p>
        <Button variant="outline" onclick={() => goto("/rep/products")}>
          {i18n.t("browseProducts")}
        </Button>
      </div>
    {:else}
      <form onsubmit={submit} class="space-y-4">
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("product")}</label>
          <Select
            bind:value={form.productId}
            options={productOptions}
            placeholder={i18n.t("selectProduct")}
          />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("businessName")}</label>
          <Input bind:value={form.businessName} placeholder={i18n.t("businessName")} />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("contactName")}</label>
          <Input bind:value={form.contactName} placeholder={i18n.t("contactName")} />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("contactPhone")}</label>
          <Input bind:value={form.contactPhone} type="tel" placeholder="+963..." />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("notes")} ({i18n.t("optional")})</label>
          <Textarea bind:value={form.notes} rows={3} placeholder={i18n.t("notes")} />
        </div>
        <Button
          type="submit"
          class="w-full"
          disabled={submitting || !form.productId || !form.businessName || !form.contactName || !form.contactPhone}
        >
          {#if submitting}
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {/if}
          {i18n.t("submitLead")}
        </Button>
      </form>
    {/if}
  </div>
</MobileLayout>
