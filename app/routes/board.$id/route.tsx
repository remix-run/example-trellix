import { type MetaFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { badRequest, notFound } from "~/http/bad-response";
import { requireAuthCookie } from "~/auth/auth";

import { parseItemMutation } from "./utils";
import { INTENTS } from "./types";
import {
  createColumn,
  updateColumnName,
  getBoardData,
  upsertItem,
  updateBoardName,
  deleteCard,
} from "./queries";
import { Board } from "./board";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuthCookie(request);

  let id = Number(params.id);
  invariant(id, "Missing board ID");

  let board = await getBoardData(id);
  if (!board) throw notFound();

  return { board };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data ? data.board.name : "Board"} | Trellix` }];
};

export { Board as default };

export async function action({ request, params }: ActionFunctionArgs) {
  let boardId = Number(params.id);
  invariant(boardId, "Missing boardId");

  let formData = await request.formData();
  let intent = formData.get("intent");

  if (!intent) throw badRequest("Missing intent");

  switch (intent) {
    case INTENTS.deleteCard: {
      let id = String(formData.get("itemId"));
      await deleteCard(id);
      break;
    }
    case INTENTS.updateBoardName: {
      let name = String(formData.get("name"));
      invariant(name, "Missing name");
      await updateBoardName(boardId, name);
      break;
    }
    case INTENTS.moveItem:
    case INTENTS.createItem: {
      let mutation = parseItemMutation(formData);
      await upsertItem({ ...mutation, boardId });
      break;
    }
    case INTENTS.createColumn: {
      let { name, id } = Object.fromEntries(formData);
      invariant(name, "Missing name");
      invariant(id, "Missing id");
      await createColumn(boardId, String(name), String(id));
      break;
    }
    case INTENTS.updateColumn: {
      let { name, columnId } = Object.fromEntries(formData);
      if (!name || !columnId) throw badRequest("Missing name or columnId");
      await updateColumnName(String(columnId), String(name));
      break;
    }
    default: {
      throw new Error("Unknown intent");
    }
  }

  return { ok: true };
}
