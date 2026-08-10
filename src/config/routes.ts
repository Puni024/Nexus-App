import type { AppRoute, Section } from "../Types/Filtes";

export const adminRoutes: AppRoute[] = [
    { path: "overview", component: "Overview", label: "Overview", icon: "home", roles: ["admin"] },
    { path: "people", component: "People", label: "People", icon: "people", roles: ["admin"] },
    { path: "all-files", component: "AllFiles", label: "All Files", icon: "folder", roles: ["admin"] },
    { path: "newsletterhub", component: "Newsletter_Hub", label: "Newsletter Hub", icon: "newsletter", roles: ["admin"] },
    { path: "users", component: "Users", label: "Users", icon: "users", roles: ["admin"] },
    { path: "approvals", component: "Approvals", label: "Approvals", icon: "approval", roles: ["admin"] },
    { path: "settings", component: "Settings", label: "Settings", icon: "gear", roles: ["admin"] },
];

export const homeRoutes: AppRoute[] = [
    { path: "newsletter", component: "Newsletter", label: "News Letter", icon: "reports", roles: ["user"] },
    { path: "contribution", component: "Contribution", label: "Your Contribution", icon: "contribution", roles: ["user"] },
    { path: "settings", component: "Settings", label: "Settings", icon: "gear", roles: ["user"] },
];

// Single lookup used by both the router and the sidebar
export const sectionRoutes: Record<Section, AppRoute[]> = {
    admin: adminRoutes,
    home: homeRoutes,
};