import React, { useState } from "react";
import store from "../store";
import {observer} from "mobx-react";
function AddTask() {
    function handleSubmit(event: React.FormEvent<HTMLFormElement>){
        store.addTask();
        event.preventDefault(); 
    }
    return <div>
        <form action="" onSubmit={handleSubmit}>
            <input
            type="text"
            name="title"
            placeholder="Add a new task"
            value={store.newTitle}
            onChange={(event) => store.newTitle=event.target.value}
            />
            <textarea
            name="content"
            placeholder="new content"
            value = {store.newDesc}
            onChange={(event) => store.newDesc=event.target.value}
            cols={30}
            rows={3}
            />
            <button type="submit">Add</button>

            </form>
    </div>
}

export default observer(AddTask);
