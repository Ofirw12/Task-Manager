import React from 'react';
import store from "../store";
import TaskListItem from './TaskListItem';
import { observer } from "mobx-react";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';


function TaskList() {
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    }));
    const handleChange = (event: SelectChangeEvent) => {
        store.setFilterMode(event.target.value as string);
        //store.filter(event.target.value as string);
      };

    return (
        <div >
            <Box sx={{ flexGrow: 1, }}>
                <Grid sx={{ backgroundColor: 'grey.100' }}>
                    <Grid container spacing={1}>
                        <Box sx={{ minWidth: 120 , }}>
                            <FormControl fullWidth sx={{marginLeft: "10%"}}>
                                <InputLabel id="demo-simple-select-label">Filter by:</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={store.filterMode}
                                    label="Filter by:"
                                    onChange={handleChange}
                                >
                                    <MenuItem value={"All"}>All</MenuItem>
                                    <MenuItem value={"Completed"}>Completed</MenuItem>
                                    <MenuItem value={"Incomplete"}>Incomplete</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    </Grid>

                    {store.setFilterMode(store.filterMode).map(
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