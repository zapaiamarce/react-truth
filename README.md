![Logo](https://res.cloudinary.com/iunigo/image/upload/c_scale,q_100,w_200/v1559334903/react-truth/React_Truth_color.png)

A tiny state manager.

[![CircleCI](https://circleci.com/gh/zapaiamarce/react-truth.svg?style=shield)](https://circleci.com/gh/zapaiamarce/react-truth) [![npm](https://img.shields.io/npm/v/react-truth/latest.svg?color=brightgreen)](https://www.npmjs.com/package/react-truth)

### Step 1: Create a truth instance

```jsx
// state.tsx
import ReactTruth from "react-truth";

export class State {
  someValue: string = "initial from state class";
  anotherValue?: string;
}

export class Truth extends ReactTruth<State> {
  public async onLoad(): Promise<State> {
    return {
      ...this.state,
      someValue: "mounted"
    }
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

const initialState = new State();
const settings = {
  persist: true,
  actionsStatus: true
};

export const myTruth = new Truth(initialState, settings);

export default myTruth;
```

### Step 2: Hook your components.

```jsx
// Component.tsx
import appState from "./state";

export default () => {
  const [state, actions] = appState.useState();
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

#### persist:boolean = false

Persist the state in localStorage and recover it when the state starts.

#### persistanceKey:string = "persisted-state"

Used to name the localStorage item. default.

#### persistPick:string[] = null

Keys of persisted state members

#### actionsStatus:boolean = false

Generate automatic values in the state for actions status: {actionName}Status

```jsx
import { useState } from "./state";
import { FIRED, FAILED, COMPLETED } from "react-truth";

export default () => {
  const [state, actions] = useState();
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

#### debug:boolean = false

Log react-truth internals to the console

## Truth Class

Any Truth instance has this methods to use or override

#### onLoad(): Promise<State>

Is executed right when the Truth instance is created

#### setState(newState): Promise<State>

Set the state with a new one. It´s async.

#### setStateRaw(newState): Promise<State>

A sync state setter.

#### useState(pick:string[]): [State, actions]

React hook to plug a component to the state. A list of picked members of the state can be passed as unique param.

#### withState(Component: ReactComponent, stateResolver: (state)=> newState): ReactComponent
HOC to inject the state as props and the actions as **action** prop. 
A subset of the state can bi picked using a stateResolver



## Redux devtools integration

Too see what is happening in the state, just open your redux devtools panel.
