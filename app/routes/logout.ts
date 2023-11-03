import { redirectWithClearedCookie } from "~/auth/auth";

export function action() {
  return redirectWithClearedCookie();
}
