<script lang="ts">
  import { goto } from "$app/navigation";
  import { i18n } from "$lib/i18n.svelte.js";
  import Button from "$lib/components/ui/button.svelte";
  import { Globe } from "@lucide/svelte";
</script>

<div class="min-h-screen bg-sidebar flex flex-col items-center justify-center text-center px-4">
  <div class="max-w-lg w-full">
    <div class="w-16 h-16 rounded-2xl bg-sidebar-primary mx-auto mb-6 flex items-center justify-center">
      <span class="text-white font-bold text-2xl">G</span>
    </div>
    <h1 class="text-4xl font-bold text-white mb-3">{i18n.t("appName")}</h1>
    <p class="text-sidebar-foreground/70 text-lg mb-10">{i18n.t("tagline")}</p>

    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <Button size="lg" onclick={() => goto("/login")}>
        {i18n.t("login")}
      </Button>
    </div>

    <button
      class="mt-8 flex items-center gap-2 text-sm text-sidebar-foreground/50 hover:text-sidebar-foreground/70 mx-auto transition-colors"
      onclick={() => i18n.toggleLang()}
    >
      <Globe size={14} />
      {i18n.lang === "ar" ? "English" : "عربي"}
    </button>
  </div>
</div>
