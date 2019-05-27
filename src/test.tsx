import test from "ava";
import React from "react";
import Truth, { withAppState } from "./";

import render from "react-test-renderer";

const AppContext = React.createContext({});

class State {
  value: string = ""
  a: number = 1
}

class StateProvider extends Truth<State> {
  constructor(props) {
    super(props, AppContext);
  }
  async testAction(newValue) {
    await this.setState({ ...this.state, testAction: "loading" });
    return {
      ...this.state,
      testAction: "completed",
      value: newValue
    };
  }
}

const useAppState = withAppState(AppContext);

const Comp = () => {
  const [state, actions] = useAppState();

  return (
    <div>
      <h2>Component</h2>
      <button onClick={async () => await actions.testAction(123)}>Test Button</button>
      <div>{JSON.stringify(state)}</div>
    </div>
  );
};

class App extends React.Component {
  render() {
    const initialState = new State()
    console.log(initialState)
    return (
      <StateProvider actionsStatus={true} initialState={initialState}>
        <Comp />
      </StateProvider>
    );
  }
}

test("test, ", async t => {
  const comp = render.create(<App />);
  await comp.root.findByType("button").props.onClick();
  const tree = comp.toJSON();
  t.log(tree);
  t.snapshot(tree);
});
