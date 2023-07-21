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
                            sx={{ backgroundColor: 'grey.100', width:400 }}
                            value={item.updatedTitle}
                            onChange={(e) => (item.updatedTitle = e.target.value)}
                        />
                        </Grid>
                        <Grid item xs={6}>
                        <TextField margin="normal" label="Description"
                            sx={{ backgroundColor: 'grey.100',width:600 }}
                            value={item.updatedDescription}
                            onChange={(e) => (item.updatedDescription = e.target.value)} />
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
                            <Typography>Completed?</Typography>
                                <Checkbox
                                    checked={item.completed}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        item.completed = !item.completed
                                    }}
                                    sx={{ mr: 1 }}
                                />
                            </Grid>
                            <Grid item xs={8}><Typography margin="30px auto 20px 100px" align="center">{item.title}</Typography></Grid>
                        </AccordionSummary>
                        <AccordionDetails sx={{ backgroundColor: 'grey.200' }}>
                            <Typography margin="30px auto 20px auto">
                                {item.description}
                            </Typography>
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
                    </Zoom>
                </div>
            )}
        </div>
    );
};

export default observer(TaskListItem);