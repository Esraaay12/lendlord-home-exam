import React, { useState } from 'react'

import './App.css';
import Header from './components/header';
import UserManagement from './components/user-management';

function App() {
  return (
    <div className="App">
      <Header />
      <UserManagement />
    </div>
  )
}

export default App;
