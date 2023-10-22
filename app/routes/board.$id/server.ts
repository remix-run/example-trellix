import invariant from "tiny-invariant";
import { redirect, type ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { prisma } from "../../db/prisma";
import { badRequest, notFound } from "../../http/bad-response";
import { INTENTS } from "./INTENTS";
import { requireAuthCookie } from "../../auth/auth";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuthCookie(request);

  let id = Number(params.id);
  invariant(id, "Missing board ID");

  let board = await getBoardData(id);
  if (!board) throw notFound();

  return { board };
}

export async function action({ request, params }: ActionFunctionArgs) {
  let boardId = Number(params.id);
  invariant(boardId, "Missing boardId");

  let { intent, ...data } = await request.json();
  if (!intent) throw badRequest("Missing intent");

  switch (intent) {
    case INTENTS.createColumn: {
      let name = data.name;
      if (!name) throw badRequest("Missing name");
      await createColumn(boardId, name);
      break;
    }
    case INTENTS.updateColumn: {
      let { name, columnId } = data;
      if (!name || !columnId) throw badRequest("Missing name or columnId");
      await updateColumnName(columnId, name);
      break;
    }
    case INTENTS.createItem: {
      let { title, columnId } = data;
      if (!title || !columnId) throw badRequest("Missing title or columnId");
      await createItem(boardId, columnId, title);
      break;
    }
    case INTENTS.moveItem: {
      let { order, cardId, columnId } = data;
      await moveItem(cardId, columnId, order);
      break;
    }
    default: {
      throw new Error("Unknown intent");
    }
  }

  return request.headers.get("Sec-Fetch-Dest") === "document" ? redirect(`/board/${boardId}`) : { ok: true, boardId };
}

////////////////////////////////////////////////////////////////////////////////
// Controller Functions
////////////////////////////////////////////////////////////////////////////////

async function moveItem(cardId: number, columnId: number, order: number) {
  return prisma.item.update({
    where: {
      id: cardId,
    },
    data: {
      columnId,
      order,
    },
  });
}

export async function createItem(boardId: number, columnId: number, title: string) {
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

export async function updateColumnName(id: number, name: string) {
  return prisma.column.update({
    where: { id },
    data: { name },
  });
}

async function createColumn(boardId: number, name: string) {
  let columnCount = await prisma.column.count({
    where: { boardId },
  });
  return prisma.column.create({
    data: {
      name,
      boardId,
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
