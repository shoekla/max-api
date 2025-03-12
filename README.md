# max-api

## Setup
To run the api we need to use yarn and sql to create the artists and releases table.
Run Following in terminal assuming you already have yarn. 1st step is just to install packages and others is to create the actual tables
1. `yarn`
2. `yarn sql-file migrations/1_create_artists.sql`
3. `yarn sql-file migrations/2_create_releases.sql`

## Running and Testing
After setup is complete you should be able to access the api locally by running `yarn dev`. I used postman to test POST commands (with json body params) and a browser to test the GET commands with filters (url params).
I also added some automated tests that you can run using `yarn test`. The test suite tests the GET and POST commands for /releases and /artists route with valid and invalid payload.

## Screenshot 
Included this section just to show how API is running on my machine.
More in depth tests can be seen in `test\index.spec.ts`
<details>
  <img width="1055" alt="Screenshot 2025-03-12 at 12 05 30 PM" src="https://github.com/user-attachments/assets/5ae0e5a3-d2b4-4f8a-8742-f68219a1c89a" />
<img width="1371" alt="Screenshot 2025-03-12 at 12 09 34 PM" src="https://github.com/user-attachments/assets/c608f064-b79e-4c90-bd10-51a34f53848f" />
<img width="1330" alt="Screenshot 2025-03-12 at 12 08 43 PM" src="https://github.com/user-attachments/assets/c6705383-7707-412c-8c37-c959e3afaeaf" />
<img width="1118" alt="Screenshot 2025-03-12 at 12 10 17 PM" src="https://github.com/user-attachments/assets/a7778f24-79c5-4f1a-b8ce-d683dbd64a60" />
<img width="1353" alt="Screenshot 2025-03-12 at 12 09 44 PM" src="https://github.com/user-attachments/assets/442f2a5f-fdb5-4fab-b417-db7bc036b9d0" />
<img width="962" alt="Screenshot 2025-03-12 at 12 08 34 PM" src="https://github.com/user-attachments/assets/21de89c1-3e95-46c1-8b26-e562430bebe6" />
<img width="836" alt="Screenshot 2025-03-12 at 12 06 42 PM" src="https://github.com/user-attachments/assets/aff382a0-2789-4626-a97d-520f49f4d09b" />
<img width="872" alt="Screenshot 2025-03-12 at 12 05 58 PM" src="https://github.com/user-attachments/assets/677592a5-a6a2-4b51-9d32-68328a030e1a" />
<img width="1347" alt="Screenshot 2025-03-12 at 12 08 25 PM" src="https://github.com/user-attachments/assets/acf6e1a9-8f7c-4bcb-912d-1dafa34d00bf" />
</details>
