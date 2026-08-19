import {
  sectionNavigation,
  type NavRoute,
} from "./navigation";

import type {
  Role,
  Section,
} from "../Types/Filtes";

export const getRoutesForSection = (
  section: Section,
  role: Role
): NavRoute[] => {
  return sectionNavigation[section].filter(
    (route) => route.roles.includes(role)
  );
};

export const getDefaultPathForRole = (
  role: Role
): string => {
  return role === "admin"
    ? "/admin"
    : "/home";
};