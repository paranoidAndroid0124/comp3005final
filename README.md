# comp3005final
Vincent Gagnon 101052796,
Yufeng Liu 101258905

This application uses the drizzle orm to map the database content to typescript. Allowing for easy schema updating and querying.

# Pre-requisites
### Clone repository
```bash
git clone git@github.com:paranoidAndroid0124/comp3005final.git
```

Required software
- Postgres
- nodejs
- yarn

# ER model
Link to ER model
https://lucid.app/lucidchart/a9099f2f-5f4c-442c-99bd-cd818478185e/edit?viewport_loc=-1784%2C-360%2C2512%2C1370%2C0_0&invitationId=inv_2d681586-db71-469f-a828-5e35f09c80be

# Setup
### connect to postgres
1. Open the .env file in the root of the directory of the project.
2. Update the DATABASE_URL to match your specific configure. Example: "postgres://user:pasdword@localhost:5432/db"

### Install dependency
1. open terminal in the root of the project and run
```bash
yarn install
```

### Add database schema
copy the content of sql file found in src/drizzle and run it on your database using your tool of choice. (i.e: pgadmin , datagrip, pgcli, etc). This will generate the required table to run this application.

# Start application
```bash
yarn start
```
This command will automatically generate test data in the database

# SQL file
### build the sql: 
yarn drizzle-kit generate:pg or use the shortcut "yarn sql". All sql files generated can be found under src/drizzle
