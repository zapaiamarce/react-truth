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
    return {
      ...this.state,
      fromOnLoadAction: true
    }
  }
  async testAction(newValue: string): Promise<State> {
    await this.setState({ ...this.state, value: "test action init" });
    return {
      ...this.state,
      value: newValue
    };
  }
}

const createAppState = () => new AppState(new State(), {
  actionsStatus: true,
  persist: true,
  debug: true
})



test.serial("basic, ", async t => {
  t.plan(1);
  const appState = createAppState();

  const Comp = () => {
    const [state, actions] = appState.useState();
    const { testAction } = actions
    console.log("Comp", state)
    return (
      <div>
        <button onClick={async () => await testAction("some value from comp action")}>{JSON.stringify(state)}</button>
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

  const comp = render.create(<App />);

  return new Promise((resolve, rej) =>
    setTimeout(async () => {
      t.log("*****TIMEOUT")
      await comp.root.findAllByType("button")[1].props.onClick();
      const tree = comp.toJSON();
      t.log(appState.getState());
      t.log(tree);
      t.truthy(true);
      resolve()
    }, 100)
  ) as any
});

// test.serial("persistance, ", async t => {
//   const appState = createAppState();
//   // t.log("get state", appState.getState());
//   t.truthy(true)
//   // t.snapshot(tree);
// });