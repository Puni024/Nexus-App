import { sectionRoutes } from "./routes";
import type { Role, Section, AppRoute } from "../Types/Filtes";

export const getRoutesForSection = (section: Section, role: Role): AppRoute[] =>
  sectionRoutes[section].filter((route) => route.roles.includes(role));

export const getDefaultPathForRole = (role: Role): string =>
  role === "admin" ? "/admin" : "/home";