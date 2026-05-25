<script lang="ts">
  import DesktopLayout from "$lib/components/layout/desktop-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { toast } from "$lib/toast.svelte.js";
  import { goto } from "$app/navigation";
  import api, { type Product, type Question } from "$lib/api.js";
  import Button from "$lib/components/ui/button.svelte";
  import Dialog from "$lib/components/ui/dialog.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Select from "$lib/components/ui/select.svelte";
  import { Plus, Trash2, ArrowLeft } from "@lucide/svelte";
  import { formatSYP } from "$lib/currency.js";

  let { params } = $props();
  let productId = $derived(Number(params.id));

  let product = $state<Product | null>(null);
  let questions = $state<Question[]>([]);
  let loading = $state(true);
  let showAddQ = $state(false);
  let saving = $state(false);

  let qForm = $state({
    questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A",
  });

  async function load() {
    loading = true;
    try {
      [product, questions] = await Promise.all([
        api.products.get(productId),
        api.questions.list(productId),
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  $effect(() => { load(); });

  async function addQuestion() {
    saving = true;
    try {
      await api.questions.create(productId, qForm);
      questions = await api.questions.list(productId);
      showAddQ = false;
      qForm = { questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctAnswer: "A" };
      toast({ title: i18n.t("createdSuccessfully") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      saving = false;
    }
  }

  async function deleteQuestion(qid: number) {
    if (!confirm(i18n.t("confirmDelete"))) return;
    try {
      await api.questions.delete(productId, qid);
      questions = questions.filter((q) => q.id !== qid);
      toast({ title: i18n.t("deletedSuccessfully") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    }
  }

  const answerOptions = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
    { value: "D", label: "D" },
  ];
</script>

<DesktopLayout title={product?.name ?? i18n.t("product")}>
  <div class="space-y-6 max-w-2xl">
    <button
      class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      onclick={() => goto("/owner/products")}
    >
      <ArrowLeft size={14} />
      {i18n.t("backToProducts")}
    </button>

    {#if loading}
      <div class="flex justify-center py-12">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else if product}
      <!-- Product Info -->
      <div class="bg-white rounded-xl border border-border p-6 space-y-4">
        <h2 class="font-semibold text-foreground text-lg">{product.name}</h2>
        <p class="text-sm text-muted-foreground">{product.description}</p>
        <div class="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
          <div>
            <p class="text-muted-foreground">{i18n.t("price")}</p>
            <p class="font-medium">{formatSYP(product.subscriptionPrice)}</p>
          </div>
          <div>
            <p class="text-muted-foreground">{i18n.t("rewardStructure")}</p>
            <p class="font-medium">{i18n.t(product.rewardStructure as any)}</p>
          </div>
          {#if product.rewardStructure === "per_subscription"}
            <div>
              <p class="text-muted-foreground">{i18n.t("commissionRate")}</p>
              <p class="font-medium">{Math.round(product.commissionRate * 100)}%</p>
            </div>
          {:else}
            <div>
              <p class="text-muted-foreground">{i18n.t("leadBounty")}</p>
              <p class="font-medium">{formatSYP(product.leadBounty)}</p>
            </div>
          {/if}
          <div>
            <p class="text-muted-foreground">{i18n.t("platformFeeRate")}</p>
            <p class="font-medium">{Math.round(product.platformFeeRate * 100)}%</p>
          </div>
        </div>
        {#if product.prerequisites}
          <div class="border-t border-border pt-4">
            <p class="text-sm text-muted-foreground mb-1">{i18n.t("prerequisites")}</p>
            <p class="text-sm">{product.prerequisites}</p>
          </div>
        {/if}
      </div>

      <!-- Questions -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-foreground">{i18n.t("quizQuestions")} ({questions.length})</h3>
          <Button size="sm" onclick={() => (showAddQ = true)}>
            <Plus size={14} /> {i18n.t("addQuestion")}
          </Button>
        </div>

        <div class="space-y-3">
          {#each questions as q, i}
            <div class="bg-white rounded-xl border border-border p-4">
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium">{i + 1}. {q.questionText}</p>
                <Button size="sm" variant="ghost" onclick={() => deleteQuestion(q.id)} class="h-7 px-2 text-destructive hover:bg-destructive/10 shrink-0">
                  <Trash2 size={14} />
                </Button>
              </div>
              <div class="grid grid-cols-2 gap-1 mt-2 text-xs text-muted-foreground">
                <span class={q.correctAnswer === "A" ? "text-emerald-700 font-medium" : ""}>A: {q.optionA}</span>
                <span class={q.correctAnswer === "B" ? "text-emerald-700 font-medium" : ""}>B: {q.optionB}</span>
                <span class={q.correctAnswer === "C" ? "text-emerald-700 font-medium" : ""}>C: {q.optionC}</span>
                <span class={q.correctAnswer === "D" ? "text-emerald-700 font-medium" : ""}>D: {q.optionD}</span>
              </div>
            </div>
          {/each}
          {#if questions.length === 0}
            <div class="bg-white rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
              {i18n.t("noQuestionsYet")}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <Dialog bind:open={showAddQ} title={i18n.t("addQuestion")} class="max-w-lg">
    <div class="space-y-3">
      <div class="space-y-1">
        <label class="text-sm font-medium">{i18n.t("question")}</label>
        <Input bind:value={qForm.questionText} placeholder={i18n.t("questionPlaceholder")} />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="text-sm font-medium">A</label>
          <Input bind:value={qForm.optionA} placeholder="Option A" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">B</label>
          <Input bind:value={qForm.optionB} placeholder="Option B" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">C</label>
          <Input bind:value={qForm.optionC} placeholder="Option C" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">D</label>
          <Input bind:value={qForm.optionD} placeholder="Option D" />
        </div>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">{i18n.t("correctAnswer")}</label>
        <Select bind:value={qForm.correctAnswer} options={answerOptions} />
      </div>
      <div class="flex gap-2 pt-2">
        <Button onclick={addQuestion} disabled={saving || !qForm.questionText || !qForm.optionA || !qForm.optionB || !qForm.optionC || !qForm.optionD}>
          {i18n.t("add")}
        </Button>
        <Button variant="outline" onclick={() => (showAddQ = false)}>{i18n.t("cancel")}</Button>
      </div>
    </div>
  </Dialog>
</DesktopLayout>
