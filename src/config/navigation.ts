import type { Role, Section } from "../Types/Filtes";

export interface NavRoute {
  path: string;
  label: string;
  icon: string;
  roles: Role[];
}

export const adminNavigation: NavRoute[] = [
  {
    path: "overview",
    label: "Overview",
    icon: "home",
    roles: ["admin"],
  },
  {
    path: "people",
    label: "People",
    icon: "people",
    roles: ["admin"],
  },
  {
    path: "all-files",
    label: "All Files",
    icon: "folder",
    roles: ["admin"],
  },
  {
    path: "newsletterhub",
    label: "Newsletter Hub",
    icon: "newsletter",
    roles: ["admin"],
  },
  {
    path: "users",
    label: "Users",
    icon: "users",
    roles: ["admin"],
  },
  {
    path: "approvals",
    label: "Approvals",
    icon: "approval",
    roles: ["admin"],
  },
  {
    path: "settings",
    label: "Settings",
    icon: "gear",
    roles: ["admin"],
  },
];

export const homeNavigation: NavRoute[] = [
  {
    path: "newsletter",
    label: "News Letter",
    icon: "reports",
    roles: ["user"],
  },
  {
    path: "contribution",
    label: "Your Contribution",
    icon: "contribution",
    roles: ["user"],
  },
  {
    path: "settings",
    label: "Settings",
    icon: "gear",
    roles: ["user"],
  },
];

export const sectionNavigation: Record<
  Section,
  NavRoute[]
> = {
  admin: adminNavigation,
  home: homeNavigation,
};