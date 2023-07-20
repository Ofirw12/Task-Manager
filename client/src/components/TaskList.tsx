import React from 'react';
// import Box from '@mui/material/Box';
// import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';
import store from "../store";
import TaskListItem from './TaskListItem';
import {observer} from "mobx-react";

function TaskList(){

return (
    <div>
        {store.tasks.map(
            (task) =>
            <TaskListItem
            key={task.id}
            item={task}
            />)}
    </div>
)
}


export default observer(TaskList);