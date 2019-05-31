<p align="center">
  <img width="200" src="logo.png" />
</p>

Minimum state manager, using Hooks.

[![CircleCI](https://circleci.com/gh/zapaiamarce/react-truth.svg?style=shield)](https://circleci.com/gh/zapaiamarce/react-truth) [![npm](https://img.shields.io/npm/v/react-truth/latest.svg?color=brightgreen)](https://www.npmjs.com/package/react-truth)

## Getting started

#### state.tsx

Create a truth instance

```jsx
import ReactTruth from "react-truth";

export class State {
  query: object;
  someValue: string = "initial from state class";
  anotherValue?: string;
}

export class AppState extends ReactTruth<State> {
  public async onLoad() {
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

const initialState = {};
const settings = {};

export const state = new AppState(initialState, settings);
```

#### Component.tsx

Hook your components.

```jsx
import { state } from "./state";

export default () => {
  const [state, actions] = state.useState();
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

## Settings

### persist

Persist the state in localStorage and recover it when the state starts.

### actionsStatus

Generate automatic values in the state for actions status: {actionName}Status

```jsx
import { state } from "./state";

export default () => {
  const [state, actions] = state.useState();
  const handleClick = () => actions.apiCall(Math.random());

  return (
    <div>
      <button onClick={handleClick}>
        {state.apiCallStatus == state.FIRED ? (
          <span>The api call is happening</span>
        ) : state.apiCallStatus == state.FAILED ? (
          <span>Something went wrong</span>
        ) : state.apiCallStatus == state.COMPLETED ? (
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
