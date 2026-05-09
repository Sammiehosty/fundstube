// Centralized API Service for Fundstube
// Points to server-side MySQL via environment variable VITE_API_URL

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'earning' | 'bonus';
  amount: number;
  status: 'approved' | 'pending' | 'canceled';
  timestamp: number;
  description: string;
}

export interface UserProfile {
  fullName: string;
  phone: string;
  email: string;
  balance: number;
  earnings: number;
  adsWatched: number;
  transactions: Transaction[];
}

export interface AccessCode {
  code: string;
  user: string | null;
  totalEarned: number;
  status: 'active' | 'revoked';
  profile?: UserProfile;
}

export interface PaymentSubmission {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  country: string;
  timestamp: number;
  price: number;
}

export interface AdminSettings {
  appName: string;
  price: number;
  accountNumber: string;
  accountName: string;
  bankName: string;
  remark: string;
  adminPassword: string;
  adminUsdtWallet: string;
  telegramLink: string;
  communityPopupEnabled: boolean;
  supportCode: string;
  supportEnabled: boolean;
  minWithdrawalBank: number;
  minWithdrawalUsdt: number;
  autoApprovePayments: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://receipt.sammiehost.com/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  // Ensure we don't have double slashes if API_BASE_URL ends with /
  const cleanBase = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBase}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error on ${url} (${response.status}):`, errorText);
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return {} as T;
  } catch (error: any) {
    console.error(`Network request failed for ${url}:`, error);
    // Re-throw a cleaner error message for the UI
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Connection refused. Please check if your API server is running and CORS is enabled.');
    }
    throw error;
  }
}

export type Step = 
  | 'landing' 
  | 'select-country' 
  | 'purchase-pass' 
  | 'secure-payment' 
  | 'transfer-details' 
  | 'verifying' 
  | 'transfer-success'
  | 'failed';

export interface FormData {
  fullName: string;
  phone: string;
  email: string;
  country: string;
}

export const api = {
  // Settings
  getSettings: () => request<AdminSettings>('/settings'),
  saveSettings: (settings: AdminSettings) => request<void>('/settings', {
    method: 'POST',
    body: JSON.stringify(settings)
  }),

  // Submissions
  getSubmissions: () => request<PaymentSubmission[]>('/submissions'),
  saveSubmission: (submission: PaymentSubmission) => request<void>('/submissions', {
    method: 'POST',
    body: JSON.stringify(submission)
  }),
  clearSubmissions: () => request<void>('/submissions/clear', { method: 'POST' }),

  // Access Codes
  getAccessCodes: () => request<AccessCode[]>('/codes'),
  saveAccessCodes: (codes: AccessCode[]) => request<void>('/codes', {
    method: 'POST',
    body: JSON.stringify(codes)
  }),
  deleteCode: (code: string) => request<void>(`/codes/${code}`, {
    method: 'DELETE'
  }),
  validateCode: (code: string) => request<{valid: boolean, data?: AccessCode}>(`/codes/validate/${code}`),
  
  // User Profile
  updateProfile: (code: string, profile: UserProfile) => request<void>(`/profile/${code}`, {
    method: 'POST',
    body: JSON.stringify(profile)
  }),
  getProfile: (code: string) => request<UserProfile>(`/profile/${code}`),
  getAllEarnings: () => request<Transaction[]>('/transactions/earnings'),
  generateUserCode: (fullName: string) => request<{code: string}>(`/codes/generate-user`, {
    method: 'POST',
    body: JSON.stringify({ fullName })
  }),
};
