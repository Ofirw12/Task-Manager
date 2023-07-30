import { makeAutoObservable, runInAction } from "mobx";
import * as requestHandler from "./requestHandler";
export interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  completed: boolean;
  user: number;
  editMode: boolean;
  updatedTitle: string;
  updatedDescription: string;
  isNew: boolean;
}

//create read update delete with backend implementation

const removeTask = (tasks: Task[], id: number): Task[] =>
  tasks.filter((task) => task.id !== id);

const addTask = (tasks: Task[], title: string, description: string, id: number, status: string, priority: string): Task[] => [
  ...tasks,
  {
    id: id,
    title: title,
    description: description,
    status: status,
    priority: priority,
    user: localStorage["userId"],
    completed: false,
    editMode: false,
    updatedTitle: "",
    updatedDescription: "",
    isNew: true,
  },
];

// MobX implementation
class Tasks {
  tasks: Task[] = [];
  newTitle: string = "";
  newDesc: string = "";
  newStatus: string = "";
  newPriority: string ="";
  addMode: boolean = false;
  logedIn: boolean = false;
  UserId: string = "";
  UserPassword: string = "";
  serverResponse: string = "";
  filterMode: string = "All";

  constructor() {
    makeAutoObservable(this);
  }
  //Mobx setters
  setNewTitle(value: string) {
    runInAction(() => this.newTitle = value);
  }
  setNewDesc(value: string) {
    runInAction(() => this.newDesc = value);
  }
  setAddMode(value: boolean) {
    runInAction(() => this.addMode = value);
  }
  setLogedIn(value: boolean) {
    runInAction(() => this.logedIn = value);
  }
  setUserId(value: string) {
    runInAction(() => this.UserId = value);
  }
  setUserPassword(value: string) {
    runInAction(() => this.UserPassword = value);
  }
  setServerResponse(value: string) {
    runInAction(() => this.serverResponse = value);
  }
  setTasks(tasksOrTask: Task | Task[]) {
    runInAction(() => {
      if (Array.isArray(tasksOrTask)) {
        this.tasks = tasksOrTask;
      }
      else {
        this.tasks = [...this.tasks, tasksOrTask]
      }
    })
  }
  setTaskUpdatedTitle(task: Task, value: string) {
    runInAction(() => task.updatedTitle = value);
    
  }
  setTaskUpdatedDescription(task: Task, value: string) {
    runInAction(() => task.updatedDescription = value);
  }
  setTaskTitle(task: Task, value: string) {
    runInAction(() => task.title = value);
  }
  setTaskDescription(task: Task, value: string) {
    runInAction(() => task.description = value);
  }
  setTaskEditMode(task: Task, value: boolean) {
    runInAction(() => task.editMode = value);
  }
  setTaskCompleted(task: Task, value: boolean) {
    runInAction(() => task.completed = value);
    this.updateTask(task.id);
  }
  setFilterMode(value: string) : Task[]{
    if(value === "All"){
      runInAction(() => this.filterMode="All");
      return this.tasks;
    }
    else if (value  === "Completed"){
      runInAction(() => this.filterMode="Completed");
      return this.tasks.filter((task) => task.completed===true);
    }
    else if (value === "Incomplete"){
      runInAction(() => this.filterMode="Incomplete");
      return this.tasks.filter((task) => task.completed===false);
    }
    else{
      return [];
    }


  }

  async removeTask(id: number) {
    try {
      requestHandler.deleteTask(id);
      this.tasks = removeTask(this.tasks, id);
    }
    catch (error) {
      console.error("Error while deleting task:", error);
    }
  }

  async addTask() {
    try {
      const taskId = await requestHandler.addTask(this.newTitle, this.newDesc, this.newPriority, this.newStatus,0);
      this.setTasks(addTask(this.tasks, this.newTitle, this.newDesc, taskId, this.newStatus, this.newPriority));
      this.setNewTitle("");
      this.setNewDesc("");
    }
    catch (error) {
      console.error("Error while adding task:", error);
    }

  }

  async updateTask(id: number) {
    try {
      const task = this.tasks.find((task) => task.id === id);
      if (task) {
        runInAction(() => {
          if (task.updatedTitle !== "") {
            store.setTaskTitle(task, task.updatedTitle);
          }
          if (task.updatedDescription !== "") {
            store.setTaskDescription(task, task.updatedDescription);
          }
          store.setTaskEditMode(task, task.editMode);
        })
        await requestHandler.updateTask(task)
      }
      else {
        console.error("Task not found with id:", id);
      }
    }
    catch (error) {
      console.error("Error while updating task:", error);
    }
  }

  async signup(id: number, password: string) {
    try {
      const response = await requestHandler.addUser(id, password);
      if (response) {
        this.login(id, password);
      }
    } catch (error) {
      console.error("Error while signing up user:", error);
    }
  }


  get completedTasksCount() {
    return this.tasks.filter(
      task => task.completed === true
    ).length;
  }

  get nextTaskReport() {
    if (this.tasks.length === 0)
      return "No tasks available";
    const nextTask = this.tasks.find(tasks => tasks.completed === false);
    if(nextTask){
      return `Next task: ${nextTask.title}. `;
    }
    else{
      return "";
    }
  }


  async load() {
    try {
      this.setTasks(await requestHandler.getAllUserTasks(localStorage["userId"]));
    } catch (error) {
      console.error("Error while loading tasks:", error);
    }
  }

  async adminLoad() {
    try {
      this.setTasks(await requestHandler.getAllTasks());
    } catch (error) {
    }
  }

  async login(id: number, password: string) {
    try {
      localStorage["userId"]=store.UserId;
      store.setUserPassword("");
      store.setUserId("");
      requestHandler.authenticate(id, password);
      if (parseInt(localStorage["userId"]) === 1) {
        this.adminLoad();
      }
      else this.load();
    }
    catch (error) {
      console.error("Error while loging in:", error);
    }
  }
}

const store = new Tasks();

export default store;
