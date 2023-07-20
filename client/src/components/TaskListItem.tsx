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
interface TaskListItemProps {
    item: Task;
}

const TaskListItem: React.FC<TaskListItemProps> = ({ item }) => {
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
        else {
            item.editMode = true;
            item.updatedTitle = item.title;
            item.updatedDescription = item.description;
        }
    };

    return (
        <div key={item.id}>
            {item.editMode ? (
                <div>
                    {/* <Grid item xs={8}>
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
                    </Grid> */}
                    <Box
                        sx={{
                            width: 500,
                            maxWidth: '100%',
                            
                        }}
                    >
                        <TextField fullWidth margin="normal" label="Title" id="fullWidth"
                        value={item.updatedTitle}
                        onChange={(e) => (item.updatedTitle = e.target.value)}
                        />
                        <TextField fullWidth margin="normal" label="Description" id="fullWidth"
                        value={item.updatedDescription}
                        onChange={(e) => (item.updatedDescription = e.target.value)}/>
                        <Fab sx={{ mr: 1 }} color="warning" size="small" aria-label="edit">
                            <SaveIcon onClick={handleClick}/>
                        </Fab>
                    </Box>
                </div>
            ) : (
                <div>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>{item.title}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography>
                                {item.description}
                            </Typography>
                            <Checkbox
                                checked={item.completed}
                                onChange={() => (item.completed = !item.completed)}
                                sx={{ mr: 1 }}
                            />
                            <Fab color="warning" size="small" aria-label="edit"
                                onClick={handleClick}
                                sx={{ mr: 1 }}>
                                <EditIcon />
                            </Fab>
                            <Fab color="warning" size="small" aria-label="edit"
                                onClick={() => store.removeTask(item.id)}
                                sx={{ mr: 1 }}
                            >
                                <DeleteIcon />
                            </Fab>
                        </AccordionDetails>
                    </Accordion>
                </div>
            )}
        </div>
    );
};

export default observer(TaskListItem);