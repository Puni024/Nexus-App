import type { Role, AppRoute } from "../Types/Filtes";


export const appRoutes: AppRoute[] = [
    {
        path: "overview",
        component: "Overview",
        roles: ["admin"],
    },
    {
        path: "application",
        component: "Application",
        roles: ["user"],
    },
    {
        path: "users",
        component: "Users",
        roles: ["admin"],
    },
    {
        path: "reports",
        component: "Reports",
        roles: ["admin", "user"],
    },
    {
        path: "settings",
        component: "Settings",
        roles: ["admin", "user"],
    },
];
