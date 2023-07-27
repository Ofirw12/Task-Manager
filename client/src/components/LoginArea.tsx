import React from "react";
import store from "../store";
import LoginIcon from '@mui/icons-material/Login';
import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from "@mui/material/Grid";
import { observer } from "mobx-react";

function LoginArea() {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        store.login(parseInt(store.UserId), store.UserPassword);
        e.preventDefault();
    }
    function handleClick(){
        store.signup(parseInt(store.UserId), store.UserPassword);
    }
    return <Box
        sx={{
            width: 400,
            height: 220,
            backgroundColor: 'grey.200',
            textAlign: 'center',
            borderRadius: '7px',
            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.3)',
        }}
        margin="220px auto 20px auto">
        <form action="" onSubmit={handleSubmit}>
            <TextField margin="normal" label="User Id"
                sx={{ backgroundColor: 'grey.100', width: 300 }}
                value={store.UserId}
                onChange={(e) => (store.setUserId(e.target.value))}
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            />
            <div>
                <TextField margin="normal" label="Password"
                    sx={{ backgroundColor: 'grey.100', width: 300 }}
                    value={store.UserPassword}
                    onChange={(e) => (store.setUserPassword(e.target.value))}
                    type="password"
                />
                <Grid item xs={2}>
                    <Fab variant="extended" disabled={store.UserId === "" || store.UserPassword === ""} color='warning'
                    aria-label="add" type="submit" size="small" sx={{ mr: 1 }}>
                        Login <LoginIcon />
                    </Fab>
                    <Fab variant="extended" disabled={store.UserId === "" || store.UserPassword === ""}
                    size="small" color="warning" aria-label="Sign Up" sx={{ mr: 1  }} onClick={handleClick}>
                        Signup
                    </Fab>
                    
                </Grid>
            </div>


        </form>
    </Box>

}
export default observer(LoginArea);