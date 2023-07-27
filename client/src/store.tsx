import { makeAutoObservable, runInAction } from "mobx";
import * as requestHandler from "./requestHandler";
export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  editMode: boolean;
  updatedTitle: string;
  updatedDescription: string;
}

//create read update delete with backend implementation

const removeTask = (tasks: Task[], id: number): Task[] =>
  tasks.filter((task) => task.id !== id);

const addTask = (tasks: Task[], title: string, description: string, id: number): Task[] => [
  ...tasks,
  {
    id: id,
    title: title,
    description: description,
    completed: false,
    editMode: false,
    updatedTitle: "",
    updatedDescription: "",
  },
];

// MobX implementation
class Tasks {
  tasks: Task[] = [];
  newTitle: string = "";
  newDesc: string = "";
  addMode: boolean = false;
  logedIn: boolean = false;
  UserId: string = "";
  UserPassword: string = "";
  serverResponse: string = "";
  //updatedTitle: string = "";
  //updatedDescription:string =  "";

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
      const taskId = await requestHandler.addTask(this.newTitle, this.newDesc, 0);
      this.setTasks(addTask(this.tasks, this.newTitle, this.newDesc, taskId));
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
      this.setTasks(await requestHandler.getAllUserTasks(parseInt(store.UserId)));
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
      this.UserPassword = "";
      requestHandler.authenticate(id, password);
      if (store.UserId === "1") {
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
