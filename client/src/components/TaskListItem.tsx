import react from "react";
import { observer } from "mobx-react";
import { Checkbox } from "@mui/material";
import store, {Task} from "../store";
interface TaskListItemProps {
    item: Task;
  }

  const TaskListItem: React.FC<TaskListItemProps> = ({item}) => {
    const handleUpdate = () => {
      store.updateTask(item.id);
      item.editMode = false;
    };
  
    const handleClick = () => {
      if (item.editMode) {
        item.title = item.updatedTitle;
        item.description = item.updatedDescription;
        handleUpdate();
      }
      else{
        item.editMode=true;
        item.updatedTitle = item.title;
        item.updatedDescription = item.description;
      }
    };
  
    return (
      <div key={item.id}>
        {item.editMode ? (
          <div>
            <input
              type="text"
              value={item.updatedTitle}
              onChange={(e) => (item.updatedTitle = e.target.value)}
            />
            <textarea
              value={item.updatedDescription}
              onChange={(e) => (item.updatedDescription = e.target.value)}
              cols={30}
              rows={3}
            />
            <button onClick={handleClick}>Save</button>
          </div>
        ) : (
          <div>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <Checkbox
              checked={item.completed}
              onChange={() => (item.completed = !item.completed)}
            />
            <button onClick={handleClick}>Edit</button>
            <button onClick={() => store.removeTask(item.id)}>Delete</button>
          </div>
        )}
      </div>
    );
  };

export default observer(TaskListItem);