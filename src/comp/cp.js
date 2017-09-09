import React, { Component } from 'react';
import './cp.css';


class ControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: '--'
    }
  }
  render() {
    const strictLight = {backgroundColor: '#D13045'}
    return (
      <div className='game-container'>

        <div id='control'>

          <h1 id='title'>Simon</h1>

          <div id='count'>{this.state.count}</div>
          <div id='btns-container'>
            <div id='start-btn-container'>
              <div id='start-btn'></div>
              <p className='btn-text'>Start</p>
            </div>
              <div id='strict-btn-container'>
                <div style={strictLight} id='strict-light'></div>
                <div id='strict-btn'></div>
                <p className='btn-text'>Strict</p>
              </div>
          </div>
        </div>




        <div id='red' className='colored-div'></div>
        <div id='green' className='colored-div'></div>
        <div id='blue' className='colored-div'></div>
        <div id='yellow' className='colored-div'></div>
      </div>
    );
  }
}












export default ControlPanel
