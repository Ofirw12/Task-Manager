-- Import required modules
local cjson = require("cjson")
local mysql = require("resty.mysql")
local router = require("router")
local jwt = require("resty.jwt")
local r = router.new()

local jwt_secret = "secretKey" --update later
-- Initialize the MySQL database connection
local db, err = mysql:new()
if not db then
    ngx.log(ngx.ERR, "Failed to create MySQL connection: ", err)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

db:set_timeout(5000)

local ok, err, errno, sqlstate = db:connect({
    host = "127.0.0.1", -- Replace "127.0.0.1" with your local MySQL server IP address
    port = 3306,        -- Replace 3306 with your local MySQL server port (default is 3306)
    database = "tasks", -- Replace "tasks" with the name of your MySQL database
    user = "root",      -- Replace "root" with your MySQL database user
    password = "root"   -- Replace "root" with your MySQL database password
})

if not ok then
    ngx.log(ngx.ERR, "Failed to connect to the database: ", err, ", errno: ", errno, ", sqlstate: ", sqlstate)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

-- Define a helper function to execute SQL queries
local function executeQuery(query)
    local res, err, errno, sqlstate = db:query(query)
    if not res then
        ngx.log(ngx.ERR, "Failed to execute the query: ", err, ", errno: ", errno, ", sqlstate: ", sqlstate, ", Query: ",
            query)
        return nil, err
    end
    return res
end


-- Create the tables if they don't exist
local createUsers = [[
    CREATE TABLE IF NOT EXISTS USERS(
        user INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
        password TEXT NOT NULL
    )
]]

local createTasks = [[
    CREATE TABLE IF NOT EXISTS TASKS(
        id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        completed INTEGER NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL,
        user INTEGER NOT NULL,
        CONSTRAINT FK_Tasks FOREIGN KEY (user) REFERENCES USERS(user)
    )
]]

executeQuery(createUsers)
executeQuery(createTasks)

-- Close the database connection when the server exits
ngx.on_abort(function()
    db:set_keepalive(10000, 100)
end)

local function returnError(status, message)
    ngx.status = status
    ngx.header.content_type = "application/json"
    ngx.say(cjson.encode({ error = message }))
end

local function returnJSON(data, token)
    ngx.status = ngx.HTTP_OK
    ngx.header.content_type = "application/json"
    if token then
        ngx.header["Authorization"] = "Bearer " .. token
    end
    ngx.say(cjson.encode(data))
    ngx.exit(ngx.OK)
end

local function parseJSON(data, required_fields)
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

local function generateToken(username)
    -- Fetch user data from the database based on the provided username
    local query = string.format("SELECT * FROM USERS WHERE user = %s", ngx.quote_sql_str(username))
    local userResult = executeQuery(query)
    if not userResult or #userResult == 0 then
        ngx.log(ngx.ERR, "User not found")
        return nil
    end

    -- Assuming the user table contains an 'id' column (integer) and 'password' column (string)
    local user = userResult[1]
    --ngx.log(ngx.DEBUG, "User row: ", cjson.encode(user))

    -- Create the payload for the JWT
    local payload = {
        sub = tostring(user.user),
        exp = ngx.time() + 3600,
    }

    --ngx.log(ngx.DEBUG, "Payload: ", cjson.encode(payload)) -- Add this line for debugging

    -- Generate and return the JWT
    local token, err = jwt:sign(jwt_secret, { header = { typ = "JWT", alg = "HS256" }, payload = payload })
    if not token then
        --ngx.log(ngx.ERR, "Failed to generate JWT: ", err)
        return nil
    end

    --ngx.log(ngx.DEBUG, "Generated Token: ", token)
    return token
end

local function verifyToken(token)
    local result = jwt:verify(jwt_secret, token)
    if not result.verified then
        return nil
    end
    return result
end

local function authenticateRequest()
    local token = ngx.var.http_Authorization
    if not token or not string.match(token, "^Bearer%s+%S+$") then
        returnError(ngx.HTTP_UNAUTHORIZED, "Invalid or missing JWT token in the Authorization header")
        return nil
    end

    -- Remove the "Bearer " prefix from the token to get the actual token value
    token = string.gsub(token, "^Bearer%s+", "")
    -- Verify the JWT token
    local verified_data = verifyToken(token)
    --ngx.log(ngx.DEBUG, "Verified Data: ", cjson.encode(verified_data))

    if not verified_data or not verified_data.payload or not verified_data.payload.sub then
        ngx.log(ngx.DEBUG, "Invalid JWT token or missing 'sub' claim")
        return nil
    end
    -- Extract and return the authenticated user ID (sub) from the JWT payload
    return tonumber(verified_data.payload.sub)
end

local function checkUserId(userId, taskId)
    local query = string.format("SELECT user FROM TASKS WHERE id = %d", taskId)
    local tasks = executeQuery(query)

    -- Check if the task exists
    if #tasks == 1 then
        -- Check if the task belongs to the authenticated user
        if tasks[1].user ~= userId then
            ngx.log(ngx.DEBUG, "Task User ID: ", tasks[1].user)
            ngx.log(ngx.DEBUG, "Authenticated User ID: ", userId)
            returnError(ngx.HTTP_FORBIDDEN, "User is not authorized to access this task")
            return false
        end
    else
        returnError(ngx.HTTP_NOT_FOUND, "Task not found")
    end
    return true
end


local function set_cors_headers()
    if ngx.req.get_method() == "OPTIONS" then
        -- Respond to preflight requests
        ngx.header["Access-Control-Allow-Origin"] = "http://localhost:3000"
        ngx.header["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS"
        ngx.header["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        ngx.header["Access-Control-Allow-Credentials"] = "true"
        ngx.header["Access-Control-Max-Age"] = "3600" -- Set cache time for preflight response
        ngx.exit(ngx.HTTP_OK)
    else
        -- Add CORS headers to all other responses
        ngx.header["Access-Control-Allow-Origin"] = "http://localhost:3000"
        ngx.header["Access-Control-Allow-Credentials"] = "true"
    end
end
set_cors_headers()


local function addBackslashes(inputString)
    -- Replace backslashes with double backslashes to escape them
    inputString = inputString:gsub("\\", "\\\\")

    -- Replace single quotes with escaped single quotes
    inputString = inputString:gsub("'", "\\'")

    -- Replace double quotes with escaped double quotes
    inputString = inputString:gsub('"', '\\"')

    -- Add more replacement patterns if needed for other characters

    return inputString
end



r:post("/users", function(params)
    -- Parse and validate JSON data for user creation
    local json_data, err = parseJSON(nil, { "user", "password" })
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
        returnJSON({ result = "User signed up successfully" })
    else
        returnError(ngx.HTTP_INTERNAL_SERVER_ERROR, "Failed to insert task into the database")
    end
end)

r:post("/task", function(params)
    local userId = authenticateRequest()
    if not userId then
        return
    end
    -- Parse and validate JSON data for task creation
    local json_data, err = parseJSON(nil, { "title", "description", "completed", "status", "priority" })
    if not json_data then
        returnError(ngx.HTTP_BAD_REQUEST, err)
        return
    end

    local title = addBackslashes(json_data["title"])
    local description = addBackslashes(json_data["description"])
    local completed = tonumber(json_data["completed"])
    local status = addBackslashes(json_data["status"])
    local priority = addBackslashes(json_data["priority"])

    -- Check if all required task data is provided
    if not title or not description or not completed then
        returnError(ngx.HTTP_BAD_REQUEST,
            "All 'title', 'description','completed', 'status' and 'priority' values are required in the JSON data")
        return
    end
    local query = string.format(
        "INSERT INTO TASKS (title, description, completed, priority, status, user) VALUES ('%s', '%s', %d, '%s', '%s', %d)",
        title, description, completed, priority, status, userId)
    local result, err = executeQuery(query)

    if not result then
        --delete later
        if string.find(err, "Duplicate entry", 1, true) then
            returnError(ngx.HTTP_CONFLICT, "Task ID already exists. Please choose a different ID.")
        else
            returnError(ngx.HTTP_INTERNAL_SERVER_ERROR, "Failed to insert task into the database")
        end
        return
    end
    local lastInsertedId = result.insert_id
    if not lastInsertedId then
        returnError(ngx.HTTP_INTERNAL_SERVER_ERROR, "Failed to get the ID of the last inserted row")
        return
    else
        returnJSON({ id = lastInsertedId, result = "Task added successfully" })
    end
end)

r:get("/tasks", function(params)
    --authenticate the user without saving the userId
    if not authenticateRequest() then
        return
    end

    local args = ngx.req.get_uri_args()
    local userId = tonumber(args.userId) -- Convert the userId parameter to a number if provided

    -- Fetch tasks from the database based on the provided userId or all tasks if userId is not provided
    local query
    if userId then
        query = string.format("SELECT * FROM TASKS WHERE user = %d", userId)
    else
        query = "SELECT * FROM TASKS"
    end

    local tasks, err = executeQuery(query)

    if not tasks then
        returnError(ngx.HTTP_INTERNAL_SERVER_ERROR, "Failed to fetch tasks from the database")
        return
    end

    -- Return the filtered tasks as the response
    returnJSON(tasks)
end)

r:get("/task/:id", function(params)
    local userId = authenticateRequest()
    if not userId then
        return
    end
    local taskId = tonumber(params.id) -- Convert the id parameter to a number
    if not taskId then
        returnError(ngx.HTTP_BAD_REQUEST, "Invalid task ID")
        return
    end

    -- Fetch the task from the database based on the provided taskId
    local query = string.format("SELECT * FROM TASKS WHERE id = %d", taskId)
    local tasks = executeQuery(query)

    -- Return the task as the response
    if #tasks == 1 then
        if tasks[1].user == userId then
            returnJSON(tasks[1])
        else
            returnError(ngx.HTTP_FORBIDDEN, "User is not authorized to access this task")
        end
    else
        returnError(ngx.HTTP_NOT_FOUND, "Task not found")
    end
end)

r:put("/task/:id", function(params)
    local userId = authenticateRequest()
    if not userId then
        return
    end
    local taskId = tonumber(params.id) -- Convert the id parameter to a number
    -- Check if the taskId is a valid number
    if not taskId then
        returnError(ngx.HTTP_BAD_REQUEST, "Invalid task ID")
        return
    end
    if checkUserId(userId, taskId) then
        -- Parse the request body as JSON and update the task data as before
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
            table.insert(fieldsToUpdate, string.format("title = '%s'", addBackslashes(json_data.title)))
        end
        if json_data.description then
            table.insert(fieldsToUpdate, string.format("description = '%s'", addBackslashes(json_data.description)))
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
        local update_query = string.format("UPDATE TASKS SET %s WHERE id = %d", table.concat(fieldsToUpdate, ", "),
            taskId)

        -- Execute the SQL query
        local result, err = executeQuery(update_query)

        -- Check if the update was successful
        if not result then
            returnError(ngx.HTTP_NOT_FOUND, "Task not found or Failed to update task in the database")
            return
        end

        if result.affected_rows and result.affected_rows > 0 then
            returnJSON({ result = "Task updated successfully" })
        else
            returnError(ngx.HTTP_NOT_FOUND, "Task not found or Failed to update task in the database")
        end
    end
end)

r:delete("/task/:id", function(params)
    local userId = authenticateRequest()
    if not userId then
        return
    end
    local taskId = tonumber(params.id) -- Convert the id parameter to a number
    if not taskId then
        returnError(ngx.HTTP_BAD_REQUEST, "Invalid task ID")
        return
    end
    if checkUserId(userId, taskId) then
        -- Delete the task from the database based on the provided taskId
        local query = string.format("DELETE FROM TASKS WHERE id = %d", taskId)
        local result = executeQuery(query)

        -- Check if the delete operation was successful
        if result.affected_rows and result.affected_rows > 0 then
            returnJSON({ result = "Task deleted successfully" })
        else
            returnError(ngx.HTTP_NOT_FOUND, "Task not found")
        end
    end
end)

r:post("/auth", function(params)
    -- Parse and validate JSON data for authentication
    local json_data, err = parseJSON(nil, { "user", "password" })
    if not json_data then
        returnError(ngx.HTTP_BAD_REQUEST, err)
        return
    end

    local user = tostring(json_data["user"])
    local password = json_data["password"]

    -- Query the database to validate the user's credentials
    local checkUserQuery = string.format("SELECT * FROM USERS WHERE user = %s", ngx.quote_sql_str(tonumber(user)))
    local userResult = executeQuery(checkUserQuery)

    if not userResult or #userResult == 0 then
        returnError(ngx.HTTP_UNAUTHORIZED, "Invalid credentials")
        return
    end

    -- Check if the provided password matches the stored password for the user
    local storedPassword = userResult[1].password
    if password ~= storedPassword then
        returnError(ngx.HTTP_UNAUTHORIZED, "Invalid credentials")
        return
    end

    -- Generate the JWT token for the authenticated user
    local token = generateToken(user)

    if token then
        returnJSON({ token = token })
    else
        returnError(ngx.HTTP_INTERNAL_SERVER_ERROR, "Failed to generate JWT")
    end
end)
r:options(".*", function()
    set_cors_headers()
end)

if not r:execute(ngx.req.get_method(), ngx.var.uri) then
    -- Return a 404 Not Found response if no route matches the requests
    returnError(ngx.HTTP_NOT_FOUND, "Not found")
end
