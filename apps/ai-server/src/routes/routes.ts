import { chatRoutes } from "./chat";

export const apiRoutes = {
  chat: chatRoutes,
};

export function getApiRoutePath(routeKeys: string[]) {
  return "/api/" + routeKeys.join("/");
}
