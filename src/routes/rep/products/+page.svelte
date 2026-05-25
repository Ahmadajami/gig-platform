<script lang="ts">
  import MobileLayout from "$lib/components/layout/mobile-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { goto } from "$app/navigation";
  import api, { type Product, type Certification } from "$lib/api.js";
  import Badge from "$lib/components/ui/badge.svelte";
  import { formatSYP } from "$lib/currency.js";
  import { Award, ChevronRight } from "@lucide/svelte";

  let products = $state<Product[]>([]);
  let certifications = $state<Certification[]>([]);
  let loading = $state(true);

  $effect(() => {
    Promise.all([api.products.list(), api.certifications.list()])
      .then(([p, c]) => { products = p; certifications = c; })
      .finally(() => { loading = false; });
  });

  function isCertified(productId: number) {
    return certifications.some((c) => c.productId === productId && c.passed);
  }
</script>

<MobileLayout title={i18n.t("products")}>
  <div class="p-4 space-y-3">
    {#if loading}
      <div class="flex justify-center py-8">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      {#each products as p}
        <div class="bg-white rounded-xl border border-border p-4">
          <div class="flex items-start justify-between gap-2 mb-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="font-semibold text-foreground">{p.name}</h3>
                {#if isCertified(p.id)}
                  <Badge variant="success">
                    <Award size={10} class="me-1" /> {i18n.t("certified")}
                  </Badge>
                {/if}
              </div>
              <p class="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
            <span>{formatSYP(p.subscriptionPrice)}</span>
            <span>{i18n.t(p.rewardStructure as any)}</span>
            <span>{p.questionCount} {i18n.t("questions")}</span>
          </div>

          {#if !isCertified(p.id)}
            <button
              class="mt-3 w-full py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium flex items-center justify-center gap-1 hover:bg-primary/20 transition-colors"
              onclick={() => goto(`/rep/products/${p.id}/quiz`)}
            >
              {i18n.t("takeQuiz")} <ChevronRight size={14} />
            </button>
          {:else}
            <button
              class="mt-3 w-full py-2 rounded-lg bg-muted/50 text-muted-foreground text-sm font-medium flex items-center justify-center gap-1 hover:bg-muted/70 transition-colors"
              onclick={() => goto(`/rep/products/${p.id}/quiz`)}
            >
              {i18n.t("retakeQuiz")} <ChevronRight size={14} />
            </button>
          {/if}
        </div>
      {/each}
      {#if products.length === 0}
        <div class="text-center text-muted-foreground py-12 text-sm">{i18n.t("noProductsYet")}</div>
      {/if}
    {/if}
  </div>
</MobileLayout>
