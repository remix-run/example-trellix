import crypto from 'node:crypto'

import { prisma } from './db'

////////////////////////////////////////////////////////////////////////////////
// Bonkers TypeScript
type ConstructorToType<T> = T extends typeof String
    ? string
    : T extends typeof Number
    ? number
    : never

export type MutationFromFields<T extends Record<string, any>> = {
    [K in keyof T]: ConstructorToType<T[K]['type']>
}

export const ItemMutationFields = {
    id: { type: String, name: 'id' },
    columnId: { type: String, name: 'columnId' },
    order: { type: Number, name: 'order' },
    title: { type: String, name: 'title' },
} as const

export type ItemMutation = MutationFromFields<typeof ItemMutationFields>

export async function accountExists(email: string) {
    let account = await prisma.account.findUnique({
        where: { email: email },
        select: { id: true },
    })

    return Boolean(account)
}

export async function createAccount(email: string, password: string) {
    let salt = crypto.randomBytes(16).toString('hex')
    let hash = crypto
        .pbkdf2Sync(password, salt, 1000, 64, 'sha256')
        .toString('hex')

    return prisma.account.create({
        data: {
            email: email,
            Password: { create: { hash, salt } },
        },
    })
}

export async function login(email: string, password: string) {
    let user = await prisma.account.findUnique({
        where: { email: email },
        include: { Password: true },
    })

    if (!user || !user.Password) {
        return false
    }

    let hash = crypto
        .pbkdf2Sync(password, user.Password.salt, 1000, 64, 'sha256')
        .toString('hex')

    if (hash !== user.Password.hash) {
        return false
    }

    return user.id
}

export async function deleteBoard(boardId: number, accountId: string) {
    return prisma.board.delete({
        where: { id: boardId, accountId },
    })
}

export async function createBoard(userId: string, name: string, color: string) {
    return prisma.board.create({
        data: {
            name,
            color,
            Account: {
                connect: {
                    id: userId,
                },
            },
        },
    })
}

export async function getHomeData(userId: string) {
    return prisma.board.findMany({
        where: {
            accountId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
}

export function deleteItem(id: string) {
    return prisma.item.delete({ where: { id } })
}

export async function getBoardData(boardId: number, accountId: string) {
    return prisma.board.findUnique({
        where: {
            id: boardId,
            accountId: accountId,
        },
        include: {
            items: true,
            columns: { orderBy: { order: 'asc' } },
        },
    })
}

export async function updateBoardName(boardId: number, name: string) {
    return prisma.board.update({
        where: { id: boardId },
        data: { name },
    })
}

export async function createItem(
    boardId: number,
    columnId: string,
    title: string
) {
    return await prisma.$transaction(async (tx) => {
        let order = 0
        const lastItem = await tx.item.findFirst({
            where: { boardId, columnId },
            orderBy: { order: 'desc' },
        })

        if (lastItem) {
            order = lastItem.order + 1
        }

        return tx.item.create({
            data: {
                title,
                boardId,
                columnId,
                order,
            },
        })
    })
}

export function upsertItem(
    mutation: ItemMutation & { boardId: number },
    accountId: string
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
    })
}

export async function updateColumnName(id: string, name: string) {
    return prisma.column.update({
        where: { id },
        data: { name },
    })
}

export async function createColumn(boardId: number, name: string) {
    let columnCount = await prisma.column.count({
        where: { boardId },
    })
    return prisma.column.create({
        data: {
            boardId,
            name,
            order: columnCount + 1,
        },
    })
}
