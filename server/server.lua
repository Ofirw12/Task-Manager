-- Import required modules
local cjson = require("cjson")
local mysql = require("resty.mysql")
local jwt = require("resty.jwt")
local router = require("router")
local r = router.new()

-- Initialize the MySQL database connection
local db, err = mysql:new()
if not db then
    ngx.log(ngx.ERR, "Failed to create MySQL connection: ", err)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

db:set_timeout(5000)

local ok, err, errno, sqlstate = db:connect({
    host = "127.0.0.1",   -- Replace "127.0.0.1" with your local MySQL server IP address
    port = 3306,          -- Replace 3306 with your local MySQL server port (default is 3306)
    database = "tasks", -- Replace "tasks_db" with the name of your MySQL database
    user = "root", -- Replace "your_db_user" with your MySQL database user
    password = "root" -- Replace "your_db_password" with your MySQL database password
})

if not ok then
    ngx.log(ngx.ERR, "Failed to connect to the database: ", err, ", errno: ", errno, ", sqlstate: ", sqlstate)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

-- Define a helper function to execute SQL queries
local function execute_sql(query)
    local res, err, errno, sqlstate = db:query(query)
    if not res then
        ngx.log(ngx.ERR, "Failed to execute the query: ", err, ", errno: ", errno, ", sqlstate: ", sqlstate)
        return {}
    end
    return res
end

-- Create the tables if they don't exist
local queryUsers = [[
    CREATE TABLE IF NOT EXISTS USERS(
        user INTEGER NOT NULL,
        password TEXT NOT NULL,
        CONSTRAINT PK_Users PRIMARY KEY (user)
    )
]]

local queryTasks = [[
    CREATE TABLE IF NOT EXISTS TASKS(
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        completed INTEGER NOT NULL,
        user INTEGER NOT NULL,
        CONSTRAINT PK_Tasks PRIMARY KEY (id),
        CONSTRAINT FK_Tasks FOREIGN KEY (user) REFERENCES USERS(user)
    )
]]

execute_sql(queryUsers)
execute_sql(queryTasks)

-- Close the database connection when the server exits
ngx.on_abort(function()
    db:set_keepalive(10000, 100)
end)


-- POST /users: Create a new user
r:post("/users", function(params)
    -- Parse the request body as JSON
    local data = cjson.decode(ngx.req.get_body_data())
    local user = data.user
    local password = data.password

    -- -- Hash the password (you should use a proper hashing algorithm here)
    -- -- For simplicity, we'll just use the plain password, which is not secure in a real-world scenario
    -- local hashedPassword = password

    -- Insert the new user into the database
    local query = string.format("INSERT INTO USERS (user, password) VALUES ('%s', '%s')", user, password)
    assert(db:execute(query))

    -- Return a success response
    ngx.say(cjson.encode({ success = true }))
end)

-- POST /auth: Authenticate a user and return a JWT
r:post("/auth", function(params)
    -- Parse the request body as JSON
    local data = cjson.decode(ngx.req.get_body_data())
    local user = data.user
    local password = data.password

    -- Fetch the user's hashed password from the database based on the provided username
    local query = string.format("SELECT password FROM USERS WHERE user = '%s'", user)
    local rows = execute_sql(query)

    if #rows == 1 and rows[1].password == password then
        -- Create a JWT token with the username as the payload
        local token = jwt:sign(
            ngx.var.jwt_secret, -- Replace "your-jwt-secret" with your actual secret key
            {
                header = { typ = "JWT", alg = "HS256" },
                payload = { username = user },
                exp = ngx.time() + 3600 -- Set the token expiration time to one hour from now
            }
        )

        -- Return the JWT token as the response
        ngx.say(cjson.encode({ token = token }))
    else
        -- Return an error response for invalid credentials
        ngx.status = ngx.HTTP_UNAUTHORIZED
        ngx.say(cjson.encode({ error = "Invalid credentials" }))
    end
end)

r:post("/task", function(params)
    -- Parse the request body as JSON
    local data = cjson.decode(ngx.req.get_body_data())
    local title = data.title
    local description = data.description
    local completed = data.completed
    local userId = data.userId

    -- Insert the new task into the database
    local query = string.format("INSERT INTO TASKS (title, description, completed, user) VALUES ('%s', '%s', %d, %d)",
        title, description, completed and 1 or 0, userId)
    assert(db:execute(query))

    -- Return a success response
    ngx.say(cjson.encode({ success = true }))
end)

r:get("/tasks", function(params)
    local userId = params.userId

    -- Fetch all tasks from the database
    local query
    if userId then
        query = string.format("SELECT * FROM TASKS WHERE user = %d", userId)
    else
        query = "SELECT * FROM TASKS"
    end

    local tasks = execute_sql(query)

    -- Return the tasks as the response
    ngx.say(cjson.encode(tasks))
end)

r:get("/task/:id", function(params)
    local taskId = params.id

    -- Fetch the task from the database based on the provided taskId
    local query = string.format("SELECT * FROM TASKS WHERE id = %d", taskId)
    local tasks = execute_sql(query)

    -- Return the task as the response
    if #tasks == 1 then
        ngx.say(cjson.encode(tasks[1]))
    else
        ngx.status = ngx.HTTP_NOT_FOUND
        ngx.say(cjson.encode({ error = "Task not found" }))
    end
end)

r:put("/task/:id", function(params)
    local taskId = params.id

    -- Parse the request body as JSON
    local data = cjson.decode(ngx.req.get_body_data())
    local title = data.title
    local description = data.description
    local completed = data.completed

    -- Update the task in the database based on the provided taskId
    local query = string.format("UPDATE TASKS SET title = '%s', description = '%s', completed = %d WHERE id = %d",
        title, description, completed and 1 or 0, taskId)
    local result = db:execute(query)

    -- Return a success or error response
    if result == 1 then
        ngx.say(cjson.encode({ success = true }))
    else
        ngx.status = ngx.HTTP_NOT_FOUND
        ngx.say(cjson.encode({ error = "Task not found" }))
    end
end)

r:delete("/task/:id", function(params)
    local taskId = params.id

    -- Delete the task from the database based on the provided taskId
    local query = string.format("DELETE FROM TASKS WHERE id = %d", taskId)
    local result = db:execute(query)

    -- Return a success or error response
    if result == 1 then
        ngx.say(cjson.encode({ success = true }))
    else
        ngx.status = ngx.HTTP_NOT_FOUND
        ngx.say(cjson.encode({ error = "Task not found" }))
    end
end)

ngx.say("Lua server is up and running!")
