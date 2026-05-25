<script lang="ts">
  import DesktopLayout from "$lib/components/layout/desktop-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { authStore } from "$lib/auth.svelte.js";
  import api, { type DashboardSummary } from "$lib/api.js";
  import { formatSYP } from "$lib/currency.js";

  let summary = $state<DashboardSummary | null>(null);
  let loading = $state(true);

  $effect(() => {
    api.dashboard.summary()
      .then((d) => { summary = d; })
      .catch(() => {})
      .finally(() => { loading = false; });
  });

  const stats = $derived([
    { label: i18n.t("myProducts"), value: summary?.myProducts ?? "—" },
    { label: i18n.t("totalLeads"), value: summary?.myLeads ?? "—" },
    { label: i18n.t("pendingLeads"), value: summary?.myPendingLeads ?? "—" },
    { label: i18n.t("totalCommissions"), value: summary?.totalCommissions != null ? formatSYP(summary.totalCommissions) : "—" },
    { label: i18n.t("totalPlatformFees"), value: summary?.totalPlatformFees != null ? formatSYP(summary.totalPlatformFees) : "—" },
  ]);
</script>

<DesktopLayout title={i18n.t("dashboard")}>
  <div class="space-y-6">
    <div>
      <h2 class="font-semibold text-lg">{i18n.t("welcomeBack")}, {authStore.user?.name}</h2>
      <p class="text-sm text-muted-foreground">{i18n.t("ownerDesc")}</p>
    </div>

    {#if loading}
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {#each Array(5) as _}
          <div class="bg-white rounded-xl border border-border p-5 h-20 animate-pulse"></div>
        {/each}
      </div>
    {:else}
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {#each stats as stat}
          <div class="bg-white rounded-xl border border-border p-5">
            <p class="text-2xl font-bold">{stat.value}</p>
            <p class="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</DesktopLayout>
