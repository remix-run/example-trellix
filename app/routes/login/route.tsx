import { json, redirect, type DataFunctionArgs } from "@remix-run/node";
import { validate } from "./validate";
import { Form, useActionData } from "@remix-run/react";
import { login } from "./login";
import { redirectIfLoggedInLoader, setAuthOnResponse } from "../../auth/auth";

export const loader = redirectIfLoggedInLoader;

export async function action({ request }: DataFunctionArgs) {
  let formData = await request.formData();

  let email = String(formData.get("email"));
  let password = String(formData.get("password"));

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

  return setAuthOnResponse(redirect("/home"), userId);
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
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address{" "}
                {actionResult?.errors?.email && (
                  <span id="email-error" className="text-brand-red">
                    {actionResult.errors.email}
                  </span>
                )}
              </label>
              <input
                autoFocus
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                aria-describedby={
                  actionResult?.errors?.email ? "email-error" : "login-header"
                }
                required
                className="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password{" "}
                {actionResult?.errors?.password && (
                  <span id="password-error" className="text-brand-red">
                    {actionResult.errors.password}
                  </span>
                )}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                aria-describedby="password-error"
                required
                className="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-blue sm:text-sm sm:leading-6"
              />
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-pink-brand px-3 py-1.5 text-sm font-semibold leading-6 text-white bg-brand-blue shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                Sign in
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
