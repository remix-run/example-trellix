import crypto from 'node:crypto'

import { prisma } from './db'

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
    })
}
