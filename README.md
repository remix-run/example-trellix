# Trellix

This is a demo app to show off the features of HTMX.
It's a recreation of the popular drag and drop interface in Trello and other similar apps.

Originally this example was created by creator of remix framework.

[Original Project](https://x.com/remix_run/status/1744823043116216667?s=20)

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`JWT_SECRET`

`DATABASE_URL`: postgresql

## Installation

Install my-project with npm

```bash
  pnpm install
  npx prisma migrate dev
  pnpm run dev
```

## Tech Stack

**Client:** HTMX, Alpine.js, SortableJS

**Server:** Node, Astro
