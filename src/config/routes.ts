import type { AppRoute, Section } from "../Types/Filtes";

export const adminRoutes: AppRoute[] = [
    { path: "overview", component: "Overview", label: "Overview", icon: "home", roles: ["admin"] },
    { path: "users", component: "Users", label: "Users", icon: "users", roles: ["admin"] },
    // { path: "reports", component: "Reports", label: "Reports", icon: "chart", roles: ["admin"] },
    { path: "settings", component: "Settings", label: "Settings", icon: "gear", roles: ["admin"] },
];

export const homeRoutes: AppRoute[] = [
    { path: "Newsletter", component: "Newsletter", label: "News Letter", icon: "home", roles: ["user"] },
    // { path: "reports", component: "Reports", label: "Reports", icon: "chart", roles: ["user"] },
    { path: "settings", component: "Settings", label: "Settings", icon: "gear", roles: ["user"] },
];

// Single lookup used by both the router and the sidebar
export const sectionRoutes: Record<Section, AppRoute[]> = {
    admin: adminRoutes,
    home: homeRoutes,
};