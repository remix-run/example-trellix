import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  type ShouldRevalidateFunctionArgs,
  Link,
} from "@remix-run/react";
import { redirect, type DataFunctionArgs } from "@remix-run/node";

import { LoginIcon, LogoutIcon } from "./icons/icons";
import { getAuthFromRequest } from "./auth/auth";

import "./styles.css";

export async function loader({ request }: DataFunctionArgs) {
  let auth = await getAuthFromRequest(request);
  if (auth && new URL(request.url).pathname === "/") {
    throw redirect("/home");
  }
  return auth;
}

export function shouldRevalidate({ formAction }: ShouldRevalidateFunctionArgs) {
  return formAction && ["/login", "/signup", "logout"].includes(formAction);
}

export default function App() {
  let userId = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <Meta />
        <Links />
      </head>
      <body className="h-screen bg-slate-100 text-slate-900">
        <div className="h-full flex flex-col min-h-0">
          <div className="bg-slate-900 border-b border-slate-800 flex items-center justify-between py-4 px-8 box-border">
            <Link to="/home" className="block leading-3 w-1/3">
              <div className="font-black text-2xl text-white">Trellix</div>
              <div className="text-slate-500">a Remix Demo</div>
            </Link>
            <div className="flex items-center gap-6">
              <IconLink
                href="https://www.youtube.com/watch?v=RTHzZVbTl6c&list=PLXoynULbYuED9b2k5LS44v9TQjfXifwNu&pp=gAQBiAQB"
                icon="/yt_icon_mono_dark.png"
                label="Videos"
              />
              <IconLink
                href="https://github.com/remix-run/example-trellix"
                label="Source"
                icon="/github-mark-white.png"
              />
              <IconLink
                href="https://remix.run/docs/en/main"
                icon="/r.png"
                label="Docs"
              />
            </div>
            <div className="w-1/3 flex justify-end">
              {userId ? (
                <form method="post" action="/logout">
                  <button className="block text-center">
                    <LogoutIcon />
                    <br />
                    <span className="text-slate-500 text-xs uppercase font-bold">
                      Log out
                    </span>
                  </button>
                </form>
              ) : (
                <Link to="/login" className="block text-center">
                  <LoginIcon />
                  <br />
                  <span className="text-slate-500 text-xs uppercase font-bold">
                    Log in
                  </span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex-grow min-h-0 h-full">
            <Outlet />
          </div>
        </div>

        <ScrollRestoration />
        <LiveReload />
        <Scripts />
      </body>
    </html>
  );
}

function IconLink({
  icon,
  href,
  label,
}: {
  icon: string;
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="text-slate-500 text-xs uppercase font-bold text-center"
    >
      <img src={icon} aria-hidden className="inline-block h-8" />
      <span className="block mt-2">{label}</span>
    </a>
  );
}
