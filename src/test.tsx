import test from "ava";
import React from "react";
import Truth from "./";
import { create, act } from "react-test-renderer";

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



test.serial("basic, ", async t => {
  const appState = new AppState(new State(), {
    actionsStatus: true,
    // persist: true,
    debug: true,
    id: "33"
  });

  await appState.promise
  console.log("promise")
  console.log(appState.getState())
  const Comp = () => {
    const [state, actions] = appState.useState();
    const { testAction } = actions

    return (
      <div>
        <button onClick={async () => await testAction("some value from comp action")}>
          {JSON.stringify(state)}
        </button>
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

  let comp;

  act(() => {
    comp = create(<App />);
  })

  await comp.root.findAllByType("button")[1].props.onClick();

  const tree = comp.toJSON();
  t.log(tree);

  t.log(appState.getState())

  t.truthy(true);

  console.log("AAA")
});


test.serial("persistance, ", async t => {
  console.log("BBB");
  const appState = new AppState(new State(), { debug: false });
  await appState.promise
  t.truthy(true);
  console.log("get state", appState.getState());
  // t.snapshot(tree);
});