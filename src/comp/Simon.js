//@flow strict
import * as React from "react";
import { lighten } from "polished";
import styled, { css } from "styled-components";

// sounds associated with each of the colors. Used in handleUserMove
const SoundMap: { [string]: string } = {
  red: require('./asset/red.mp3'),
  green: require('./asset/green.mp3'),
  blue: require('./asset/blue.mp3'),
  yellow: require('./asset/yellow.mp3'),
  correct: require('./asset/success.wav'),
  incorrect: require('./asset/failure.wav')
};

const ColorMap = {
  red: "#d13045",
  green: "#51bc0f",
  blue: "#31afea",
  yellow: "#ead746"
};

type ColorType = $Keys<typeof ColorMap>;

// union type of ColorMap keys - used to type IDs of button elements & pass styled compnent props
const ColorTypeKeys: ColorType[] = Object.keys(ColorMap);

// factory to generate a new color map of lighter colors
const ActiveColorMap = (() => {
  const activeColorMap = {};
  ColorTypeKeys.forEach(key => {
    activeColorMap[key] = lighten(0.2, ColorMap[key]);
  });

  return activeColorMap;
})();

type State = {
  count: number,
  started: boolean,
  gameOver: boolean,
  win: boolean,
  strictMode: boolean,
  userTurn: boolean,
  sequenceArr: ColorType[],
  userPlay: number,
  replaying: boolean,
  prompt: string
};

const WIN_THRESHOLD: number = 5;
const TURN_DELAY: number = 1000;

const DEBUG = true;

const log = (...args) => {
  if (DEBUG) {
    console.log(...args);
  }
};

export default class Simon extends React.Component<{}, State> {
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

    log(`ComponentDidMount():
      count: ${count}, 
      userPlay: ${userPlay}, 
      gameOver: ${String(gameOver)},
      started: ${String(started)},
      userTurn: ${String(started)}
    `);

    // user wins game if 20 steps completed
    if (count === WIN_THRESHOLD) {
      this.onGameWin();
    }

    // check if computer's turn
    if (started && !userTurn && !gameOver) {
      console.log(
        `Computer turn pushed to call stack with ${TURN_DELAY}ms delay`
      );
      setTimeout(this.computerTurn, TURN_DELAY);
    }

    // modify count & play success sound if the user has played all colors in sequence & game not over
    if (count === userPlay && !gameOver) {
      const successSound = new window.Audio(SoundMap.correct);
      successSound.play();

      this.setState(prevState => ({
        count: prevState.count + 1,
        userTurn: false
      }));
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
          started: true,
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
        const gameWinSound: HTMLAudioElement = new window.Audio(
          SoundMap.correct
        );
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
    for (let i = 0; i < ColorTypeKeys.length; i++) {
      const color = ColorTypeKeys[i];
      this.simulateClick(document.getElementById(color), color, true);
    }
  };

  simulateClick = (
    elem: HTMLElement | null,
    color: ColorType,
    mute?: boolean | void
  ) => {
    console.warn("Simulate click", elem, color);
    if (elem) {
      // play sound
      if (!mute) {
        let audioObj: HTMLAudioElement = new window.Audio(SoundMap[color]);
        audioObj.play();
      }
      elem.style.backgroundColor = ActiveColorMap[color];
      setTimeout(() => {
        elem.style.backgroundColor = "";
      }, 600);
    } else {
      console.error("Failed to call simulate click on null element");
    }
  };

  /********************   GAME SIMULATION LOGIC   ********************/

  computerTurn = () => {
    const { count, sequenceArr, replaying } = this.state;

    // only run if a single new color hasn't yet been added to the sequence
    // count will be updated after user moves correctly
    if (count > sequenceArr.length || replaying) {
      const randomColor = () => ColorTypeKeys[Math.floor(Math.random() * 4)];
      // if replaying, reuse sequence, else add new color to end
      let sequence = replaying
        ? sequenceArr
        : sequenceArr.slice().concat(randomColor());

      // for every color in sequence, push a simulated click to call stack
      const iterateOverSequence = sequence => {
        sequence.forEach((color, i) => {
          setTimeout(() => {
            let element: HTMLElement | null = document.getElementById(color);
            this.simulateClick(element, color);
          }, i * TURN_DELAY);
        });
      };

      const endingCallback = () => {
        iterateOverSequence(this.state.sequenceArr);
        this.setState({
          userPlay: 0,
          replaying: false,
          userTurn: true
        });
      };

      this.setState({ sequenceArr: sequence }, endingCallback);
    }
  };

  handleUserMove = (evt: SyntheticEvent<HTMLButtonElement>) => {
    const { started, userTurn, sequenceArr, strictMode, userPlay } = this.state;
    const t: HTMLButtonElement = evt.currentTarget; // https://flow.org/en/docs/react/events/

    if (started && userTurn) {
      // TODO - change to a non-DOM paradigm
      // play sound on button press
      const color = t.id;
      // $FlowFixMe
      const audioObj: HTMLAudioElement = new window.Audio(SoundMap[color]);
      audioObj.play();

      // if user toggles incorrectly
      if (color !== sequenceArr[userPlay]) {
        let cnt = 0;
        const id = setInterval(() => {
          if (cnt === 2) {
            clearInterval(id);

            // reset state & start at one
            if (strictMode) {
              this.resetBoard(() => {
                this.setState({
                    count: 0,
                    started: true,
                    prompt: "To prevent restarting, turn strict mode off"
                  }, () => {
                    setTimeout(() => this.setState({ prompt: "" }), 5000);
                  });
              });
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
    if (!started) return "--";
    if (gameOver) return win ? "win" : "xx";
    return String(count);
  };

  render() {
    const { strictMode, prompt, replaying, userTurn } = this.state;

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
          {ColorTypeKeys.map(t => (
            <ColoredButton
              key={t}
              type={t}
              id={t}
              onClick={this.handleUserMove}
              disabled={replaying || !userTurn}
            />
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
          background-color: ${ColorMap[props.type]};
          :active {
            background-color: ${ActiveColorMap[props.type]};
            box-shadow: 0 2px #666;
            transform: translateY(1px);
          }
        `;
      case "green":
        return css`
          border-top-right-radius: 80%;
          background-color: ${ColorMap[props.type]};
          :active {
            background-color: ${ActiveColorMap[props.type]};
            box-shadow: 0 2px #666;
            transform: translateY(1px);
          }
        `;
      case "blue":
        return css`
          border-bottom-left-radius: 80%;
          background-color: ${ColorMap[props.type]};
          :active {
            background-color: ${ActiveColorMap[props.type]};
            box-shadow: 0 2px #666;
            transform: translateY(1px);
          }
        `;
      case "yellow":
        return css`
          border-bottom-right-radius: 80%;
          background-color: ${ColorMap[props.type]};
          :active {
            background-color: ${ActiveColorMap[props.type]};
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
