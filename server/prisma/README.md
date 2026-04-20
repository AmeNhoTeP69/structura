PostgreSQL schema for the full Structura workflow.

Setup:
1. Copy `server/.env.example` to `server/.env`
2. Set `DATABASE_URL`
3. Run `npm install` in `server/`
4. Run `npm run prisma:generate`
5. Run `npm run prisma:migrate -- --name init_full_schema`

Business rules encoded here:
- A project request becomes a project only after client acceptance.
- An employee has exactly one employee type.
- Request documents can be copied into project documents.
- Timeline/doc visibility `ALL` includes the client, `TEAM_ONLY` excludes the client.
