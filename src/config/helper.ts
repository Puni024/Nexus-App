import {appRoutes} from "./routes"
import type { Role, AppRoute } from "../Types/Filtes";

export const menuList = (role: Role) =>
  appRoutes.filter((route) => route.roles.includes(role));

export const allRoutes: AppRoute[] = appRoutes;