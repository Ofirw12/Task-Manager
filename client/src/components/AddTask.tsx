import React, { useState } from "react";
import store from "../store";
import { observer } from "mobx-react";
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Grid from "@mui/material/Grid";
import Zoom from '@mui/material/Zoom';

function AddTask() {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        store.addTask();
        store.addMode = false;
        e.preventDefault();
    }
    return <div>
        {/* <form action="" onSubmit={handleSubmit}>
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
        </form> */}
        <Box
            sx={store.addMode ? {
                width: 700,
                height: 200,
                backgroundColor: 'grey.200',
                textAlign: 'center',
                borderRadius: '7px',
                boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.3)',
            } : {
                width: 400,
                height: 100,
                backgroundColor: 'grey.200',
                textAlign: 'center',
                borderRadius: '7px',
                boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.3)',
            }}
            margin="30px auto 20px auto">
            <form action="" onSubmit={handleSubmit}>
                <TextField margin="normal" label="Add a new task"
                    sx={{ backgroundColor: 'grey.100', width: 400 }}
                    value={store.newTitle}
                    onChange={(e) => (store.newTitle = e.target.value)}
                    onClick={() => (store.addMode = true)}
                />
                <Zoom in={store.addMode}>
                    <div>
                        <TextField margin="normal" label="Add a new description"
                            sx={{ backgroundColor: 'grey.100', width: 600 }}
                            value={store.newDesc}
                            onChange={(e) => (store.newDesc = e.target.value)}
                        />
                        <Grid item xs={2}>
                            <Fab disabled={store.newDesc === "" || store.newTitle === ""} color='warning' aria-label="add" type="submit" size="small">
                                <AddIcon />
                            </Fab>
                        </Grid>
                    </div>
                </Zoom>


            </form>
        </Box>
    </div>
}

export default observer(AddTask);
