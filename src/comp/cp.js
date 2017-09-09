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
    const soundMap = {
      red: "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3",
      green: "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3",
      blue: "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3",
      yellow: "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"
    };
    const color = event.target.id;
    const audioObj = new Audio(soundMap[color]);
    audioObj.play();
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
