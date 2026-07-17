import type { Role } from "../Types/Filtes"

export interface SidebarItem {
    label: string;
    icon: string;
    route: string;
    roles: Role[];
}

export const sidebarItems: SidebarItem[] = [
    {
        label: "Overview",
        icon: "home",
        route: "/home/overview",
        roles: ["admin"],
    },
    {
        label: "Application",
        icon: "home",
        route: "/home/application",
        roles: ["user"],
    },
    {
        label: "Users",
        icon: "users",
        route: "/home/users",
        roles: ["admin"],
    },
    {
        label: "Reports",
        icon: "chart",
        route: "/home/reports",
        roles: ["admin", "user"],
    },
    {
        label: "Settings",
        icon: "gear",
        route: "/home/settings",
        roles: ["admin", "user"],
    },
];