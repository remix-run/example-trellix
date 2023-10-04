import { prisma } from "../../db/prisma";

export async function createItem(columnId: number, title: string) {
  let itemCountForColumn = await prisma.item.count({ where: { columnId } });
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

export async function createEmptyColumn(boardId: number) {
  let columnCount = await prisma.column.count({ where: { boardId } });
  return prisma.column.create({
    data: {
      name: "",
      boardId,
      order: columnCount + 1,
    },
  });
}

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
