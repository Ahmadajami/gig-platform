<script lang="ts">
  import DesktopLayout from "$lib/components/layout/desktop-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { authStore } from "$lib/auth.svelte.js";
  import api, { type DashboardSummary } from "$lib/api.js";

  let summary = $state<DashboardSummary | null>(null);
  let loading = $state(true);

  $effect(() => {
    api.dashboard.summary()
      .then((d) => { summary = d; })
      .catch(() => {})
      .finally(() => { loading = false; });
  });

  const stats = $derived([
    { label: i18n.t("totalUsers"), value: summary?.totalUsers ?? "—" },
    { label: i18n.t("totalReps"), value: summary?.totalReps ?? "—" },
    { label: i18n.t("pendingReps"), value: summary?.pendingReps ?? "—" },
    { label: i18n.t("totalProducts"), value: summary?.totalProducts ?? "—" },
    { label: i18n.t("totalLeads"), value: summary?.totalLeads ?? "—" },
    { label: i18n.t("pendingLeads"), value: summary?.pendingLeads ?? "—" },
  ]);
</script>

<DesktopLayout title={i18n.t("dashboard")}>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <span class="text-primary font-bold text-lg">G</span>
      </div>
      <div>
        <h2 class="font-semibold text-foreground">{i18n.t("welcomeBack")}, {authStore.user?.name}</h2>
        <p class="text-sm text-muted-foreground">{i18n.t("superadminDesc")}</p>
      </div>
    </div>

    {#if loading}
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {#each Array(6) as _}
          <div class="bg-white rounded-xl border border-border p-5 h-20 animate-pulse bg-muted/20"></div>
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {#each stats as stat}
          <div class="bg-white rounded-xl border border-border p-5">
            <p class="text-2xl font-bold text-foreground">{stat.value}</p>
            <p class="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</DesktopLayout>
