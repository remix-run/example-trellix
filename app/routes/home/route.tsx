import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";

import { requireAuthCookie } from "~/auth/auth";
import { Button } from "~/components/button";
import { Label, LabeledInput } from "~/components/input";
import { badRequest } from "~/http/bad-response";

import { getHomeData, createBoard } from "./queries";

export const meta = () => {
  return [{ title: "Boards" }];
};

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
  if (!name) throw badRequest("Bad request");
  let board = await createBoard(userId, name, color);
  throw redirect(`/board/${board.id}`);
}

export default function Projects() {
  return (
    <div className="h-full">
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
  let navigation = useNavigation();
  let isCreating = navigation.formData?.get("intent") === "createBoard";

  return (
    <Form method="post" className="p-8 max-w-md">
      <input type="hidden" name="intent" value="createBoard" />
      <div>
        <h2 className="font-bold mb-2 text-xl">New Board</h2>
        <LabeledInput label="Name" name="name" type="text" required />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Label htmlFor="board-color">Color</Label>
          <input
            id="board-color"
            name="color"
            type="color"
            defaultValue="#cbd5e1"
            className="bg-transparent"
          />
        </div>
        <Button type="submit">{isCreating ? "Creating..." : "Create"}</Button>
      </div>
    </Form>
  );
}
