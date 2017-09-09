import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ControlPanel from './comp/cp.js'

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="container">
        <ControlPanel />
        </div>

      </div>
    );
  }
}

export default App;
