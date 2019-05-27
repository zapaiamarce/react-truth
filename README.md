![](logo.png)

Minimum state manager, using Context and Hooks.

[![CircleCI](https://circleci.com/gh/zapaiamarce/react-truth.svg?style=shield)](https://circleci.com/gh/zapaiamarce/react-truth) [![npm](https://img.shields.io/npm/v/react-truth/latest.svg?color=brightgreen)](https://www.npmjs.com/package/react-truth)

## Getting started

#### state.tsx

Create the StateProvider and the hook (useAppState)

```jsx
import React from "react";
import ReactTruth, { withAppState } from "react-truth";

interface State {
  public query?: object;
  public someValue?: string;
}

const AppContext = React.createContext({});

export class StateProvider extends ReactTruth<State> {
  constructor(props) {
    super(props, AppContext);
  }
  public async componentDidMount() {
    this.setState({
      ...this.state,
      someValue: "mounted"
    })
  }
  public async testAction(newValue): Promise<State> {
    // you can set the state any time you need
    await this.setState({
      ...this.state,
      testActionIsLoading: true
    });

    // you can end this actions setting a state using
    // this.setState as usual or just return a value

    return {
      ...this.state,
      someValue: newValue
    }
  }
}

export const useAppState = withAppState<StateProvider>(AppContext);

```

#### App.tsx

Wrap the App with the provider

```jsx
import React, {Component} from "react";
import {StateProvider} from "./state";
import App from "App";

class MyApp extends Component {
  public render() {
    const { query } = this.props.location;
    return (
      <StateProvider
        externalState={{ query }}
        initialState={{ someValue: "initial" }}
        persist={true}
        actionsStatus={true}
      >
        <App />
      </StateProvider>;
    );
  }
}

export default MyApp;
```

#### Component.tsx

Hook your components.

```jsx
import { useAppState } from "./state";

export default () => {
  const [state, actions] = useAppState();
  const handleClick = () => actions.testAction(Math.random());

  return (
    <div>
      <button onClick={handleClick}>
        Set a new random value {state.someValue}
      </button>
    </div>
  );
};
```

## Props

### externalState

Let inject external values to the state. This cannot be overriden for any action.

### initialState

Just the initial state.

### persist

Persist the state in localStorage and recover it when the state starts.

### actionsStatus

Generate automatic values in the state for actions status.

```jsx
import { useAppState, FIRED, COMPLETED, FAILED } from "./state";

export default () => {
  const [state, actions] = useAppState();
  const handleClick = () => actions.apiCall(Math.random());

  return (
    <div>
      <button onClick={handleClick}>
        {state.apiCallStatus == FIRED ? (
          <span>The api call is happening</span>
        ) : state.apiCallStatus == FAILED ? (
          <span>Something went wrong</span>
        ) : state.apiCallStatus == COMPLETED ? (
          <span>Everything went ok!</span>
        ) : (
          <span>nothing happens yet</span>
        )}
      </button>
    </div>
  );
};
```

## Redux devtools integration

Too see what is happening in the state, just open your redux devtools panel.
