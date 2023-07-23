-- Import required modules
local cjson = require("cjson")
local mysql = require("resty.mysql")
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
    database = "tasks",   -- Replace "tasks_db" with the name of your MySQL database
    user = "root",        -- Replace "your_db_user" with your MySQL database user
    password = "root"     -- Replace "your_db_password" with your MySQL database password
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
        user INTEGER PRIMARY KEY NOT NULL,
        password TEXT NOT NULL
    )
]]

local queryTasks = [[
    CREATE TABLE IF NOT EXISTS TASKS(
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        completed INTEGER NOT NULL,
        user INTEGER NOT NULL,
        CONSTRAINT FK_Tasks FOREIGN KEY (user) REFERENCES USERS(user)
    )
]]

execute_sql(queryUsers)
execute_sql(queryTasks)

-- Close the database connection when the server exits
ngx.on_abort(function()
    db:set_keepalive(10000, 100)
end)

-- working
r:post("/users", function(params)
-- Parse the request body as JSON
ngx.req.read_body()
local data = ngx.req.get_body_data()
if not data then
    ngx.status = ngx.HTTP_BAD_REQUEST
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode({ error = "Invalid JSON data in the request body" }))
    return
end

-- Decode the JSON data into a Lua table
local json_data, err = cjson.decode(data)
if not json_data then
    ngx.status = ngx.HTTP_BAD_REQUEST
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode({ error = "Failed to decode JSON data: " .. err }))
    return
end

-- Extract the 'user' and 'password' values from the JSON data
local user = json_data["user"]
local password = json_data["password"]

-- Check if both 'user' and 'password' values are provided
if not user or not password then
    ngx.status = ngx.HTTP_BAD_REQUEST
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode({ error = "Both 'user' and 'password' values are required in the JSON data" }))
    return
end

-- Insert the new user into the database
local query = string.format("INSERT INTO users (user, password) VALUES (%d, '%s')", user, password)
local result = execute_sql(query)

-- Fetch all users from the database after the addition
local queryUsers = "SELECT * FROM users"
local users = execute_sql(queryUsers)

-- Return the updated content of the users table as the response
ngx.header.content_type = "application/json"
ngx.say(cjson.encode(users))
end)

--working
r:post("/task", function(params)
    -- Parse the request body as JSON
    ngx.req.read_body()
    local data = ngx.req.get_body_data()
    if not data then
        ngx.status = ngx.HTTP_BAD_REQUEST
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Invalid JSON data in the request body" }))
        return
    end

    -- Decode the JSON data into a Lua table
    local json_data, err = cjson.decode(data)
    if not json_data then
        ngx.status = ngx.HTTP_BAD_REQUEST
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Failed to decode JSON data: " .. err }))
        return
    end

    -- Extract the values from the JSON data
    local id = json_data["id"]
    local title = json_data["title"]
    local description = json_data["description"]
    local completed = json_data["completed"]
    local user = json_data["user"]

    -- Check if all required values are provided
    if not id or not title or not description or completed == nil or not user then
        ngx.status = ngx.HTTP_BAD_REQUEST
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "All 'id', 'title', 'description', 'completed', and 'user' values are required in the JSON data" }))
        return
    end

    -- Insert the new task into the database
    local query = string.format("INSERT INTO tasks (id, title, description, completed, user) VALUES (%d, '%s', '%s', %d, %d)",
        id, title, description, completed and 1 or 0, user)
    local result = execute_sql(query)

    -- Fetch all tasks from the database after the addition
    local queryTasks = "SELECT * FROM tasks"
    local tasks = execute_sql(queryTasks)

    -- Return the updated content of the tasks table as the response
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode(tasks))
end)

--working
r:get("/tasks", function(params)
    -- Fetch all tasks from the database
    local query = "SELECT * FROM tasks"
    local tasks = execute_sql(query)

    -- Return the tasks as the response
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode(tasks))
end)

-- working
r:get("/task/:id", function(params)
    local taskId = tonumber(params.id) -- Convert the id parameter to a number

    -- Check if the taskId is a valid number
    if not taskId then
        ngx.status = ngx.HTTP_BAD_REQUEST
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Invalid task ID" }))
        return
    end

    -- Fetch the task from the database based on the provided taskId
    local query = string.format("SELECT * FROM TASKS WHERE id = %d", taskId)
    local tasks = execute_sql(query)

    -- Return the task as the response
    if #tasks == 1 then
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode(tasks[1]))
    else
        ngx.status = ngx.HTTP_NOT_FOUND
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Task not found" }))
    end
end)


-- working
r:put("/task/:id", function(params)
    local taskId = tonumber(params.id) -- Convert the id parameter to a number

    -- Check if the taskId is a valid number
    if not taskId then
        ngx.status = ngx.HTTP_BAD_REQUEST
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Invalid task ID" }))
        return
    end

    -- Parse the request body as JSON
    ngx.req.read_body()
    local data = ngx.req.get_body_data()
    if not data then
        ngx.status = ngx.HTTP_BAD_REQUEST
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Invalid JSON data in the request body" }))
        return
    end

    -- Decode the JSON data into a Lua table
    local json_data, err = cjson.decode(data)
    if not json_data then
        ngx.status = ngx.HTTP_BAD_REQUEST
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Failed to decode JSON data: " .. err }))
        return
    end

    -- Update the task in the database based on the provided taskId
    local query = string.format("UPDATE TASKS SET title = '%s', description = '%s', completed = %d, user = %d WHERE id = %d",
        json_data.title or "", json_data.description or "", json_data.completed and 1 or 0, json_data.user or 0, taskId)
    local result = execute_sql(query)

    -- Return a success or error response
    if next(result) ~= nil then
        -- Fetch the updated task from the database
        local selectQuery = string.format("SELECT * FROM TASKS WHERE id = %d", taskId)
        local updatedTask = execute_sql(selectQuery)

        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode(updatedTask[1]))
    else
        ngx.status = ngx.HTTP_NOT_FOUND
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Task not found" }))
    end
end)

--working
r:delete("/task/:id", function(params)
    local taskId = tonumber(params.id) -- Convert the id parameter to a number

    -- Check if the taskId is a valid number
    if not taskId then
        ngx.status = ngx.HTTP_BAD_REQUEST
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Invalid task ID" }))
        return
    end

    -- Delete the task from the database based on the provided taskId
    local query = string.format("DELETE FROM TASKS WHERE id = %d", taskId)
    local result = execute_sql(query)

    -- Check if the delete operation was successful
    if result.affected_rows and result.affected_rows > 0 then
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ success = true }))
    else
        ngx.status = ngx.HTTP_NOT_FOUND
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Task not found" }))
    end
end)




r:get("/test", function(params)
    -- Parse the request body as JSON
    ngx.req.read_body()
    local data = ngx.req.get_body_data()
    if not data then
        ngx.status = ngx.HTTP_BAD_REQUEST
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Invalid JSON data in the request body" }))
        return
    end

    -- Decode the JSON data into a Lua table
    local json_data, err = cjson.decode(data)
    if not json_data then
        ngx.status = ngx.HTTP_BAD_REQUEST
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "Failed to decode JSON data: " .. err }))
        return
    end

    -- Extract the 'userId' value from the JSON data
    local userId = json_data["userId"]

    -- Check if 'userId' value is provided
    if not userId then
        ngx.status = ngx.HTTP_BAD_REQUEST
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "'userId' value is required in the JSON data" }))
        return
    end

    -- Fetch user data from the database based on the provided user ID
    local query = string.format("SELECT * FROM USERS WHERE user = %d", userId)
    local users = execute_sql(query)

    -- Return the user data as the response
    if #users == 1 then
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode(users[1]))
    else
        ngx.status = ngx.HTTP_NOT_FOUND
        ngx.header.content_type = "application/json"
        ngx.say(cjson.encode({ error = "User not found" }))
    end
end)

-- Start the server
if not r:execute(ngx.req.get_method(), ngx.var.uri) then
    -- Return a 404 Not Found response if no route matches the request
    ngx.status = ngx.HTTP_NOT_FOUND
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode({ error = "Not found" }))
end
