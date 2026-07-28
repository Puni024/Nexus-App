export type Theme = "light" | "dark";

export type Role = "admin" | "user";

export type Section = "admin" | "home";

export type Provider = "local" | "google";

export interface UserInfo {
  Theme: Theme;     // always normalized to "light" | "dark" by AuthContext
  picture: string;  // data URI / URL, empty string if none
}

export interface User {
  name: string;
  role: Role;
  email: string;
  info: UserInfo;
  isVerified?: boolean;
  provider?: Provider;
}

export interface AppRoute {
  path: string;
  component: string;
  label: string;
  icon: string;
  roles: Role[];
}

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  theme: Theme;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<Pick<User, "name" | "isVerified">> & { info?: Partial<UserInfo> }) => void;
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
}