import {
  json,
  type ActionFunctionArgs,
  redirect,
} from "@remix-run/node";
import { validate } from "./validate";
import { Form, useActionData } from "@remix-run/react";
import { login } from "./login";
import { setAuthOnResponse } from "~/auth/auth";

export async function action({ request }: ActionFunctionArgs) {
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
      { ok: false, errors: { message: "Invalid credentials" } },
      400,
    );
  }

  return setAuthOnResponse(redirect("/home"), userId);
}

export default function Signup() {
  let actionResult = useActionData<typeof action>();

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center pb-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
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
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    aria-describedby="email-error"
                    required
                    className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password{" "}
                  {actionResult?.errors?.password && (
                    <span
                      id="password-error"
                      className="text-brand-red"
                    >
                      {actionResult.errors.password}
                    </span>
                  )}
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    aria-describedby="password-error"
                    required
                    className="px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              {/* <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-3 block text-sm leading-6 text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm leading-6">
                  <a
                    href="#"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </a>
                </div>
              </div> */}

              <div>
                <div className="text-brand-red">
                  {actionResult?.errors?.message ? (
                    actionResult.errors.message
                  ) : (
                    <>&nbsp;</>
                  )}
                </div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-brand-pink px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
