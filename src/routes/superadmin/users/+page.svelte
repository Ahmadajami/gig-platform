<script lang="ts">
  import DesktopLayout from "$lib/components/layout/desktop-layout.svelte";
  import { i18n } from "$lib/i18n.svelte.js";
  import { toast } from "$lib/toast.svelte.js";
  import api, { type User } from "$lib/api.js";
  import Button from "$lib/components/ui/button.svelte";
  import Badge from "$lib/components/ui/badge.svelte";
  import Dialog from "$lib/components/ui/dialog.svelte";
  import Input from "$lib/components/ui/input.svelte";
  import Select from "$lib/components/ui/select.svelte";
  import Checkbox from "$lib/components/ui/checkbox.svelte";
  import { UserPlus, Trash2, Check, Users } from "@lucide/svelte";

  let users = $state<User[]>([]);
  let loading = $state(true);
  let selected = $state<Set<number>>(new Set());
  let showCreate = $state(false);
  let showBulk = $state(false);

  let createForm = $state({ name: "", phone: "", password: "", role: "rep", email: "" });
  let bulkArea = $state("");
  let bulkTarget = $state("");
  let saving = $state(false);

  async function load() {
    loading = true;
    users = await api.users.list();
    loading = false;
  }

  $effect(() => { load(); });

  function statusBadge(status: string) {
    if (status === "active") return "success";
    if (status === "pending") return "warning";
    return "secondary";
  }

  function roleBadge(role: string) {
    if (role === "superadmin") return "default";
    if (role === "owner") return "secondary";
    return "outline";
  }

  async function acceptRep(id: number) {
    try {
      await api.users.accept(id);
      await load();
      toast({ title: i18n.t("repApproved") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    }
  }

  async function deleteUser(id: number) {
    if (!confirm(i18n.t("confirmDelete"))) return;
    try {
      await api.users.delete(id);
      await load();
      toast({ title: i18n.t("deletedSuccessfully") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    }
  }

  async function createUser() {
    saving = true;
    try {
      await api.users.create(createForm);
      await load();
      showCreate = false;
      createForm = { name: "", phone: "", password: "", role: "rep", email: "" };
      toast({ title: i18n.t("createdSuccessfully") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      saving = false;
    }
  }

  async function bulkUpdate() {
    if (selected.size === 0) return;
    saving = true;
    try {
      await api.users.bulkUpdate({
        ids: [...selected],
        area: bulkArea || undefined,
        salesTarget: bulkTarget ? parseInt(bulkTarget) : undefined,
      });
      await load();
      selected = new Set();
      showBulk = false;
      toast({ title: i18n.t("savedSuccessfully") });
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      saving = false;
    }
  }

  function toggleSelect(id: number) {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    selected = s;
  }

  function selectAll() {
    if (selected.size === users.length) selected = new Set();
    else selected = new Set(users.map((u) => u.id));
  }

  const roleOptions = [
    { value: "rep", label: i18n.t("rep") },
    { value: "owner", label: i18n.t("owner") },
    { value: "superadmin", label: i18n.t("superadmin") },
  ];
</script>

<DesktopLayout title={i18n.t("users")}>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">{users.length} {i18n.t("users")}</p>
      <div class="flex gap-2">
        {#if selected.size > 0}
          <Button variant="outline" size="sm" onclick={() => (showBulk = true)}>
            <Users size={14} />
            {i18n.t("bulkUpdate")} ({selected.size})
          </Button>
        {/if}
        <Button size="sm" onclick={() => (showCreate = true)}>
          <UserPlus size={14} />
          {i18n.t("addUser")}
        </Button>
      </div>
    </div>

    {#if loading}
      <div class="flex justify-center py-12">
        <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    {:else}
      <div class="bg-white rounded-xl border border-border overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-muted/30 border-b border-border">
            <tr>
              <th class="p-3 w-8">
                <Checkbox
                  checked={selected.size === users.length && users.length > 0}
                  onchange={selectAll}
                />
              </th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("name")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("phone")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("role")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("status")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("area")}</th>
              <th class="p-3 text-start font-medium text-muted-foreground">{i18n.t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {#each users as user}
              <tr class="border-b border-border last:border-0 hover:bg-muted/10">
                <td class="p-3">
                  <Checkbox checked={selected.has(user.id)} onchange={() => toggleSelect(user.id)} />
                </td>
                <td class="p-3 font-medium">{user.name}</td>
                <td class="p-3 text-muted-foreground">{user.phone ?? "—"}</td>
                <td class="p-3">
                  <Badge variant={roleBadge(user.role) as any}>{i18n.t(user.role as any)}</Badge>
                </td>
                <td class="p-3">
                  <Badge variant={statusBadge(user.status) as any}>{i18n.t(user.status as any)}</Badge>
                </td>
                <td class="p-3 text-muted-foreground">{user.area ?? "—"}</td>
                <td class="p-3">
                  <div class="flex items-center gap-1">
                    {#if user.status === "pending" && user.role === "rep"}
                      <Button size="sm" variant="ghost" onclick={() => acceptRep(user.id)} class="h-7 px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                        <Check size={14} />
                        {i18n.t("approve")}
                      </Button>
                    {/if}
                    <Button size="sm" variant="ghost" onclick={() => deleteUser(user.id)} class="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if users.length === 0}
          <p class="text-center text-muted-foreground py-10">{i18n.t("noUsersFound")}</p>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Create Dialog -->
  <Dialog bind:open={showCreate} title={i18n.t("addUser")}>
    <div class="space-y-3">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("name")}</label>
          <Input bind:value={createForm.name} placeholder={i18n.t("name")} />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("phone")}</label>
          <Input bind:value={createForm.phone} placeholder="+963..." type="tel" />
        </div>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">{i18n.t("email")}</label>
        <Input bind:value={createForm.email} placeholder="email@example.com" type="email" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("password")}</label>
          <Input bind:value={createForm.password} type="password" placeholder="••••••••" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">{i18n.t("role")}</label>
          <Select bind:value={createForm.role} options={roleOptions} />
        </div>
      </div>
      <div class="flex gap-2 pt-2">
        <Button onclick={createUser} disabled={saving || !createForm.name || !createForm.phone || !createForm.password}>
          {i18n.t("create")}
        </Button>
        <Button variant="outline" onclick={() => (showCreate = false)}>{i18n.t("cancel")}</Button>
      </div>
    </div>
  </Dialog>

  <!-- Bulk Update Dialog -->
  <Dialog bind:open={showBulk} title={i18n.t("bulkUpdate")} description={i18n.t("bulkUpdateDesc")}>
    <div class="space-y-3">
      <div class="space-y-1">
        <label class="text-sm font-medium">{i18n.t("area")}</label>
        <Input bind:value={bulkArea} placeholder={i18n.t("area")} />
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">{i18n.t("salesTarget")}</label>
        <Input bind:value={bulkTarget} type="number" placeholder="0" />
      </div>
      <div class="flex gap-2 pt-2">
        <Button onclick={bulkUpdate} disabled={saving}>{i18n.t("save")}</Button>
        <Button variant="outline" onclick={() => (showBulk = false)}>{i18n.t("cancel")}</Button>
      </div>
    </div>
  </Dialog>
</DesktopLayout>
