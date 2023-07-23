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
        ngx.log(ngx.ERR, "Failed to execute the query: ", err, ", errno: ", errno, ", sqlstate: ", sqlstate, ", Query: ", query)
        return nil, err  -- Return nil and the error message on failure
    end

    ngx.log(ngx.DEBUG, "Query executed successfully: ", query)
    ngx.log(ngx.DEBUG, "Affected rows: ", res.affected_rows)
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

local function returnError(status, message)
    ngx.status = status
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode({ error = message }))
end

local function returnJSON(data)
    ngx.status = ngx.HTTP_OK
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode(data))
    ngx.exit(ngx.OK) -- Use ngx.OK instead of ngx.HTTP_OK
end


-- Function to parse and validate JSON data
local function parseAndValidateJSON(data, required_fields)
    -- Parse the request body as JSON
    ngx.req.read_body()
    data = data or ngx.req.get_body_data()
    if not data then
        return nil, "Invalid JSON data in the request body"
    end

    -- Decode the JSON data into a Lua table
    local json_data, err = cjson.decode(data)
    if not json_data then
        return nil, "Failed to decode JSON data: " .. err
    end

    -- Check if all required fields are provided in the JSON data
    for _, field in ipairs(required_fields) do
        if json_data[field] == nil then
            return nil, string.format("'%s' value is required in the JSON data", field)
        end
    end

    return json_data
end

r:post("/users", function(params)
    -- Parse and validate JSON data for user creation
    local json_data, err = parseAndValidateJSON(nil, {"user", "password"})
    if not json_data then
        returnError(ngx.HTTP_BAD_REQUEST, err)
        return
    end

    local user = json_data["user"]
    local password = json_data["password"]

    -- Insert the new user into the database
    local query = string.format("INSERT INTO users (user, password) VALUES (%d, '%s')", user, password)
    local result, err, errno, sqlstate = db:query(query)
    if not result then
        -- Check if the error is due to a duplicate entry (primary key conflict)
        if errno == 1062 then
            returnError(ngx.HTTP_CONFLICT, "User ID already exists. Please choose a different ID.")
        else
            returnError(ngx.HTTP_INTERNAL_SERVER_ERROR, "Failed to execute the query: " .. err)
        end
        return
    end

    if result.affected_rows and result.affected_rows > 0 then
        returnJSON({ result = "success" })
    else
        returnError(ngx.HTTP_INTERNAL_SERVER_ERROR, "Failed to insert task into the database")
    end
end)

-- Define a helper function to execute SQL queries
local function execute_sql(query)
    local res, err, errno, sqlstate = db:query(query)
    if not res then
        ngx.log(ngx.ERR, "Failed to execute the query: ", err, ", errno: ", errno, ", sqlstate: ", sqlstate, ", Query: ", query)
        return nil, err
    end

    ngx.log(ngx.DEBUG, "Query executed successfully: ", query)
    ngx.log(ngx.DEBUG, "Affected rows: ", res.affected_rows)
    return res
end

r:post("/task", function(params)
    -- Parse and validate JSON data for task creation
    local json_data, err = parseAndValidateJSON(nil, {"id", "title", "description", "completed", "user"})
    if not json_data then
        returnError(ngx.HTTP_BAD_REQUEST, err)
        return
    end

    local id = tonumber(json_data["id"])
    local title = json_data["title"]
    local description = json_data["description"]
    local completed = tonumber(json_data["completed"])
    local user = tonumber(json_data["user"])

    -- Check if all required task data is provided
    if not id or not title or not description or not completed or not user then
        returnError(ngx.HTTP_BAD_REQUEST, "All 'id', 'title', 'description', 'completed', and 'user' values are required in the JSON data")
        return
    end

    -- Check if the provided user ID exists in the USERS table
    local checkUserQuery = string.format("SELECT * FROM USERS WHERE user = %d", user)
    local userResult = execute_sql(checkUserQuery)
    if not userResult or #userResult == 0 then
        returnError(ngx.HTTP_CONFLICT, "User ID does not exist. Please provide a valid User ID.")
        return
    end

    -- Insert the new task into the database
    local query = string.format("INSERT INTO TASKS (id, title, description, completed, user) VALUES (%d, '%s', '%s', %d, %d)",
        id, title, description, completed, user)
    local result, err = execute_sql(query)

    if not result then
        -- Check if the error is due to a duplicate entry (primary key conflict)
        if string.find(err, "Duplicate entry", 1, true) then
            returnError(ngx.HTTP_CONFLICT, "Task ID already exists. Please choose a different ID.")
        else
            returnError(ngx.HTTP_INTERNAL_SERVER_ERROR, "Failed to insert task into the database")
        end
        return
    end

    returnJSON({ result = "success" })
end)


r:get("/tasks", function(params)
    local userId = tonumber(params.userId) -- Convert the userId parameter to a number
    -- Fetch tasks from the database based on the provided userId
    local query
    if userId then
        query = string.format("SELECT * FROM TASKS WHERE user = %d", userId)
    else
        query = "SELECT * FROM TASKS"
    end

    local tasks = execute_sql(query)
    -- Return the filtered tasks as the response
    returnJSON(tasks)
end)

r:get("/task/:id", function(params)
    local taskId = tonumber(params.id) -- Convert the id parameter to a number
    -- Check if the taskId is a valid number
    if not taskId then
        returnError(ngx.HTTP_BAD_REQUEST,"Invalid task ID" )
        return
    end

    -- Fetch the task from the database based on the provided taskId
    local query = string.format("SELECT * FROM TASKS WHERE id = %d", taskId)
    local tasks = execute_sql(query)

    -- Return the task as the response
    if #tasks == 1 then
        returnJSON(tasks[1])
    else
        returnError(ngx.HTTP_NOT_FOUND,"Task not found")
    end
end)

r:put("/task/:id", function(params)
    local taskId = tonumber(params.id) -- Convert the id parameter to a number

    -- Check if the taskId is a valid number
    if not taskId then
        returnError(ngx.HTTP_BAD_REQUEST, "Invalid task ID")
        return
    end

    -- Parse the request body as JSON
    ngx.req.read_body()
    local data = ngx.req.get_body_data()
    if not data then
        returnError(ngx.HTTP_BAD_REQUEST, "Invalid JSON data in the request body")
        return
    end

    -- Decode the JSON data into a Lua table
    local json_data, err = cjson.decode(data)
    if not json_data then
        returnError(ngx.HTTP_BAD_REQUEST, "Failed to decode JSON data: " .. err)
        return
    end

    -- Check if the JSON data contains any fields to update
    local fieldsToUpdate = {}
    if json_data.title then
        table.insert(fieldsToUpdate, string.format("title = '%s'", json_data.title))
    end
    if json_data.description then
        table.insert(fieldsToUpdate, string.format("description = '%s'", json_data.description))
    end
    if json_data.completed ~= nil then
        local completedValue = json_data.completed and 1 or 0
        table.insert(fieldsToUpdate, string.format("completed = %d", completedValue))
    end

    if #fieldsToUpdate == 0 then
        returnError(ngx.HTTP_BAD_REQUEST, "No valid fields to update in the JSON data")
        return
    end

    -- Construct the SQL query to update the task
    local query = string.format("UPDATE TASKS SET %s WHERE id = %d", table.concat(fieldsToUpdate, ", "), taskId)

    -- Execute the SQL query
    local result, err = execute_sql(query)

    -- Check if the update was successful
    if not result then
        returnError(ngx.HTTP_NOT_FOUND, "Task not found or Failed to update task in the database")
        return
    end

    if result.affected_rows and result.affected_rows > 0 then
        -- Fetch the updated task from the database
        local selectQuery = string.format("SELECT * FROM TASKS WHERE id = %d", taskId)
        local updatedTask = execute_sql(selectQuery)
        returnJSON(updatedTask[1])
    else
        returnError(ngx.HTTP_NOT_FOUND, "Task not found or Failed to update task in the database")
    end
end)






r:delete("/task/:id", function(params)
    local taskId = tonumber(params.id) -- Convert the id parameter to a number

    -- Check if the taskId is a valid number
    if not taskId then
        returnError(ngx.HTTP_BAD_REQUEST,"Invalid task ID")
        return
    end

    -- Delete the task from the database based on the provided taskId
    local query = string.format("DELETE FROM TASKS WHERE id = %d", taskId)
    local result = execute_sql(query)

    -- Check if the delete operation was successful
    if result.affected_rows and result.affected_rows > 0 then
        returnJSON({ result = "success" })
    else
        returnError(ngx.HTTP_NOT_FOUND,"Task not found")
    end
end)

-- Start the server
if not r:execute(ngx.req.get_method(), ngx.var.uri) then
    -- Return a 404 Not Found response if no route matches the requests
    returnError(ngx.HTTP_NOT_FOUND,"Not found")
end



