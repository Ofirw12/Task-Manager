import React from 'react';
import store from "../store";
import TaskListItem from './TaskListItem';
import { observer } from "mobx-react";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';


function TaskList() {
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));

    return (
        <div >
            <Box sx={{ flexGrow: 1, }}>
                <Grid sx={{ backgroundColor: 'grey.100' }}>
                    <Grid container spacing={1}>
                        <Grid item xs={4} sx={{ marginLeft: '2%' }}>
                            {store.UserId !== "" && <Typography variant='subtitle2'>Hint: Mark the checkbox when the task is done</Typography>}
                            
                        </Grid>
                    </Grid>
                    {store.tasks.map(
                        (task) =>
                            <Item sx={{ backgroundColor: 'grey.100' }} key={task.id}>
                                <TaskListItem
                                    key={task.id}
                                    item={task}
                                />
                            </Item>)}
                </Grid>
            </Box>
        </div>
    )
}


export default observer(TaskList);