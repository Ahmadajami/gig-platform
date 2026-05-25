<script lang="ts">
  import MobileLayout from "$lib/components/layout/mobile-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { goto } from "$app/navigation";
  import { toast } from "$lib/toast.svelte.js";
  import api, { type Product, type Question } from "$lib/api.js";
  import Button from "$lib/components/ui/button.svelte";

  let { params } = $props();
  let productId = $derived(Number(params.id));

  let product = $state<Product | null>(null);
  let questions = $state<Question[]>([]);
  let loading = $state(true);
  let answers = $state<Record<number, string>>({});
  let submitting = $state(false);
  let result = $state<{ score: number; passed: boolean } | null>(null);

  $effect(() => {
    Promise.all([api.products.get(productId), api.questions.list(productId)])
      .then(([p, q]) => { product = p; questions = q; })
      .catch(() => {})
      .finally(() => { loading = false; });
  });

  let answered = $derived(Object.keys(answers).length);
  let allAnswered = $derived(answered === questions.length && questions.length > 0);

  async function submit() {
    submitting = true;
    try {
      const r = await api.quiz.submit(productId, answers);
      result = r;
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      submitting = false;
    }
  }

  const optionLetters = ["A", "B", "C", "D"] as const;
  function getOption(q: Question, letter: string): string {
    return letter === "A" ? q.optionA : letter === "B" ? q.optionB : letter === "C" ? q.optionC : q.optionD;
  }
</script>

<MobileLayout title={product?.name ?? i18n.t("quiz")} showBack>
  <div class="p-4">
    {#if loading}
      <div class="flex justify-center py-12">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else if result}
      <!-- Result screen -->
      <div class="flex flex-col items-center justify-center py-12 gap-6 text-center">
        <div class="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold {result.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-destructive/10 text-destructive'}">
          {result.score}%
        </div>
        <div>
          <h2 class="text-xl font-bold {result.passed ? 'text-emerald-700' : 'text-destructive'}">
            {result.passed ? i18n.t("quizPassed") : i18n.t("quizFailed")}
          </h2>
          <p class="text-sm text-muted-foreground mt-1">
            {result.passed ? i18n.t("quizPassedDesc") : i18n.t("quizFailedDesc")}
          </p>
        </div>
        <Button onclick={() => goto("/rep/products")}>{i18n.t("backToProducts")}</Button>
      </div>
    {:else if questions.length === 0}
      <div class="text-center text-muted-foreground py-12">{i18n.t("noQuestionsYet")}</div>
    {:else}
      <!-- Quiz questions -->
      <div class="space-y-5 pb-24">
        {#each questions as q, idx}
          <div class="bg-white rounded-xl border border-border p-4">
            <p class="text-sm font-medium mb-3">{idx + 1}. {q.questionText}</p>
            <div class="space-y-2">
              {#each optionLetters as letter}
                <button
                  class="flex items-center gap-3 w-full p-3 rounded-lg border text-sm text-start transition-colors
                    {answers[q.id] === letter
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:bg-muted/30'}"
                  onclick={() => { answers = { ...answers, [q.id]: letter }; }}
                >
                  <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                    {answers[q.id] === letter ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}">
                    {letter}
                  </span>
                  {getOption(q, letter)}
                </button>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <!-- Submit bar -->
      <div class="fixed bottom-16 inset-x-0 p-4 bg-white border-t border-border">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs text-muted-foreground">{answered} / {questions.length} {i18n.t("answered")}</p>
        </div>
        <Button class="w-full" onclick={submit} disabled={!allAnswered || submitting}>
          {#if submitting}
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          {/if}
          {i18n.t("submitQuiz")}
        </Button>
      </div>
    {/if}
  </div>
</MobileLayout>
