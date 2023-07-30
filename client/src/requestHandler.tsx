import axios from "axios";
import store, { Task } from "./store";
const serverIP = "http://localhost:8080";

interface ServerTaskData {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    completed: number;
    user: number;
  }

function getAuthenticationHeader() {
    return {
        headers: {
            'Authorization': "Bearer " + localStorage["token"]
        }
    };
}

function handleJSONTasks(response: ServerTaskData[]): Task[]{
    const tasks = response.map((item) => (
        {
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      completed: item.completed === 1 ? true : false,
      user: item.user,
      editMode: false,
      updatedTitle: "",
      updatedDescription: "",
      isNew: false,
    }));
    return tasks;
  }

  

//HTTP Request handlers
export function authenticate(user: number, password: string) {
    axios.post(serverIP + '/auth',{
        user: user,
        password: password
    })
        .then(function (response) {
            localStorage["token"] = response.data.token;
            if (localStorage["token"])
                store.setLogedIn(true);
                
        })
        .catch(function (error) {
            if (error.response && error.response.data) {
                store.setServerResponse(error.response.data.error);
            } else {
                console.log("Error while making the authentication request:", error);
            }
        });
}
export function addUser(user: number, password: string): Promise<boolean> {
    return axios.post(serverIP + "/users", {
        user: user,
        password: password
    })
    .then(function (response) {
        store.setServerResponse(response.data.result)
        return true;
    })
    .catch(function (error){
        if (error.response && error.response.data) {
            store.setServerResponse(error.response.data.error);
        }
        return Promise.reject(error);
    })
}
export function addTask(title: string, description: string, status: string, priority: string, completed: number): Promise<number> {
    return axios.post(serverIP + "/task", {
        title: title,
        description: description,
        completed: completed
    }, getAuthenticationHeader())
    .then(function (response) {
        store.setServerResponse(response.data.result);
        return response.data.id as number;
    })
    .catch(function (error) {
        if (error.response && error.response.data) {
            store.setServerResponse(error.response.data.error);
        }
        return Promise.reject(error);
    });
}
export function updateTask(task: Task) {
    axios.put(serverIP + "/task/" + task.id,
        {
            title: task.title,
            description: task.description,
            completed: task.completed === true ? 1 : 0
        }, getAuthenticationHeader())
        .then(function (response) {
            store.setServerResponse(response.data.result);
    
        })
        .catch(function (error) {
            if (error.response && error.response.data) {
                store.setServerResponse(error.response.data.error);
            }
        });

}
export function deleteTask(id: number) {
    axios.delete(serverIP + "/task/" + id, getAuthenticationHeader())
        .then(function (response) {
            store.setServerResponse(response.data.result);
        })
        .catch(function (error) {
            if (error.response && error.response.data) {
                store.setServerResponse(error.response.data.error);
            }
        });
}
export function getAllUserTasks(userId: number): Promise<Task[]> {
    return axios.get(serverIP + "/tasks?userId=" + userId, getAuthenticationHeader())
        .then(function (response) {
            if (Object.keys(response.data).length === 0) {
                return [];
            }
            return handleJSONTasks(response.data) as Task[];
        })
        .catch(function (error) {
            store.setServerResponse(error.response.data.error);
            return Promise.reject(error);
        })
}
export function getAllTasks():Promise<Task[]> {
    return axios.get(serverIP + "/tasks", getAuthenticationHeader())
    .then(function (response) {
        if (Object.keys(response.data).length === 0) {
            return [];
        }
        return handleJSONTasks(response.data) as Task[];
    })
    .catch(function (error) {
        store.setServerResponse(error.response.data.error);
        return Promise.reject(error);
    })
}