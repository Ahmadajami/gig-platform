<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    variant = "default",
    class: cls = "",
    children,
  }: {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
    class?: string;
    children?: Snippet;
  } = $props();

  const variants: Record<string, string> = {
    default: "bg-primary/10 text-primary",
    secondary: "bg-secondary text-secondary-foreground",
    destructive: "bg-destructive/10 text-destructive",
    outline: "border border-border text-foreground",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
  };
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {variants[variant]} {cls}">
  {@render children?.()}
</span>
