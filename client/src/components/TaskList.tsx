import React from 'react';
import store from "../store";
import TaskListItem from './TaskListItem';
import {observer} from "mobx-react";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';


function TaskList(){
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
      }));

return (
    <div >
        {/* {store.tasks.map(etailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'.
  Property 'textAlign' does not exist on type 'DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'.ts(2322)
            (task) =>
            <TaskListItem
            key={task.id}
            item={task}
            />)} */}

<Box sx={{ flexGrow: 1,}}>
        <Grid sx={{backgroundColor: 'grey.400'}}>
            {store.tasks.map(
            (task) =>
            <Item sx={{backgroundColor: 'grey.100'}}>
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