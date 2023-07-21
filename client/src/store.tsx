import { makeAutoObservable } from "mobx";
import jsonTasks from "./Tasks.json";

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

const addTask = (tasks: Task[], title:string, description: string): Task[] => [
...tasks,
{
  id: Math.max(0, Math.max(...tasks.map(({ id }) => id))) + 1,
  title: title,
  description,
  completed: false,
  editMode: false,
  updatedTitle: "",
  updatedDescription: "",
},
];

// MobX implementation
class Tasks {
  tasks: Task[] = jsonTasks;
  newTitle: string = "";
  newDesc: string ="";
  addMode: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  removeTask(id: number) {
    this.tasks = removeTask(this.tasks, id);
  }

  addTask() {
    this.tasks = addTask(this.tasks, this.newTitle, this.newDesc);
    this.newTitle = "";
    this.newDesc ="";
  }

  updateTask(id: number){
    const task = this.tasks.find((task) => task.id === id);
    if (task){
      task.title = task.updatedTitle;
      task.description = task.updatedDescription;
      task.editMode = false;
    }
  }
  get completedTasksCount() {
    return this.tasks.filter(
      task => task.completed === true
    ).length;
  }
  get report() {
    if (this.tasks.length === 0)
      return "<none>";
    const nextTask = this.tasks.find(tasks => tasks.completed === false);
    return `Next task: "${nextTask ? nextTask.title : "<none>"}". ` +
      `Progress: ${this.completedTasksCount}/${this.tasks.length}`;
  }


  load(url: string) {
    fetch(url)
      .then((resp) => resp.json())
      .then((tasks: Task[]) => (store.tasks = tasks));
  }
}

const store = new Tasks();

export default store;
