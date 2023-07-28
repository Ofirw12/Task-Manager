import react from "react";
import { observer } from "mobx-react";
import { Checkbox, Grid } from "@mui/material";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import store, { Task } from "../store";
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SaveIcon from '@mui/icons-material/Save';
import Zoom from '@mui/material/Zoom';
interface TaskListItemProps {
    item: Task;
}

const TaskListItem: React.FC<TaskListItemProps> = ({ item }) => {
    const handleUpdate = () => {
        store.updateTask(item.id);
        store.setTaskEditMode(item, false);
    };

    const handleClick = () => {
        if (item.editMode) {
            store.setTaskTitle(item, item.updatedTitle);
            store.setTaskDescription(item, item.updatedDescription);
            handleUpdate();
        }
        else {
            store.setTaskEditMode(item, true);
            store.setTaskUpdatedTitle(item, item.title);
            store.setTaskUpdatedDescription(item, item.description);
        }
    };
    const doCheck = (): boolean | undefined => {
        console.log('localStorage["userId"]: ', localStorage["userId"]);
        console.log('item.user: ', item.user);
        console.log('typeof localStorage["userId"]: ', typeof localStorage["userId"]);
        console.log('typeof item.user: ', typeof item.user);
        console.log('parseInt(localStorage["userId"]): ', parseInt(localStorage["userId"]));
        console.log('typeof parseInt(localStorage["userId"]: ', typeof parseInt(localStorage["userId"]));
        console.log(localStorage["userId"] === item.user);
        console.log(parseInt(localStorage["userId"]) === item.user);

        return parseInt(localStorage["userId"]) !== item.user;
    }

    return (
        <div key={item.id}>
            {item.editMode ? (
                <div>
                    <Zoom in={item.editMode}>
                        <Box
                            sx={{
                                width: '100%',
                                maxWidth: '100%',
                                backgroundColor: 'grey.200'
                            }}
                        >
                            <Grid item xs={4}>
                                <TextField margin="dense" label="Title"
                                    sx={{ backgroundColor: 'grey.100', width: 400 }}
                                    value={item.updatedTitle}
                                    onChange={(e) => (store.setTaskUpdatedTitle(item, e.target.value))}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField margin="normal" label="Description"
                                    sx={{ backgroundColor: 'grey.100', width: 600 }}
                                    value={item.updatedDescription}
                                    onChange={(e) => (store.setTaskUpdatedDescription(item, e.target.value))} />
                            </Grid>
                            <Grid item xs={2}>
                                <Fab sx={{ mr: 1 }} color="warning" size="small" aria-label="edit">
                                    <SaveIcon onClick={handleClick} />
                                </Fab>
                            </Grid>
                        </Box>
                    </Zoom>
                </div>
            ) : (
                <div>
                    <Zoom in={!item.editMode}>
                        <Accordion sx={{ backgroundColor: 'grey.300' }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                            >
                                <Grid item xs={8}>
                                    <Checkbox
                                        checked={item.completed}
                                        disabled={parseInt(localStorage["userId"]) !== item.user}
                                        onClick={
                                            (e) => {
                                                e.stopPropagation();
                                                store.setTaskCompleted(item, !item.completed);
                                            }
                                        }
                                        sx={{ marginTop: '50%', marginLeft: '50%' }}
                                    />
                                </Grid>
                                <Grid item xs={8}>
                                    <Typography margin="30px auto 20px 100px">
                                        {item.title}
                                    </Typography>
                                </Grid>
                            </AccordionSummary>
                            <AccordionDetails sx={{ backgroundColor: 'grey.200' }}>
                                <Typography margin="30px auto 20px auto">
                                    {item.description}
                                </Typography>
                                <Fab color="warning" size="small" aria-label="edit"
                                    onClick={handleClick} disabled={parseInt(localStorage["userId"]) !== item.user}
                                    sx={{ mr: 1 }}>
                                    <EditIcon />
                                </Fab>
                                <Fab color="warning" size="small" aria-label="delete"
                                    onClick={() => store.removeTask(item.id)}
                                    sx={{ mr: 1 }}
                                    disabled={parseInt(localStorage["userId"]) !== item.user}
                                >
                                    <DeleteIcon />
                                </Fab>
                            </AccordionDetails>
                        </Accordion>
                    </Zoom>
                </div>
            )}
        </div>
    );
};

export default observer(TaskListItem);