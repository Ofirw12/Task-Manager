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

3. Navigate to the `/server` directory and run the following command to start the OpenResty server:
   ```bash
   cd /server
   nginx
   ```
   This will start the RESTful server.

4. Open another CLI tab, navigate to the `/client` directory, and run the following command to start the React app:

   ```bash
   cd /client
   npm start
   ```
   
   The Task Manager app will open in your default web browser.

5. On first use, you need to register a user with `id=1` and set a password of your choice (this will be the admin user).

6. Log in using the credentials you registered and start managing your tasks.

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
