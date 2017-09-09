import React, { Component } from 'react';
import './cp.css';


class ControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: '--',
      started: false,
      strictMode: false
    }
  }
  toggleStrict = () => {
    this.setState({
      strictMode: !this.state.strictMode
    });
  }

  toggleStart = () => {
    this.setState({
      count: 1,
      started: !this.state.started
    });
  }

  toggleColor = (event) => {
    console.log(event.target.id)
  }

  render() {
    const strictLight = {backgroundColor: '#0C001E'};
    if (this.state.strictMode)
      strictLight.backgroundColor = '#D13045';

    return (
      <div className='game-container'>

        <div id='control'>

          <h1 id='title'>Simon</h1>

          <div id='count'>{this.state.count}</div>
          <div id='btns-container'>
            <div id='start-btn-container'>
              <div id='start-btn' onClick={this.toggleStart}></div>
              <p className='btn-text'>Start</p>
            </div>
              <div id='strict-btn-container'>
                <div id='strict-light' style={strictLight}></div>
                <div id='strict-btn' onClick={this.toggleStrict}></div>
                <p className='btn-text'>Strict</p>
              </div>
          </div>
        </div>


        <div
          id='red'
          className='colored-div'
          onClick={this.toggleColor}></div>

        <div
          id='green'
          className='colored-div'
          onClick={this.toggleColor}></div>

        <div
          id='blue'
          className='colored-div'
          onClick={this.toggleColor}></div>

        <div
          id='yellow'
          className='colored-div'
          onClick={this.toggleColor}></div>

      </div>
    );
  }
}












export default ControlPanel
