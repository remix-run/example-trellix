import { prisma } from "~/db/prisma";

import { ItemMutation } from "./types";

export function deleteCard(id: string, accountId: string) {
  return prisma.item.delete({ where: { id, Board: { accountId } } });
}

export async function getBoardData(boardId: number, accountId: string) {
  return prisma.board.findUnique({
    where: {
      id: boardId,
      accountId: accountId,
    },
    include: {
      items: true,
      columns: { orderBy: { order: "asc" } },
    },
  });
}

export async function updateBoardName(
  boardId: number,
  name: string,
  accountId: string,
) {
  return prisma.board.update({
    where: { id: boardId, accountId: accountId },
    data: { name },
  });
}

export function upsertItem(
  mutation: ItemMutation & { boardId: number },
  accountId: string,
) {
  return prisma.item.upsert({
    where: {
      id: mutation.id,
      Board: {
        accountId,
      },
    },
    create: mutation,
    update: mutation,
  });
}

export async function updateColumnName(
  id: string,
  name: string,
  accountId: string,
) {
  return prisma.column.update({
    where: { id, Board: { accountId } },
    data: { name },
  });
}

export async function createColumn(
  boardId: number,
  name: string,
  id: string,
  accountId: string,
) {
  let columnCount = await prisma.column.count({
    where: { boardId, Board: { accountId } },
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
