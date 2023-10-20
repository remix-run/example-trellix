import invariant from "tiny-invariant";
import {
  redirect,
  type ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/node";

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
  let id = Number(params.id);
  invariant(id, "Missing board ID");

  let data = await request.formData();
  let intent = String(data.get("intent"));
  if (!intent) throw badRequest("Missing intent");

  switch (intent) {
    case INTENTS.createColumn: {
      let name = String(data.get("name"));
      if (!name) throw badRequest("Missing name");
      await createColumn(id, name);
      break;
    }
    case INTENTS.updateColumn: {
      let name = String(data.get("name"));
      let columnId = Number(data.get("columnId"));
      if (!name || !columnId)
        throw badRequest("Missing name or columnId");
      await updateColumnName(columnId, name);
      break;
    }
    case INTENTS.createItem: {
      let title = String(data.get("title"));
      let columnId = Number(data.get("columnId"));
      if (!title || !columnId)
        throw badRequest("Missing title or columnId");
      await createItem(columnId, title);
      break;
    }
    case INTENTS.moveItem: {
      let order = Number(data.get("order"));
      let cardId = Number(data.get("cardId"));
      let columnId = Number(data.get("newColumnId"));
      await moveItem(cardId, columnId, order);
    }
  }

  return request.headers.get("Sec-Fetch-Dest") === "document"
    ? redirect(`/board/${id}`)
    : { ok: true, id };
}

////////////////////////////////////////////////////////////////////////////////
// Controller Functions
////////////////////////////////////////////////////////////////////////////////

async function moveItem(
  cardId: number,
  columnId: number,
  order: number,
) {
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

export async function createItem(columnId: number, title: string) {
  let itemCountForColumn = await prisma.item.count({
    where: { columnId },
  });
  return prisma.item.create({
    data: {
      title,
      columnId,
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
      columns: {
        include: {
          items: {
            orderBy: {
              order: "asc",
            },
          },
        },
        orderBy: {
          order: "asc",
        },
      },
    },
  });
}
