<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    variant = "default",
    size = "default",
    disabled = false,
    type = "button",
    class: cls = "",
    onclick,
    children,
  }: {
    variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    class?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  } = $props();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

  const variants: Record<string, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-white text-foreground hover:bg-muted/50",
    ghost: "text-foreground hover:bg-muted/50",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };

  const sizes: Record<string, string> = {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-7 px-3 text-xs",
    lg: "h-11 px-6 text-base",
    icon: "h-9 w-9",
  };

  let className = $derived(`${base} ${variants[variant]} ${sizes[size]} ${cls}`);
</script>

<button {type} {disabled} class={className} {onclick}>
  {@render children?.()}
</button>
