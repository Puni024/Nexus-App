
export type Theme = "light" | "dark";

export interface User {
  id: number;
  name: string;
  email: string;
  theme?: Theme;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;

  theme: Theme;
  toggleTheme: () => void;

  login: () => void;
  logout: () => Promise<void>;
setIsAuthenticated: (isAuthenticated: boolean) => void;
}