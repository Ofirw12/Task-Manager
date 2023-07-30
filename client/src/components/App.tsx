import Header from "./Header";
import TaskSummarizer from "./TaskSummarizer";
import TaskList from './TaskList';
import AddTask from './AddTask';
import LoginArea from './LoginArea';
import store from "../store";
import { observer } from "mobx-react";
import Snackbar from '@mui/material/Snackbar';
import Grid from '@mui/material/Grid';


function App() {
  return (
    <div className="App">
      <Header />
      {store.logedIn ?
        <div>
      <Grid container spacing={2} sx={{marginBottom:'2%'}}>
        <Grid item xs={3}>
        {parseInt(localStorage["userId"]) !== 1 && <TaskSummarizer />}
        </Grid>
        <Grid item xs={6}>
        <AddTask />
        </Grid>
      </Grid>
          <TaskList />
        </div>
        :
        <LoginArea />
        }
        {(store.serverResponse !== "") &&
        <Snackbar
          open={store.serverResponse !== ""}
          autoHideDuration={5000}
          onClose={() => store.setServerResponse("")}
          message={store.serverResponse}
        />
        }
    </div>
  );
}

export default observer(App);
