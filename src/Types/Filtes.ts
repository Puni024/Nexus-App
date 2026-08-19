export type Theme = "light" | "dark";

export type Role = "admin" | "user";

export type Section = "admin" | "home";

export type Provider = "local" | "google";

export interface AppRoute{
  path: string;
  component: string;
  label: string;
  icon: string;
  roles: Role[];
}

export interface UserInfo {
  Theme: Theme;
  picture: string;
}

export interface User {
  name: string;
  role: Role;
  email: string;
  info: UserInfo;
  isVerified?: boolean;
  provider?: Provider;
}

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}
export interface AppNotification {
  id: number;
  userId: string;
  type: string;
  title: string;
  message: string | null;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  theme: Theme;
  unreadCount: number;
  notifications: AppNotification[];
  loadingList: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<Pick<User, "name" | "isVerified">> & { info?: Partial<UserInfo> }) => void;
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
}