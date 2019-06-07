import test from "ava";
import React from "react";
import Truth from "./";

import render from "react-test-renderer";

class State {
  value?: string = ""
  a: number = 1
  fromOnLoadAction?: boolean
}

class AppState extends Truth<State>{
  async onLoad(): Promise<State> {
    return ({
      ...this.state,
      fromOnLoadAction: true
    })
  }
  async testAction(newValue: string): Promise<State> {
    await this.setState({ ...this.state, value: "test action init" });
    return {
      ...this.state,
      value: newValue
    };
  }
}

const appState = new AppState(new State(), {
  actionsStatus: true
})

const Comp = () => {
  const [state, actions] = appState.useState();
  console.log("Comp", state)
  return (
    <div>
      <h2>Component</h2>
      <button onClick={async () => await actions.testAction("123")}>Test Button</button>
      <div>{JSON.stringify(state)}</div>
    </div>
  );
};

const Dummy = () => (
  <div>Dummy {Math.random()}</div>
)


const App = () => {
  return (
    <div>
      <Comp></Comp>
      <Dummy></Dummy>
      <Comp></Comp>
    </div>
  );
};


test.serial("basic, ", async t => {
  const comp = render.create(<App />);
  await comp.root.findAllByType("button")[1].props.onClick();
  const tree = comp.toJSON();
  t.log(tree);
  t.truthy(true);
});


test.serial("persistance, ", async t => {
  t.log("get state", appState.getState());
  t.truthy(true)
  // t.snapshot(tree);
});