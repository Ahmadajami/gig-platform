import api, { type User } from "./api.js";
import { goto } from '$app/navigation';

class AuthStore {
    user = $state<User | null>(null);
    isLoading = $state(true);
    isLoggingOut = $state(false);

    get isAuthenticated(): boolean {
        return this.user !== null;
    }

    setUser(user: User | null) {
        this.user = user;
        this.isLoading = false;
    }

    setLoading(loading: boolean) {
        this.isLoading = loading;
    }

    clear() {
        this.user = null;
        this.isLoading = false;
    }
}

export const authStore = new AuthStore();

let lastSuccessfulCheck = 0;
const AUTH_CHECK_EXPIRES_MS = 20000; // 20 seconds

export async function ensureAuthenticated(): Promise<boolean> {
    const now = Date.now();

    // Skip check if user is authenticated and we verified recently
    if (authStore.isAuthenticated && now - lastSuccessfulCheck < AUTH_CHECK_EXPIRES_MS) {
        return true;
    }

    // Show loading spinner only on initial auth check
    if (!authStore.isAuthenticated) {
        authStore.setLoading(true);
    }

    try {
        const user = await api.auth.me();
        authStore.setUser(user);
        lastSuccessfulCheck = now;
        return true;
    } catch (error) {
        authStore.clear();
        lastSuccessfulCheck = 0;
        // Don't redirect if we are already on login or landing
        const path = window.location.pathname;
        if (path !== '/login' && path !== '/') {
            goto('/login');
        }
        return false;
    }
}

export async function login(phone: string, password: string) {
    try {
        const result = await api.auth.login(phone, password);
        authStore.setUser(result.user);
        lastSuccessfulCheck = Date.now();
        const role = result.user.role;
        if (role === "superadmin") goto("/superadmin", { replaceState: true });
        else if (role === "owner") goto("/owner", { replaceState: true });
        else goto("/rep", { replaceState: true });
    } catch (error) {
        authStore.clear();
        throw error;
    }
}

export async function logout() {
    authStore.isLoggingOut = true;
    try {
        await api.auth.logout();
    } catch (error) {
        console.error('Logout failed:', error);
    } finally {
        authStore.clear();
        lastSuccessfulCheck = 0;
        goto('/login', { replaceState: true });
        authStore.isLoggingOut = false;
    }
}
