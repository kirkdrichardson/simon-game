//@flow strict
import * as React from "react";
import styled, { css } from "styled-components";

// sounds associated with each of the colors. Used in handleUserMove
const SoundMap: { [string]: string } = {
  red: "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3",
  green: "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3",
  blue: "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3",
  yellow: "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3",
  correct:
    "http://freesound.org/people/suntemple/sounds/253177/download/253177__suntemple__retro-accomplished-sfx.wav",
  incorrect:
    "https://freesound.org/people/myfox14/sounds/382310/download/382310__myfox14__game-over-arcade.wav"
};

const ColorMap = {
  red: "#FF93A2",
  green: "#7EFF2D",
  blue: "#7CD5FF",
  yellow: "#FFFCE0"
};

type ColorType = $Keys<typeof ColorMap>;

const ColorValues: ColorType[] = Object.keys(ColorMap);

type State = {
  count: number,
  started: boolean,
  gameOver: boolean,
  win: boolean,
  strictMode: boolean,
  userTurn: boolean,
  sequenceArr: string[],
  userPlay: number,
  replaying: boolean,
  prompt: string
};

const WIN_THRESHOLD: number = 5;

export default class ControlPanel extends React.Component<{}, State> {
  state = {
    count: 0,
    started: false,
    gameOver: false,
    win: false,
    strictMode: false,
    userTurn: false,
    sequenceArr: [],
    userPlay: 0,
    replaying: false,
    prompt: "Press start to begin"
  };

  componentDidUpdate() {
    const { count, userPlay, gameOver, started, userTurn } = this.state;

    // user wins game if 20 steps completed
    if (count === WIN_THRESHOLD) {
      this.onGameWin();
    }

    // check if computer's turn
    if (started && !userTurn && !gameOver) {
      setTimeout(this.computerTurn, 1000);
    }

    // modify count & play success sound if the user has played all colors in sequence & game not over
    if (count === userPlay && !gameOver) {
      const successSound = new window.Audio(SoundMap.correct);
      successSound.play();

      this.setState({
        count: this.state.count + 1,
        userTurn: false
      });
    }
  }

  /********************   GAME CONTROL FUNCTION   ********************/
  toggleStrict = () => {
    this.setState(prevState => ({ strictMode: !prevState.strictMode }));
  };

  toggleStart = () => {
    this.resetBoard(() => {
      const prompt = !this.state.started
        ? "Get 20 in a row to win!"
        : "Press start to begin";
      this.setState(
        {
          count: 1,
          userTurn: false,
          sequenceArr: [],
          prompt: prompt
        },
        () => {
          setTimeout(() => this.setState({ prompt: "" }), 3000);
        }
      );
    });
  };

  /********************   GAME EVENT LOGIC   ********************/

  resetBoard = (cb?: () => void) => {
    this.setState(
      {
        count: 0,
        started: false,
        userTurn: false,
        sequenceArr: [],
        userPlay: 0,
        replaying: false,
        gameOver: false,
        prompt: "Press start to begin"
      },
      cb
    );
  };

  onGameWin = () => {
    this.setState(
      {
        gameOver: true,
        win: true,
        prompt: "You broke the machine!"
      },
      () => {
        // loop success sound
        const gameWinSound: HTMLAudioElement = new window.Audio(SoundMap.correct);
        gameWinSound.loop = true;
        gameWinSound.play();
        setTimeout(() => (gameWinSound.loop = false), 5000);

        // loop flashing lights
        let cnt = 0;
        const id = setInterval(() => {
          if (cnt === 5) {
            clearInterval(id);
            this.resetBoard();
          } else this.flashColorsOnReset();
          cnt++;
        }, 900);
      }
    );
  };

  flashColorsOnReset = (): void => {
    const colors = ["red", "green", "yellow", "blue"];
    for (let i = 0; i < colors.length; i++) {
      let color = colors[i];
      this.simulateClick(document.getElementById(color), color);
    }
  };

  // toggle class to simulate a user click
  simulateClick = (elem: HTMLElement | null, color: ColorType) => {
    if (elem) {
      elem.style.backgroundColor = ColorMap[color];
      setTimeout(() => {
        elem.style.backgroundColor = "";
      }, 600);
    } else {
      console.error('Failed to call simulate click on null element');
    }

  };

  /********************   GAME SIMULATION LOGIC   ********************/

  computerTurn = () => {
    const { count, sequenceArr, replaying } = this.state;

    // only run if a single new color hasn't yet been added to the sequence
    // count will be updated after user moves correctly
    if (count > sequenceArr.length || replaying) {
      const randomColor = () => ColorValues[Math.floor(Math.random() * 4)];
      // if replaying, reuse sequence, else add new color to end
      let sequence = replaying ? sequenceArr : sequenceArr.slice().concat(randomColor());

      // for every color in sequence, play sound & simulate click
      const iterateOverSequence = sequence => {
        sequence.forEach(function(color, i) {
          setTimeout(
            function() {
              let element: HTMLElement | null = document.getElementById(color);
              let audioObj: HTMLAudioElement = new window.Audio(SoundMap[color]);
              this.simulateClick(element, color);
              audioObj.play();
            }.bind(this),
            i * 700
          );
        }, this);
      };

      const endingCallback = () => {
        iterateOverSequence(this.state.sequenceArr);
        this.setState({
          userPlay: 0,
          replaying: false,
          userTurn: true
        });
      };

      this.setState(
        {
          sequenceArr: sequence
        },
        endingCallback
      );
    }
  };

  handleUserMove = (evt: SyntheticEvent<HTMLButtonElement>) => {
    const { started, userTurn, sequenceArr, strictMode } = this.state;
    const t: HTMLButtonElement = evt.currentTarget; // https://flow.org/en/docs/react/events/

    if (started && userTurn) {
      // TODO - change to a non-DOM paradigm
      // play sound on button press
      const color = t.id;
      // $FlowFixMe
      const audioObj: HTMLAudioElement = new window.Audio(SoundMap[color]);
      audioObj.play();

      // if user toggles incorrectly
      if (color !== sequenceArr[this.state.userPlay]) {
        let cnt = 0;
        const id = setInterval(() => {
          if (cnt === 2) {
            clearInterval(id);

            // reset state & start at one
            if (strictMode) {
              this.resetBoard();
              this.setState({
                count: 0,
                started: true,
                prompt: "To prevent restarting, turn strict mode off"
              });
              setTimeout(() => this.setState({ prompt: "" }), 5000);
            }

            // if strictMode off, turn on replaying, set user play to 0, and let computer move
            else {
              this.setState({
                replaying: true,
                userPlay: 0,
                userTurn: false
              });
            }
          } else {
            // flash colors & play failure sound in every case
            this.flashColorsOnReset();
            const failureSound = new window.Audio(SoundMap.incorrect);
            failureSound.play();
          }

          cnt++;
        }, 900);
      }
      // if user plays correct color, play sound & add 1 to userPlay (used to evaluate the next index of sequenceArr)
      else {
        this.setState(prevState => ({ userPlay: prevState.userPlay + 1 }));
      }
    }
  };


  /********************   UI LOGIC   ********************/

  // return the appropriate value to display to the user based on game state
  getDisplay = (): string => {
    const { started, gameOver, win, count } = this.state;
    if (!started) return '--';
    if (gameOver) return win ? 'win' : 'xx';
    return String(count);
  }

  render() {
    const { strictMode, prompt } = this.state;

    return (
      <MainContainer>
        <GameWrapper>
          <ScoreAndButtons>
            <Title>Simon</Title>
            <Count>{this.getDisplay()}</Count>
            <ControlButtons>
              <ControlButtonContainer margin="0 45px 0 0">
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
          {ColorValues.map(t => (
            <ColoredButton key={t} type={t} id={t} onClick={this.handleUserMove} />
          ))}
        </GameWrapper>
        <Prompt>{prompt}</Prompt>
      </MainContainer>
    );
  }
}

// style

const MainContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  position: absolute;
  height: 700px;
  width: 700px;
`;

const GameWrapper = styled.div`
  border: solid 15px #0c001e;
  height: 600px;
  width: 600px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  background-color: #0c001e;
  border-radius: 40%;
  position: relative;
  box-shadow: 2px 2px 5px #666;
`;

const Title = styled.h1`
  font-family: "Gravitas One", "Orbitron", cursive, sans-serif;
  font-size: 50px;
  margin-bottom: 10px;
  margin-top: 20px;
`;

const Count = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0c001e;
  height: 90px;
  width: 150px;
  border-radius: 15%;
  font-size: 78px;
  font-weight: bold;
  color: #d13045;
  font-family: "Digital", "Orbitron", sans-serif;
  border: solid 5px gray;
  padding-bottom: 10px;
  box-shadow: 1px 1px 5px #888888;
`;

const ScoreAndButtons = styled.div`
  position: absolute;
  z-index: 2;
  background-color: #e0d2bc;
  height: 320px;
  width: 320px;
  border-radius: 40%;
  border: solid 30px #0c001e;
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
  margin: ${props => (props.margin ? props.margin : "0 0 0 45px")};
  line-height: 1px;
`;

const ControlButton = styled.div`
  height: 30px;
  width: 30px;
  margin-top: ${props => (props.warning ? 0 : 8)}px;
  border-radius: 50%;
  border: solid 5px black;
  background-color: ${props => (props.warning ? "#EAD746" : "#D13045")};
  box-shadow: 2px 2px 3px #888888;

  :hover {
    background-color: ${props => (props.warning ? "#DDCB42" : "#BA1A3C")};
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
  background-color: ${props => (props.on ? "#D13045" : "#0C001E")};
  margin: 0 0 0 40px;
  border: solid 0.9px black;
  box-shadow: 1px 1px 1px #888888;
`;

const ColoredButton = styled.button`
  height: 260px;
  width: 260px;
  padding: 0;
  overflow: hidden;
  position: relative;
  z-index: 1;
  border: none;
  outline: none;

  ${props => {
    switch (props.type) {
      case "red":
        return css`
          border-top-left-radius: 80%;
          background-color: #d13045;
          :active {
            background-color: #ba1a3c;
            box-shadow: 0 2px #666;
            transform: translateY(1px);
          }
        `;
      case "green":
        return css`
          border-top-right-radius: 80%;
          background-color: #51bc0f;
          :active {
            background-color: #4caf0e;
            box-shadow: 0 2px #666;
            transform: translateY(1px);
          }
        `;
      case "blue":
        return css`
          border-bottom-left-radius: 80%;
          background-color: #31afea;
          :active {
            background-color: #2da2d8;
            box-shadow: 0 2px #666;
            transform: translateY(1px);
          }
        `;
      case "yellow":
        return css`
          border-bottom-right-radius: 80%;
          background-color: #ead746;
          :active {
            background-color: #ddcb42;
            box-shadow: 0 2px #666;
            transform: translateY(1px);
          }
        `;
      default: // do nothing
    }
  }}
`;

const Prompt = styled.p`
  position: relative;
  bottom: 0;
  color: white;
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0;
  padding: 0;
  font-family: "Ubuntu", sans-serif;
`;
