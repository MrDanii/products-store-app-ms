# Products Store MicroService

## Dev Project

1. Clone project
2. Create **.env** file based in **.env.template** file
3. create database container with following command: ```docker compose up -d```
4. Start NATS server
``` 
docker run -d --name nats-server -p 4222:4222 -p 8222:8222 nats
```
5. Run Orders MicroService project ```npm run start:dev```

### Prisma Notes:
Basic command to initializae and migrate prisma
**If we change database tables in our schema.prisma file, `prisma migrate` command and `prisma generate` command will be required to take new changes**
- Initialize Prisma Setup: `npx prisma init`
- Migrate database prisma schema `npx prisma migrate dev --name init`
- Generate prisma client `npx prisma generate`