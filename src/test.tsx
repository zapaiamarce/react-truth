import test from "ava";
import React from "react";
import Truth, { withAppState } from "./";

import render from "react-test-renderer";

const AppContext = React.createContext({});

class StateProvider extends Truth {
  constructor(props) {
    super(props, AppContext);
  }
  async testAction(newValue) {
    console.log(this.state);
    await this.setState({ ...this.state, testAction: "loading" });
    console.log(this.state);
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
    return (
      <StateProvider actionsStatus={true} initialState={{ a: 1 }}>
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
