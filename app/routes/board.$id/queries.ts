import { prisma } from "~/db/prisma";

import { ItemMutation } from "./types";

export function deleteCard(id: string) {
  return prisma.item.delete({ where: { id } });
}

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

export async function updateBoardName(boardId: number, name: string) {
  return prisma.board.update({
    where: { id: boardId },
    data: { name },
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
