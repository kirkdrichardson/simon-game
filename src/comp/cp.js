import React, { Component } from 'react';
import './cp.css';


class ControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: '--',
      started: false,
      strictMode: false,
      userTurn: false,
      sequenceArr: [],
      userPlay: 0
    }
  }

  componentDidUpdate() {
    // check if computer's turn
    if (this.state.started && !this.state.userTurn) {
      setTimeout(this.computerTurn, 1000);
    }

    // modify count if the user has played all colors in sequence
    if (this.state.count === this.state.userPlay) {
      this.setState({
        count: this.state.count + 1,
        userTurn: false
      });
    }
  }

  resetBoard = () => {
    this.setState({
      count: '--',
      started: false,
      strictMode: false,
      userTurn: false,
      sequenceArr: [],
      userPlay: 0
    });
  }


  // sounds for each of the colors. Used in handleUserMove
  soundMap = {
    red: "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3",
    green: "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3",
    blue: "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3",
    yellow: "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3"
  };


  /* control buttons */
  toggleStrict = () => {
    this.setState({
      strictMode: !this.state.strictMode
    });
  }

  toggleStart = () => {
    const count = !this.state.started ? 1 : '--'
    this.setState({
      count: count,
      started: !this.state.started,
      userTurn: false,
      sequenceArr: []
    });
  }

/* computer logic */

computerTurn = () => {
  // only run if a single new color hasn't yet been added to the sequence
  // count will be updated after user moves correctly
  if (this.state.count > this.state.sequenceArr.length) {
    const randomColor = () => ["red", "green", "blue", "yellow"][Math.floor(Math.random() * 4)];
    // add a new color to sequenceArr
    let newSequence = this.state.sequenceArr.concat(randomColor());


    const iterateOverSequence = (sequence) => {
        sequence.forEach(function(color, i) {
          setTimeout(function() {
            console.log(color);
            let element = document.getElementById(color);
            let audioObj = new Audio(this.soundMap[color]);
            this.simulateClick(element, color);
            audioObj.play();
          }.bind(this), i * 700);

        }, this);
    }

    this.setState({
      sequenceArr: newSequence
    }, () => iterateOverSequence(this.state.sequenceArr));


    this.setState({ userTurn: true, userPlay: 0 });
  }
}



// toggle class to simulate a user click
simulateClick = (elem, color) => {
  const colorMap = {
    red: '#FF93A2',
    green: '#7EFF2D',
    yellow: '#FFFCE0',
    blue: '#7CD5FF'
  }
  elem.style.backgroundColor = colorMap[color];
  setTimeout(() => {elem.style.backgroundColor = ''}, 600);
}



flashColorsOnReset = () => {
  const colors = ["red", "green", "yellow", "blue"];
  for (let i = 0; i < colors.length; i++) {
    let color = colors[i];
    this.simulateClick(document.getElementById(color), color);
  }
}


/* user interactivity methods */
  handleUserMove = (event) => {
    if (this.state.started && this.state.userTurn) {

      const color = event.target.id;
      const audioObj = new Audio(this.soundMap[color]);
      audioObj.play();

      if (color !== this.state.sequenceArr[this.state.userPlay]) {
        this.flashColorsOnReset();
        this.resetBoard();
      }
      else {
        this.setState({ userPlay: this.state.userPlay + 1 })
      }
    }
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
          className='colored-div red'
          onClick={this.handleUserMove}></div>

        <div
          id='green'
          className='colored-div green'
          onClick={this.handleUserMove}></div>

        <div
          id='blue'
          className='colored-div blue'
          onClick={this.handleUserMove}></div>

        <div
          id='yellow'
          className='colored-div yellow'
          onClick={this.handleUserMove}></div>

      </div>
    );
  }
}












export default ControlPanel
