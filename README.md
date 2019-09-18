# Truth

A tiny state manager.

[![CircleCI](https://circleci.com/gh/zapaiamarce/react-truth.svg?style=shield)](https://circleci.com/gh/zapaiamarce/react-truth) [![npm](https://img.shields.io/npm/v/react-truth/latest.svg?color=brightgreen)](https://www.npmjs.com/package/react-truth)

## Setup

`yarn add react-truth`

## Basic use

```jsx
// state.js
import ReactTruth from "react-truth";

export class MyTruth extends ReactTruth {
  public async fetchData(){
    const res = await fetch("https://myapi.com/data");
    const data = await res.json();
    return {
      ...this.state,
      data
    }
  }
  // more actions ...
}

export default new MyTruth();
```

```jsx
// Component.js
import appState from "./state";

export default () => {
  const [state, actions] = appState.useState();

  return (
    <>
      <button onClick={actions.fetchUser}>Fetch Data</button>  
      <div>Data: {JSON.stringify(state.data)}</div> 
    </>
  );
};
```


## Advanced (Typescript)

```jsx
// state.tsx
import ReactTruth from "react-truth";

export class State {
  someValue: string = "initial from state class";
  anotherValue?: string;
}

export class MyTruth extends ReactTruth<State> {
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

export const myTruth = new MyTruth(initialState, settings);

export default myTruth;
```

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

Generate automatic values in the state for actions status: state._status[actionName]
A **_status** member need to be declared in the state.

```jsx
// ...
export class State {
  data: object;

  // add this member to your State
  _status: any;
}

export class MyTruth extends ReactTruth<State> {
  public async apiCall(): Promise<State> {
    const res = await fetch("http://api.truth.com/v1/");
    const data = await res.json();
    return {
      ...this.state,
      data
    };
  }
}
// ...
```

```jsx
import state from "./state";
import { FIRED, FAILED, COMPLETED } from "react-truth";

export default () => {
  const [state, actions] = state.useState();
  const handleClick = () => actions.apiCall(Math.random());

  return (
    <div>
      <button onClick={handleClick}>
        {state._status.apiCall == FIRED ? (
          <span>The api call is happening</span>
        ) : state._status.apiCall == FAILED ? (
          <span>Something went wrong</span>
        ) : state._status.apiCall == COMPLETED ? (
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

#### setStateRaw(newState): State

A sync state setter.

#### useState(pick:string[]): [State, actions]

React hook to plug a component to the state. A list of picked members of the state can be passed as unique param.

#### withState(Component: ReactComponent, stateResolver: (state)=> newState): ReactComponent
HOC to inject the state as props and the actions as **action** prop. 
A subset of the state can bi picked using a stateResolver



## Redux devtools integration

Check what is happening in the state in the **[redux devtools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=es)**.
