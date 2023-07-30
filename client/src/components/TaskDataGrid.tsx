import * as React from 'react';
import store, { Task } from "../store";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import { observer } from "mobx-react";
import {
    GridRowsProp, GridRowModesModel, GridRowModes, GridColDef, DataGrid, GridToolbarContainer, GridActionsCellItem,
    GridEventListener, GridRowId, GridRowModel, GridRowEditStopReasons
} from '@mui/x-data-grid';

const priorities = ['High', 'Medium', 'Low'];
const statuses = ['Pending', 'In Progress', 'Completed'];
interface GridTask {
    id: number;
    title: string;
    description: string;
    priority: string;
    status: string;
};

const initialRows: GridRowsProp = [
    {
        id: 1,
        title: 'Task 1',
        description: 'Description of Task 1',
        status: 'In Progress',
        priority: 'High',
    },
    {
        id: 2,
        title: 'Task 2',
        description: 'Description of Task 2',
        status: 'In Progress',
        priority: 'High',
    },
    // Add more initial tasks as needed
];

interface EditToolbarProps {
}

function EditToolbar(props: EditToolbarProps) {
    const handleClick = () => {
        const id = 999999;
        store.addTask(); // Call the addTask action in the store to add a new task
    };

    return (
        <GridToolbarContainer>
            <Button color="warning" startIcon={<AddIcon />} onClick={handleClick}>
                Add a new task
            </Button>
        </GridToolbarContainer>
    );
}

const TaskDataGrid: React.FC = observer(() => {

    const getRows = (tasks: Task[]): GridTask[] => {
        return tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            priority: 'High',//task.priority
            status: 'Pending',//task.status
        }));
    };

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 100 },
        { field: 'title', headerName: 'Title', width: 200, editable: true },
        { field: 'description', headerName: 'Description', width: 400, editable: true },
        { field: 'status', headerName: 'Status', width: 150, type: 'singleSelect', valueOptions: statuses,editable: true },
        { field: 'priority', headerName: 'Priority', width: 150, type: 'singleSelect', valueOptions: priorities, editable: true },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 150,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                if (store.tasks.find(task => task.id === id)?.editMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            },
        },
    ];
    const handleRowEditStop = (params: any) => {
        if (params.row && params.row.id) {
            // Handle row edit stop event here.
            // This function is called when a row editing is stopped.
        }
    };

    const handleEditClick = (id: GridRowId) => () => {
        const task = store.tasks.find((task) => task.id === id);
        if (task) {
            store.setTaskEditMode(task, true);
        }
    };

    const handleSaveClick = (id: GridRowId) => () => {
        const task = store.tasks.find((task) => task.id === id);
        if (task) {
            store.setTaskEditMode(task, false);
            //do some updates
            // You can also update the title and description using store.setTaskTitle and store.setTaskDescription
            store.updateTask(task.id); // Call the updateTask action to save changes to the server
        }
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        const taskId = typeof id === "string" ? parseInt(id, 10) : id;
        store.removeTask(taskId);
    };

    const handleCancelClick = (id: GridRowId) => () => {
        const task = store.tasks.find((task) => task.id === id);
        if (task) {
            if (task.isNew) {
                const taskId = typeof id === "string" ? parseInt(id, 10) : id;
                store.removeTask(taskId);
            } else {
                store.setTaskEditMode(task, false);
                //return last values
            }
        }
    };

    const rows = getRows(store.tasks);
    return (
        <Box
            sx={{
                height: 500,
                width: '100%',
                '& .actions': {
                    color: 'text.secondary',
                },
                '& .textPrimary': {
                    color: 'text.primary',
                },
            }}
        >
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                onRowEditStop={handleRowEditStop}
                slots={{
                    toolbar: EditToolbar,
                }}
            />
        </Box>
    );
});

export default TaskDataGrid;
