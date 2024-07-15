```sh
npm i
echo DATABASE_URL=file:./dev.db > .env
npx prisma migrate dev
npm run dev
```
