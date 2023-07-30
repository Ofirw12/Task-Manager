import React from "react";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import Fab from '@mui/material/Fab';
import store from "../store";
function Header() {
    return <div>
        <header>
            <h1><TaskAltIcon /> Task Manager</h1>
            {store.logedIn && <Fab sx={{ position: 'relative', marginLeft: '98%', mr: 1 }} size="small" color="warning" aria-label="Log out">
                <LogoutIcon onClick={() => store.setLogedIn(false)} />
            </Fab>}
        </header>
    </div>
}

export default Header;