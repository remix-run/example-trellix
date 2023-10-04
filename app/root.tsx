import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import stylesHref from "./styles.css";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <link rel="stylesheet" href={stylesHref} />
        <Meta />
        <Links />
      </head>
      <body className="h-screen overflow-hidden">
        <div className="h-full flex flex-col min-h-0">
          <div className="bg-stone-800">
            <img
              src="/remix-logo-new@dark.png"
              alt="Remix Logo: Colorful letters glowing on a dark background"
              className="h-16 py-2 px-8"
            />
          </div>

          <div className="flex-grow min-h-0 h-full">
            <Outlet />
          </div>
        </div>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
