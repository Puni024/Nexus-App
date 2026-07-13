export type role = "admin" | "user" | "guest";

interface SidebarItem {
    label: string,
    icon: string,
    route: string,
}

interface User {
    sidebar: SidebarItem[],

}

export const userData: User = {
    sidebar: [
        { label: "Application", icon: "home", route: "/home" },
        { label: "Users", icon: "users", route: "/users" },
        { label: "Reports", icon: "chart", route: "/reports" },
        { label: "Settings", icon: "gear", route: "/settings" }
    ]

}


export const AdminUser: User = {
    sidebar: [
        { label: "Overview", icon: "home", route: "/overview" },
        { label: "Users", icon: "users", route: "/users" },
        { label: "Reports", icon: "chart", route: "/reports" },
        { label: "Settings", icon: "gear", route: "/settings" }
    ]
}