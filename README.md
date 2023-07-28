# Task Manager

Task Manager is a simple web application built with React, MobX, and TypeScript on the frontend, and a RESTful server built using OpenResty with Lua, using a local MySQL database.

## Prerequisites

Before running the Task Manager app, make sure you have the following installed:

- Node.js with npm
- OpenResty with HMAC, String, Core.JWT, LuaSQL, and Router modules. You can download OpenResty separately, install them via LuaRocks, or use the complete OpenResty package provided in this repository.
- MySQL

## Instructions

1. Clone this repository to your local machine.

2. Open your CLI (Command Line Interface) and navigate to the local folder of the project.

3. Navigate to the `/server` directory and open the `server.lua` file in a text editor.
   ```bash
   cd /server
   code . (if you\'re using Visual Studio Code)
   ```

4. Inside the `server.lua` file, locate the following lines:

   ``` lua
   db:set_timeout(5000)

   local ok, err, errno, sqlstate = db:connect({
       host = "127.0.0.1",
       port = 3306,
       database = "tasks",
       user = "root",
       password = "root"
   })
   ```
   Replace the values within the connect function with your actual MySQL database details:
      host: Replace "127.0.0.1" with your local MySQL server IP address.
      port: Replace 3306 with your local MySQL server port (default is 3306).
      database: Replace "tasks" with the name of your MySQL database.
      user: Replace "root" with your MySQL database user.
      password: Replace "root" with your MySQL database password.

   Save the changes to the server.lua file.

5. Now, in the same CLI tab, run the following command to start the OpenResty server:
   ```
   nginx
   ```
   This will start the RESTful server with your updated MySQL database details.

6. Open another CLI tab, navigate to the `/client` directory, and run the following command to start the React app:

   ```bash
   cd /client
   npm install (first time only)
   npm start
   ```
   
   The Task Manager app will open in your default web browser.

7. On first use, you need to register a user with `id=1` and set a password of your choice (this will be the admin user).

8. Log in using the credentials you registered with and start managing your tasks.

## Features

- View and manage your tasks.
- Mark tasks as completed.
- User authentication for secure access.
- Simple and intuitive user interface.

## Technologies Used

- Frontend:
- React
- MobX (for state management)
- TypeScript (for type-checking and static analysis)
- Material-UI (for UI components)

- Backend:
- OpenResty (for server-side processing)
- Lua (for scripting)
- MySQL (for database management)

## Folder Structure

task-manager/
├── client/
| ├── public/
| | ├── index.html
| ├── src/
| | ├── components/
| ├── package.json
| ├── tsconfig.json
├── server/
| ├── conf/
| | ├── nginx.conf
| ├── server.lua
├── README.md
├── .gitignore

## Getting Help or Contributing

If you encounter any issues while using the Task Manager app or have ideas for improvements, feel free to create an issue on the GitHub repository. Contributions are always welcome!

## License

This project is licensed under the MIT License. Feel free to use, modify, and distribute the code for personal or commercial use.
