<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { authStore, ensureAuthenticated } from '$lib/auth.svelte';
	import { i18n } from '$lib/i18n.svelte';
	import Toaster from '$lib/components/ui/toaster.svelte';
	import '../app.css';

	let { children } = $props();

	onMount(async () => {
		await ensureAuthenticated();
		i18n.applyToDocument();
	});

	const PUBLIC_PATHS = ['/', '/login'];

	$effect(() => {
		if (!authStore.isLoading) {
			const path = page.url.pathname;
			if (!authStore.isAuthenticated && !PUBLIC_PATHS.includes(path)) {
				goto('/login');
			} else if (authStore.isAuthenticated && (path === '/' || path === '/login')) {
				const role = authStore.user?.role;
				if (role === 'superadmin') goto('/superadmin');
				else if (role === 'owner') goto('/owner');
				else if (role === 'rep') goto('/rep');
			}
		}
	});
</script>

{#if authStore.isLoading}
	<div class="fixed inset-0 flex items-center justify-center bg-background">
		<div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
	</div>
{:else}
	{@render children()}
{/if}

<Toaster />
