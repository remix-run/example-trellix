import { type DataFunctionArgs, createCookie, redirect } from "@remix-run/node";

let secret = process.env.COOKIE_SECRET || "default";
if (secret === "default") {
  console.warn(
    "🚨 No COOKIE_SECRET environment variable set, using default. The app is insecure in production.",
  );
  secret = "default-secret";
}

let cookie = createCookie("auth", {
  secrets: [secret],
  // 30 days
  maxAge: 30 * 24 * 60 * 60,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});

export async function getAuthFromRequest(
  request: Request,
): Promise<string | null> {
  let userId = await cookie.parse(request.headers.get("Cookie"));
  return userId ?? null;
}

export async function setAuthOnResponse(
  response: Response,
  userId: string,
): Promise<Response> {
  let header = await cookie.serialize(userId);
  response.headers.append("Set-Cookie", header);
  return response;
}

export async function requireAuthCookie(request: Request) {
  let userId = await getAuthFromRequest(request);
  if (!userId) {
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await cookie.serialize("", {
          maxAge: 0,
        }),
      },
    });
  }
  return userId;
}

export async function redirectIfLoggedInLoader({ request }: DataFunctionArgs) {
  let userId = await getAuthFromRequest(request);
  if (userId) {
    throw redirect("/home");
  }
  return null;
}

export async function redirectWithClearedCookie(): Promise<Response> {
  return redirect("/", {
    headers: {
      "Set-Cookie": await cookie.serialize(null, {
        expires: new Date(0),
      }),
    },
  });
}
