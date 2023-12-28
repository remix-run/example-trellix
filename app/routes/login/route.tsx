import { json, redirect, type DataFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";

import { redirectIfLoggedInLoader, setAuthOnResponse } from "~/auth/auth";
import { Button } from "~/components/button";
import { Input, Label } from "~/components/input";

import { validate } from "./validate";
import { login } from "./queries";

export const loader = redirectIfLoggedInLoader;

export const meta = () => {
  return [{ title: "Trellix Login" }];
};

export async function action({ request }: DataFunctionArgs) {
  let formData = await request.formData();
  let email = String(formData.get("email") || "");
  let password = String(formData.get("password") || "");

  let errors = validate(email, password);
  if (errors) {
    return json({ ok: false, errors }, 400);
  }

  let userId = await login(email, password);
  if (userId === false) {
    return json(
      { ok: false, errors: { password: "Invalid credentials" } },
      400,
    );
  }

  let response = redirect("/home");
  return setAuthOnResponse(response, userId);
}

export default function Signup() {
  let actionResult = useActionData<typeof action>();

  return (
    <div className="flex min-h-full flex-1 flex-col mt-20 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2
          id="login-header"
          className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900"
        >
          Log in
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <Form className="space-y-6" method="post">
            <div>
              <Label htmlFor="email">
                Email address{" "}
                {actionResult?.errors?.email && (
                  <span id="email-error" className="text-brand-red">
                    {actionResult.errors.email}
                  </span>
                )}
              </Label>
              <Input
                autoFocus
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-describedby={
                  actionResult?.errors?.email ? "email-error" : "login-header"
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="password">
                Password{" "}
                {actionResult?.errors?.password && (
                  <span id="password-error" className="text-brand-red">
                    {actionResult.errors.password}
                  </span>
                )}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                aria-describedby="password-error"
                required
              />
            </div>

            <div>
              <Button type="submit">Sign in</Button>
            </div>
            <div className="text-sm text-slate-500">
              Don't have an account?{" "}
              <Link className="underline" to="/signup">
                Sign up
              </Link>
              .
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
