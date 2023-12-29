import { type MetaFunction } from "@remix-run/node";
import invariant from "tiny-invariant";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { badRequest, notFound } from "~/http/bad-request";
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
  let accountId = await requireAuthCookie(request);

  invariant(params.id, "Missing board ID");
  let id = Number(params.id);

  let board = await getBoardData(id, accountId);
  if (!board) throw notFound();

  return { board };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data ? data.board.name : "Board"} | Trellix` }];
};

export { Board as default };

export async function action({ request, params }: ActionFunctionArgs) {
  let accountId = await requireAuthCookie(request);
  let boardId = Number(params.id);
  invariant(boardId, "Missing boardId");

  let formData = await request.formData();
  let intent = formData.get("intent");

  if (!intent) throw badRequest("Missing intent");

  switch (intent) {
    case INTENTS.deleteCard: {
      let id = String(formData.get("itemId") || "");
      await deleteCard(id, accountId);
      break;
    }
    case INTENTS.updateBoardName: {
      let name = String(formData.get("name") || "");
      invariant(name, "Missing name");
      await updateBoardName(boardId, name, accountId);
      break;
    }
    case INTENTS.moveItem:
    case INTENTS.createItem: {
      let mutation = parseItemMutation(formData);
      await upsertItem({ ...mutation, boardId }, accountId);
      break;
    }
    case INTENTS.createColumn: {
      let { name, id } = Object.fromEntries(formData);
      invariant(name, "Missing name");
      invariant(id, "Missing id");
      await createColumn(boardId, String(name), String(id), accountId);
      break;
    }
    case INTENTS.updateColumn: {
      let { name, columnId } = Object.fromEntries(formData);
      if (!name || !columnId) throw badRequest("Missing name or columnId");
      await updateColumnName(String(columnId), String(name), accountId);
      break;
    }
    default: {
      throw badRequest(`Unknown intent: ${intent}`);
    }
  }

  return { ok: true };
}
