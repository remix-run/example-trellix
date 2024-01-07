Create a `.env` file at the root with these contents:

```
DATABASE_URL="file:./dev.db"
```

Then run:

```sh
npm i
npx prisma migrate dev
npm run dev
```
