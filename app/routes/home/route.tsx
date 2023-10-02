import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { requireAuthCookie } from "~/auth/auth";
import { getHomeData, createBoard } from "./query";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
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

  await createBoard(userId, name, color);
  return { ok: true, message: "Board created" };
}

export default function Projects() {
  let { boards } = useLoaderData<typeof loader>();
  return (
    <div className="h-full bg-gray-50">
      <nav className="flex flex-wrap gap-8 p-8">
        <NewBoard />
        {boards.map((board) => (
          <Tile>
            <Link
              key={board.id}
              to={String(board.id)}
              className="p-4 block h-full w-full border-b-8 shadow rounded"
              style={{ borderColor: board.color }}
            >
              <div className="font-bold">{board.name}</div>
            </Link>
          </Tile>
        ))}
      </nav>
    </div>
  );
}

function Tile({ children }: { children: React.ReactNode }) {
  return <div className="w-60 h-40 bg-white" children={children} />;
}

function NewBoard() {
  let fetcher = useFetcher<typeof action>();
  let ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      ref.current?.reset();
    }
  }, [fetcher]);

  return (
    <Tile>
      <fetcher.Form
        method="post"
        ref={ref}
        className="p-4 border-gray-100 border h-full"
      >
        <div>
          <label
            htmlFor="board-name"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            New Board{" "}
            {fetcher.data?.ok === false ? (
              <span className="text-red-brand">{fetcher.data.message}</span>
            ) : null}
          </label>
          <div className="mt-2">
            <input
              id="board-name"
              name="name"
              type="text"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
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
            className="flex w-full justify-center rounded-md bg-blue-brand px-1 py-1 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create
          </button>
        </div>
      </fetcher.Form>
    </Tile>
  );
}
