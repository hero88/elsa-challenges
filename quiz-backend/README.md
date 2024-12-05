### Awesome Project Build with TypeORM

# Prerequisites
1. Node.js: Install Node.js (v14+ recommended).
2. PostgreSQL: Ensure PostgreSQL is installed and running locally or on a remote server.
3. NPM or Yarn: Install npm or Yarn.


# Steps to run this project:
1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file
3. Follow `.env.example` to setup your .env file
4. Run `npm run typeorm migration:run` command
5. Run `npx ts-node src/seed.ts` to seed the database with initial data
6. Run `npm start` command
