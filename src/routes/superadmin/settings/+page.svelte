<script lang="ts">
  import DesktopLayout from "$lib/components/layout/desktop-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { toast } from "$lib/toast.svelte.js";
  import api, { type PlatformSettings } from "$lib/api.js";
  import Switch from "$lib/components/ui/switch.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";

  let settings = $state<PlatformSettings | null>(null);
  let loading = $state(true);
  let saving = $state(false);
  let feeStr = $state("0");

  $effect(() => {
    api.settings.get().then((s) => {
      settings = s;
      feeStr = String(Math.round(s.platformFeeRate * 100));
    }).finally(() => { loading = false; });
  });

  async function save() {
    if (!settings) return;
    saving = true;
    try {
      const rate = parseFloat(feeStr) / 100;
      await api.settings.update({
        onboardingMode: settings.onboardingMode,
        platformFeeRate: rate,
      });
      toast({ title: i18n.t("savedSuccessfully") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      saving = false;
    }
  }
</script>

<DesktopLayout title={i18n.t("settings")}>
  {#if loading}
    <div class="flex justify-center py-12">
      <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if settings}
    <div class="max-w-lg space-y-6">
      <div class="bg-white rounded-xl border border-border p-6 space-y-5">
        <!-- Onboarding Mode -->
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="font-medium text-foreground">{i18n.t("interviewRequired")}</p>
            <p class="text-sm text-muted-foreground">{i18n.t("interviewRequiredDesc")}</p>
          </div>
          <Switch
            checked={settings.onboardingMode === "interview_required"}
            onchange={(v) => { settings!.onboardingMode = v ? "interview_required" : "open"; }}
          />
        </div>

        <hr class="border-border" />

        <!-- Platform Fee -->
        <div class="space-y-2">
          <label class="font-medium text-foreground text-sm" for="fee">{i18n.t("platformFeeRate")} (%)</label>
          <Input id="fee" type="number" min="0" max="100" step="0.5" bind:value={feeStr} class="max-w-xs" />
          <p class="text-xs text-muted-foreground">{i18n.t("platformFeeDesc")}</p>
        </div>
      </div>

      <Button onclick={save} disabled={saving}>
        {#if saving}
          <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        {/if}
        {i18n.t("save")}
      </Button>
    </div>
  {/if}
</DesktopLayout>
