import React, { useState } from "react";
import store from "../store";
import { observer } from "mobx-react";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
function AddTask() {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        store.addTask();
        e.preventDefault();
    }
    return <div>
        <form action="" onSubmit={handleSubmit}>
            <TextField fullWidth margin="normal" label="Add a new task" id="fullWidth"
                    value={store.newTitle}
                    onChange={(e) => (store.newTitle = e.target.value)}
                />
            <TextField fullWidth margin="normal" label="Add a new description" id="fullWidth"
                    value={store.newDesc}
                    onChange={(e) => (store.newDesc = e.target.value)}
                />
            <Fab color='warning' aria-label="add" type="submit" size="small">
                <AddIcon />
            </Fab>
        </form>
    </div>
}

export default observer(AddTask);
