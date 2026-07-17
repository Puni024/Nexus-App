import {appRoutes} from "./routes"
import type { Role } from "../Types/Filtes";

export const menuList = (role: Role) =>
  appRoutes.filter((route) => route.roles.includes(role));