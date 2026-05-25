export interface Toast {
  id: number;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

class ToastStore {
  toasts = $state<Toast[]>([]);
  private nextId = 0;

  add(t: Omit<Toast, "id">) {
    const id = ++this.nextId;
    this.toasts = [...this.toasts, { ...t, id }];
    setTimeout(() => this.remove(id), 4500);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }
}

export const toastStore = new ToastStore();

export function toast(t: Omit<Toast, "id">) {
  toastStore.add(t);
}
