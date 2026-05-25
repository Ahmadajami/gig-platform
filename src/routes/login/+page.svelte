<script lang="ts">
  import { authStore, login } from "$lib/auth.svelte.js";
  import { i18n } from "$lib/i18n.svelte.js";
  import { goto } from "$app/navigation";
  import Button from "$lib/components/ui/button.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import { toast } from "$lib/toast.svelte.js";

  let phone = $state("");
  let password = $state("");
  let loading = $state(false);

  async function handleLogin() {
    loading = true;
    try {
      await login(phone, password);
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-sidebar flex items-center justify-center p-4">
  <div class="max-w-md w-full">
    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="p-8 pb-0">
        <div class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-6">
          <span class="text-white font-bold text-xl">G</span>
        </div>
        <h2 class="text-2xl font-bold text-foreground mb-1">{i18n.t("welcomeBack")}</h2>
        <p class="text-muted-foreground">{i18n.t("loginToContinue")}</p>
      </div>

      <div class="p-8 space-y-4">
        <div class="space-y-1">
          <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" for="phone">{i18n.t("phoneNumber")}</label>
          <Input id="phone" type="tel" placeholder="09xx xxx xxx" bind:value={phone} />
        </div>
        <div class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium leading-none" for="password">{i18n.t("password")}</label>
          </div>
          <Input id="password" type="password" placeholder="••••••••" bind:value={password} />
        </div>
        <Button class="w-full h-11 text-base font-semibold" onclick={handleLogin} disabled={loading}>
          {#if loading}
            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin me-2"></span>
          {/if}
          {i18n.t("login")}
        </Button>
      </div>

      <div class="p-8 pt-0 flex justify-center border-t border-border/50 bg-muted/30 py-4">
        <button class="text-sm text-muted-foreground hover:text-foreground" onclick={() => goto("/")}>
          {i18n.t("backToHome")}
        </button>
      </div>
    </div>

    <p class="text-center mt-6 text-sm text-sidebar-foreground/50">
      &copy; {new Date().getFullYear()} {i18n.t("appName")}. All rights reserved.
    </p>
  </div>
</div>
