import React from "react";
import store from "../store";
import { observer } from "mobx-react";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const TaskSummarizer = () => {
    return <Box sx={{ textAlign: 'center' }}>
        <Card sx={{ minWidth: 275, width: 350, backgroundColor: 'grey.200', marginTop: '7%', marginLeft: '10%' }} >
            <CardContent>
                <Typography variant="h5" component="div">
                    You've completed {store.completedTasksCount}/{store.tasks.length} tasks
                </Typography>
                {store.completedTasksCount !== 0 ?
                    <Typography variant="body2">You did well! There are no tasks left!</Typography>
                    : <Typography variant="body2">{store.nextTaskReport}</Typography>}
                {(store.completedTasksCount !== 0) && <Typography variant="body2">You're always welcome to add more 😉</Typography>}
            </CardContent>
        </Card>
    </Box>
}

export default observer(TaskSummarizer);