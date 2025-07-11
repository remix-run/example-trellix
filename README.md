# Running Trellix Locally

1. Rename `.env.example` to `.env`
2. Change the DATABASE_URL in `.env`
3. Install deps, migrate the database, and start the server

   ```sh
   npm i
   npx prisma migrate dev
   npm run dev
   ```
