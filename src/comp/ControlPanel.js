import React, { Component } from 'react';
import styled from 'styled-components';
import './cp.css';


export default class ControlPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: '--',
      started: false,
      strictMode: false,
      userTurn: false,
      sequenceArr: [],
      userPlay: 0,
      replay: false,
      gameOver: false,
      prompt: 'Press start to begin'
    }
  }

  componentDidUpdate() {
    // user wins game if 20 steps completed
    if (this.state.count === 21) {
      this.setState({
        gameOver: true,
        count: 'win!',
        prompt: 'You broke the machine!'
      });

      // loop success sound
      const gameWinSound = new Audio(this.soundMap.correct);
      gameWinSound.loop = true
      gameWinSound.play();
      setTimeout(() => gameWinSound.loop = false, 5000);

      // loop flashing lights
      let cnt = 0
      const id = setInterval(() => {
        if (cnt === 5) {
          clearInterval(id);
          this.resetBoard();
        }
        else
          this.flashColorsOnReset();
        cnt++;
      }, 900);

    }

    // check if computer's turn
    if (this.state.started && !this.state.userTurn && !this.state.gameOver) {
      setTimeout(this.computerTurn, 1000);
    }

    // modify count & play success sound if the user has played all colors in sequence & game not over
    if (this.state.count === this.state.userPlay && !this.state.gameOver) {
      const successSound = new Audio(this.soundMap.correct);
      successSound.play();

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
      userTurn: false,
      sequenceArr: [],
      userPlay: 0,
      replay: false,
      gameOver: false,
      prompt: 'Press start to begin'
    });
  }


  // sounds for each of the colors. Used in handleUserMove
  soundMap = {
    red: "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3",
    green: "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3",
    blue: "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3",
    yellow: "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3",
    correct: "http://freesound.org/people/suntemple/sounds/253177/download/253177__suntemple__retro-accomplished-sfx.wav",
    incorrect: "https://freesound.org/people/myfox14/sounds/382310/download/382310__myfox14__game-over-arcade.wav"
  };


  /* control buttons */
  toggleStrict = () => {
    this.setState({
      strictMode: !this.state.strictMode,
    });
  }

  toggleStart = () => {
    this.resetBoard();
    const count = !this.state.started ? 1 : '--'
    const prompt = !this.state.started ? 'Get 20 in a row to win!' : 'Press start to begin'
    this.setState({
      count: count,
      started: !this.state.started,
      userTurn: false,
      sequenceArr: [],
      prompt: prompt
    });
    setTimeout(() => this.setState({prompt: ''}), 3000);
  }

/* computer logic */

computerTurn = () => {
  // only run if a single new color hasn't yet been added to the sequence
  // count will be updated after user moves correctly
  if (this.state.count > this.state.sequenceArr.length || this.state.replay) {
    const randomColor = () => ["red", "green", "blue", "yellow"][Math.floor(Math.random() * 4)];
    // if replay, reuse sequence, else add new color to end
    let sequence = (this.state.replay) ? this.state.sequenceArr : this.state.sequenceArr.concat(randomColor());

    // for every color in sequnce, play sound & simulate click
    const iterateOverSequence = (sequence) => {
        sequence.forEach(function(color, i) {
          setTimeout(function() {
            let element = document.getElementById(color);
            let audioObj = new Audio(this.soundMap[color]);
            this.simulateClick(element, color);
            audioObj.play();
          }.bind(this), i * 700);
        }, this);
    }



    const endingCallback = () => {
      iterateOverSequence(this.state.sequenceArr)
      this.setState({
        userPlay: 0,
        replay: false,
        userTurn: true
      });
    }

    this.setState({
      sequenceArr: sequence
    }, endingCallback);
  }
}



// toggle class to simulate a user click
simulateClick = (elem, color) => {
  const colorMap = {red: '#FF93A2', green: '#7EFF2D', yellow: '#FFFCE0', blue: '#7CD5FF' }
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


  handleUserMove = (event) => {

    if (this.state.started && this.state.userTurn) {

      // play sound on button press
      const color = event.target.id;
      const audioObj = new Audio(this.soundMap[color]);
      audioObj.play();

      // if user toggles incorrectly
      if (color !== this.state.sequenceArr[this.state.userPlay]) {
        let cnt = 0;
        const id = setInterval(() => {
          if (cnt === 2) {
            clearInterval(id);

            // reset state & start at one
            if (this.state.strictMode) {
              this.resetBoard();
              this.setState({
                count: 0,
                started: true,
                prompt: "To prevent restarting, turn strict mode off",
              });
              setTimeout(() => this.setState({ prompt: '' }), 5000);
            }

            // if strictMode off, turn on replay, set user play to 0, and let computer move
            else {
              this.setState({
                replay: true,
                userPlay: 0,
                userTurn: false
              })
            }
          }
          else {
            // flash colors & play failure sound in every case
            this.flashColorsOnReset();
            const failureSound = new Audio(this.soundMap.incorrect);
            failureSound.play();
          }

        cnt++;

        }, 900);

      }
      // if user plays correct color, play sound & add 1 to userPlay (used to evaluate the next index of sequenceArr)
      else {
        this.setState({ userPlay: this.state.userPlay + 1 });
      }
    }
  }


  render() {

    const { count, strictMode, prompt } = this.state;

    return (
      <div className='game-prompt-container'>
      <div className='game-container'>

        <ScoreAndButtons>
          <Title>Simon</Title>
          <Count>{count}</Count>
          <ControlButtons>
            <ControlButtonContainer margin='0 45px 0 0'>
              <ControlButton onClick={this.toggleStart} />
              <ButtonText>Start</ButtonText>
            </ControlButtonContainer>
              <ControlButtonContainer>
                <ButtonIndicatorLight on={strictMode} />
                <ControlButton warning onClick={this.toggleStrict} />
                <ButtonText>Strict</ButtonText>
              </ControlButtonContainer>
          </ControlButtons>
        </ScoreAndButtons>


        {/* {['red', 'green', 'blue', 'yellow'].map(b => <ColoredButton additionalStyle={b.style} onClick={this.handleUserMove} />)} */}



        <ColoredButton
          className='colored-div red'
          onClick={this.handleUserMove} />

        <ColoredButton
          className='colored-div green'
          onClick={this.handleUserMove} />

        <ColoredButton
          className='colored-div blue'
          onClick={this.handleUserMove} />

        <ColoredButton
          className='colored-div yellow'
          onClick={this.handleUserMove} />

      </div>

      <Prompt>{prompt}</Prompt>

      </div>
    );
  }
}


const PromptContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  position: absolute;
  height: 700px;
  width: 700px;
`;


const Title = styled.h1`
  font-family: 'Gravitas One', 'Orbitron', cursive, sans-serif;
  font-size: 50px;
  margin-bottom: 10px;
  margin-top: 20px;
`;

const Count = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0C001E;
  height: 90px;
  width: 150px;
  border-radius: 15%;
  font-size: 78px;
  font-weight: bold;
  color: #D13045;
  font-family: 'Digital','Orbitron', sans-serif;
  border: solid 5px gray;
  padding-bottom: 10px;
  box-shadow: 1px 1px 5px #888888;
`;



const ScoreAndButtons = styled.div`
  position: absolute;
  z-index: 2;
  background-color: #E0D2BC;
  height: 320px;
  width: 320px;
  border-radius: 40%;
  border: solid 30px #0C001E;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const ControlButtons = styled.div`
  display: flex;
  padding: 20px;
  margin-left: 20px;
`;

const ControlButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: ${props => props.margin ? props.margin : '0 0 0 45px'};
  line-height: 1px;
`;

const ControlButton = styled.div`
  height: 30px;
  width: 30px;
  margin-top: ${props => props.warning ? 0 : 8}px;
  border-radius: 50%;
  border: solid 5px black;
  background-color:  ${props => props.warning ? '#EAD746' : '#D13045'};
  box-shadow: 2px 2px 3px #888888;

  :hover {
    background-color: ${props => props.warning ? '#DDCB42' : '#BA1A3C'};
    box-shadow: 0 2px #666;
    transform: translateY(1px);
  }
`;

const ButtonText = styled.p`
  font-family: cursive, sans-serif;
`;

const ButtonIndicatorLight = styled.div`
  height: 10px;
  width: 10px;
  border-radius: 50%;
  background-color: ${props => props.on ? '#D13045' : '#0C001E'};
  margin: 0 0 0 40px;
  border: solid .9px black;
  box-shadow: 1px 1px 1px #888888;
`;

const ColoredButton = styled.div`
  height: 260px;
  width: 260px;
  padding: 0;
  overflow: hidden;
  position: relative;
  z-index: 1;
`;

const Prompt = styled.p`
  position: relative;
  bottom: 0;
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0;
  padding: 0;
  font-family: 'Ubuntu', sans-serif;
`;
