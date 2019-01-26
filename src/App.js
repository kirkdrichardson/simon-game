import React, { Component } from 'react';
import styled from 'styled-components';
import ControlPanel from './comp/ControlPanel.js'

export default class App extends Component {
  render() {
    return (
      <Container>
        <ControlPanel />
      </Container>
    );
  }
}

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-top: 100px;
`;


