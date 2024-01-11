import { defineMiddleware } from 'astro:middleware'
import jwt, { type JwtPayload } from 'jsonwebtoken'

export const onRequest = defineMiddleware((context, next) => {
    try {
        const token = context.cookies.get('jwt')?.value

        if (token) {
            const payload = jwt.verify(token, import.meta.env.JWT_SECRET)
            context.locals.userId = (payload as JwtPayload).id
        }
    } catch (_) {
        // eat 5-star do nothing
    }
    next()
})
