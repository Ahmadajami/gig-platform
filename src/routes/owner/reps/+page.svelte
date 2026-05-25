<script lang="ts">
  import DesktopLayout from "$lib/components/layout/desktop-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { toast } from "$lib/toast.svelte.js";
  import api, { type User } from "$lib/api.js";
  import Button from "$lib/components/ui/button.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import Dialog from "$lib/components/ui/dialog.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import { Pencil } from "@lucide/svelte";

  let reps = $state<User[]>([]);
  let loading = $state(true);
  let editRep = $state<User | null>(null);
  let showEdit = $state(false);
  let area = $state("");
  let target = $state("");
  let saving = $state(false);

  async function load() {
    loading = true;
    reps = await api.users.list({ role: "rep" });
    loading = false;
  }

  $effect(() => { load(); });

  function openEdit(u: User) {
    editRep = u;
    showEdit = true;
    area = u.area ?? "";
    target = String(u.salesTarget ?? "");
  }

  async function saveEdit() {
    if (!editRep) return;
    saving = true;
    try {
      await api.users.update(editRep.id, {
        area: area || undefined,
        salesTarget: target ? parseInt(target) : undefined,
      });
      await load();
      showEdit = false;
      editRep = null;
      toast({ title: i18n.t("savedSuccessfully") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      saving = false;
    }
  }

  function statusVariant(s: string) {
    if (s === "active") return "success";
    if (s === "pending") return "warning";
    return "secondary";
  }
</script>

<DesktopLayout title={i18n.t("reps")}>
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
            <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("phone")}</th>
            <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("status")}</th>
            <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("area")}</th>
            <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("salesTarget")}</th>
            <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {#each reps as rep}
            <tr class="border-b border-border last:border-0 hover:bg-muted/10">
              <td class="p-3 font-medium">{rep.name}</td>
              <td class="p-3 text-muted-foreground">{rep.phone ?? "—"}</td>
              <td class="p-3">
                <Badge variant={statusVariant(rep.status) as any}>{i18n.t(rep.status as any)}</Badge>
              </td>
              <td class="p-3 text-muted-foreground">{rep.area ?? "—"}</td>
              <td class="p-3 text-muted-foreground">{rep.salesTarget ?? "—"}</td>
              <td class="p-3">
                <Button size="sm" variant="ghost" onclick={() => openEdit(rep)} class="h-7 px-2">
                  <Pencil size={14} />
                </Button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
      {#if reps.length === 0}
        <p class="text-center text-muted-foreground py-10">{i18n.t("noRepsYet")}</p>
      {/if}
    </div>
  {/if}

  <Dialog bind:open={showEdit} title={i18n.t("editArea")}>
    <div class="space-y-3">
      <div class="space-y-1">
        <label class="text-sm font-medium">{i18n.t("area")}</label>
        <Input bind:value={area} placeholder={i18n.t("area")} />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">{i18n.t("salesTarget")}</label>
        <Input bind:value={target} type="number" min="0" placeholder="0" />
      </div>
      <div class="flex gap-2 pt-2">
        <Button onclick={saveEdit} disabled={saving}>{i18n.t("save")}</Button>
        <Button variant="outline" onclick={() => { showEdit = false; editRep = null; }}>{i18n.t("cancel")}</Button>
      </div>
    </div>
  </Dialog>
</DesktopLayout>
