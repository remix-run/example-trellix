import { prisma } from "~/db/prisma";

import { ItemMutation } from "./types";

export async function getBoardData(boardId: number) {
  return prisma.board.findUnique({
    where: {
      id: boardId,
    },
    include: {
      items: true,
      columns: { orderBy: { order: "asc" } },
    },
  });
}

export function upsertItem(mutation: ItemMutation & { boardId: number }) {
  return prisma.item.upsert({
    where: { id: mutation.id },
    create: mutation,
    update: mutation,
  });
}

export async function updateColumnName(id: string, name: string) {
  return prisma.column.update({
    where: { id },
    data: { name },
  });
}

export async function createColumn(boardId: number, name: string, id: string) {
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
