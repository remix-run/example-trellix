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

        <link rel="stylesheet" href={stylesHref} />
        <Meta />
        <Links />
      </head>
      <body className="h-screen overflow-hidden">
        <div className="h-full flex flex-col bg-gray-800">
          <div>
            <img
              src="/remix-logo-new@dark.png"
              alt="Remix Logo: Colorful letters glowing on a dark background"
              className="h-16 p-2"
            />
          </div>

          <div className="flex-grow min-h-0">
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
