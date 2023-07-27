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
        store.setAddMode(false);
        e.preventDefault();
    }
    return <div>
        <Box
            sx={store.addMode ? {
                width: 700,
                height: 210,
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
            <form action="" onSubmit={handleSubmit} >
                <TextField margin="normal" label="Add a new task"
                    sx={{ backgroundColor: 'grey.100', width: 400 }}
                    value={store.newTitle}
                    onChange={(e) => (store.setNewTitle(e.target.value))}
                    onClick={() => (store.setAddMode(true))}
                />
                <Zoom in={store.addMode}>
                    <div >
                        <TextField margin="normal" label="Add a new description"
                            sx={{ backgroundColor: 'grey.100', width: 600 }}
                            value={store.newDesc}
                            onChange={(e) => (store.setNewDesc(e.target.value))}
                        />
                        <Grid item xs={2} sx={{marginLeft:'40%', marginBottom:'20%'}}>
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
