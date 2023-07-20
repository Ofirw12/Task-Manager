import React from 'react';
import logo from './logo.svg'; //replace
import Header from "./Header";
import Footer from "./Footer";
import TaskList from './TaskList';
import AddTask from './AddTask';


function App() {
  return (
    <div className="App">
      <Header/>
      <AddTask/>
      <TaskList/>
      <Footer/>
    </div>
  );
}

export default App;
