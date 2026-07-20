
export type Theme = "light" | "dark";

export type Role ="admin" | "user";

export interface User {
  name: string;
  role : Role;
  theme?: Theme;
}

export interface AppRoute {
    path: string;
    component: string;
    roles: Role[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  theme: Theme;
  toggleTheme: () => void;

  login: () => void;
  logout: () => Promise<void>;
}