import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { requireAuthCookie } from "~/auth/auth";
import { getHomeData, createBoard } from "./query";
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { useEffect, useRef } from "react";

export async function loader({ request }: LoaderFunctionArgs) {
  let userId = await requireAuthCookie(request);
  let boards = await getHomeData(userId);
  return { boards };
}

export async function action({ request }: ActionFunctionArgs) {
  let userId = await requireAuthCookie(request);
  let formData = await request.formData();
  let name = String(formData.get("name"));
  let color = String(formData.get("color"));
  if (!name) {
    return { ok: false, message: "Board name is required" };
  }

  let board = await createBoard(userId, name, color);
  throw redirect(`/board/${board.id}`);
}

export default function Projects() {
  return (
    <div className="h-full bg-gray-50">
      <NewBoard />
      <Boards />
    </div>
  );
}

function Boards() {
  let { boards } = useLoaderData<typeof loader>();
  return (
    <div className="p-8">
      <h2 className="font-bold mb-2 text-xl">Boards</h2>
      <nav className="flex flex-wrap gap-8">
        {boards.map((board) => (
          <Link
            key={board.id}
            to={`/board/${board.id}`}
            className="w-60 h-40 p-4 block border-b-8 shadow rounded hover:shadow-lg hover:scale-105 transition-transform bg-white"
            style={{ borderColor: board.color }}
          >
            <div className="font-bold">{board.name}</div>
          </Link>
        ))}
      </nav>
    </div>
  );
}

function NewBoard() {
  let actionData = useActionData<typeof action>();
  let navigation = useNavigation();

  return (
    <Form method="post" className="p-8 max-w-md">
      <div>
        <h2 className="font-bold mb-2 text-xl">New Board</h2>
        <label
          htmlFor="board-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Name{" "}
          {actionData?.ok === false ? (
            <span className="text-brand-red">{actionData.message}</span>
          ) : null}
        </label>
        <div className="mt-2">
          <input
            id="board-name"
            name="name"
            type="text"
            required
            className="form-input block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <label
            htmlFor="board-color"
            className="text-sm font-medium leading-6 text-gray-900"
          >
            Color
          </label>
          <input
            id="board-color"
            name="color"
            type="color"
            defaultValue="#e0e0e0"
            className="p-0 border"
          />
        </div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md bg-brand-blue px-1 py-1 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          {navigation.state !== "idle" ? "Creating..." : "Create"}
        </button>
      </div>
    </Form>
  );
}
