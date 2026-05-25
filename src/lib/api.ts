async function req<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch("/api" + path, {
    headers: { "Content-Type": "application/json", ...options.headers },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || body.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface User {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  role: "superadmin" | "owner" | "rep";
  status: string;
  area: string | null;
  salesTarget: number | null;
  rewardBalance: number;
  createdAt: string;
}

export interface Product {
  id: number;
  ownerId: number;
  name: string;
  description: string;
  prerequisites: string;
  rewardStructure: "per_subscription" | "per_lead";
  subscriptionPrice: number;
  commissionRate: number;
  leadBounty: number | null;
  platformFeeRate: number;
  ownerName: string | null;
  questionCount: number;
  createdAt: string;
}

export interface Question {
  id: number;
  productId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
}

export interface Lead {
  id: number;
  repId: number;
  productId: number;
  businessName: string;
  contactName: string;
  contactPhone: string;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  repCommission: number | null;
  platformFee: number | null;
  repName: string | null;
  productName: string | null;
  createdAt: string;
}

export interface Certification {
  id: number;
  repId: number;
  productId: number;
  score: number;
  passed: boolean;
  productName: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  totalUsers?: number;
  totalReps?: number;
  totalOwners?: number;
  pendingReps?: number;
  totalProducts?: number;
  totalLeads?: number;
  pendingLeads?: number;
  approvedLeads?: number;
  totalCommissions?: number;
  totalPlatformFees?: number;
  myProducts?: number;
  myCertifications?: number;
  myLeads?: number;
  myPendingLeads?: number;
  myApprovedLeads?: number;
  myEarnings?: number;
}

export interface PlatformSettings {
  onboardingMode: "open" | "interview_required";
  platformFeeRate: number;
}

const api = {
  auth: {
    me: () => req<User>("/auth/me"),
    login: (phone: string, password: string) =>
      req<{ user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      }),
    logout: () => req<void>("/auth/logout", { method: "POST" }),
  },

  settings: {
    get: () => req<PlatformSettings>("/settings"),
    update: (data: Partial<PlatformSettings>) =>
      req<PlatformSettings>("/settings", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  users: {
    list: (params?: { role?: string; status?: string }) => {
      const qs = new URLSearchParams();
      if (params?.role) qs.set("role", params.role);
      if (params?.status) qs.set("status", params.status);
      const q = qs.toString();
      return req<User[]>(`/users${q ? "?" + q : ""}`);
    },
    create: (data: {
      name: string;
      phone: string;
      password: string;
      role: string;
      email?: string;
    }) => req<User>("/users", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<User & { area?: string; salesTarget?: number }>) =>
      req<User>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/users/${id}`, { method: "DELETE" }),
    accept: (id: number) =>
      req<User>(`/users/${id}/accept`, { method: "POST" }),
    bulkUpdate: (data: { ids: number[]; area?: string; salesTarget?: number }) =>
      req<void>("/users/bulk-update", { method: "PATCH", body: JSON.stringify(data) }),
  },

  products: {
    list: () => req<Product[]>("/products"),
    get: (id: number) => req<Product>(`/products/${id}`),
    create: (data: Partial<Product>) =>
      req<Product>("/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: Partial<Product>) =>
      req<Product>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => req<void>(`/products/${id}`, { method: "DELETE" }),
  },

  questions: {
    list: (productId: number) => req<Question[]>(`/products/${productId}/questions`),
    create: (productId: number, data: Omit<Question, "id" | "productId">) =>
      req<Question>(`/products/${productId}/questions`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    delete: (productId: number, questionId: number) =>
      req<void>(`/products/${productId}/questions/${questionId}`, { method: "DELETE" }),
  },

  quiz: {
    submit: (productId: number, answers: Record<number, string>) =>
      req<{ score: number; passed: boolean; certification: Certification }>(
        `/products/${productId}/quiz`,
        { method: "POST", body: JSON.stringify({ answers }) },
      ),
  },

  certifications: {
    list: () => req<Certification[]>("/certifications"),
  },

  leads: {
    list: (params?: { status?: string; repId?: number; productId?: number }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.repId) qs.set("repId", String(params.repId));
      if (params?.productId) qs.set("productId", String(params.productId));
      const q = qs.toString();
      return req<Lead[]>(`/leads${q ? "?" + q : ""}`);
    },
    create: (data: {
      productId: number;
      businessName: string;
      contactName: string;
      contactPhone: string;
      notes?: string;
    }) => req<Lead>("/leads", { method: "POST", body: JSON.stringify(data) }),
    approve: (id: number) =>
      req<Lead>(`/leads/${id}/approve`, { method: "POST" }),
    reject: (id: number) =>
      req<Lead>(`/leads/${id}/reject`, { method: "POST" }),
    delete: (id: number) => req<void>(`/leads/${id}`, { method: "DELETE" }),
  },

  dashboard: {
    summary: () => req<DashboardSummary>("/dashboard/summary"),
  },
};

export default api;
