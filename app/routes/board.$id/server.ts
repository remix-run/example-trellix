import invariant from "tiny-invariant";
import {
  redirect,
  type ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";

import { prisma } from "../../db/prisma";
import { badRequest, notFound } from "../../http/bad-response";
import { INTENTS, ItemMutation, parseItemMutation } from "./mutations";
import { requireAuthCookie } from "../../auth/auth";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuthCookie(request);

  let id = Number(params.id);
  invariant(id, "Missing board ID");

  let board = await getBoardData(id);
  if (!board) throw notFound();

  return { board };
}

function upsertItem(mutation: ItemMutation & { boardId: number }) {
  return prisma.item.upsert({
    where: { id: mutation.id },
    create: mutation,
    update: mutation,
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  let boardId = Number(params.id);
  invariant(boardId, "Missing boardId");

  let formData = await request.formData();
  let intent = formData.get("intent");

  if (!intent) throw badRequest("Missing intent");

  switch (intent) {
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

  return request.headers.get("Sec-Fetch-Dest") === "document"
    ? redirect(`/board/${boardId}`)
    : { ok: true, boardId };
}

////////////////////////////////////////////////////////////////////////////////
// Controller Functions
////////////////////////////////////////////////////////////////////////////////

async function moveItem(id: string, columnId: string, order: number) {
  return prisma.item.update({
    where: { id },
    data: { columnId, order },
  });
}

export async function createItem(
  boardId: number,
  columnId: string,
  title: string,
) {
  let itemCountForColumn = await prisma.item.count({
    where: { columnId },
  });
  return prisma.item.create({
    data: {
      title,
      columnId,
      boardId,
      order: itemCountForColumn + 1,
    },
  });
}

export async function updateColumnName(id: string, name: string) {
  return prisma.column.update({
    where: { id },
    data: { name },
  });
}

async function createColumn(boardId: number, name: string, id: string) {
  let columnCount = await prisma.column.count({
    where: { boardId },
  });
  return prisma.column.create({
    data: {
      id,
      boardId,
      name,
      order: columnCount + 1,
    },
  });
}

////////////////////////////////////////////////////////////////////////////////
// Public Functions
////////////////////////////////////////////////////////////////////////////////

export async function getBoardData(boardId: number) {
  return prisma.board.findUnique({
    where: {
      id: boardId,
    },
    include: {
      items: true,
      columns: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}
