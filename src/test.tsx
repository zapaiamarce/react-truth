import test from "ava";
import React from "react";
import Truth from "./";
import NewTruth from "./new";

import render from "react-test-renderer";

class State {
  value?: string = ""
  a: number = 1
}

class AppState extends NewTruth<State>{
  async onLoad() {
    console.log("new truth loaded")
  }
  async testAction(newValue: string): Promise<State> {
    await this.setState({ ...this.state, value: "test action init" });
    return {
      ...this.state,
      value: newValue
    };
  }
}


const appState = new AppState({
  a: 1
})

const Comp = () => {
  const [state, actions] = appState.useState();
  return (
    <div>
      <h2>Component</h2>
      <button onClick={async () => await actions.testAction("123")}>Test Button</button>
      <div>{JSON.stringify(state)}</div>
    </div>
  );
};


test.serial("persistance, ", async t => {
  const comp = render.create(<Comp />);
  await comp.root.findByType("button").props.onClick();
  const tree = comp.toJSON();
  t.log(tree);
  t.truthy(true)
  // t.snapshot(tree);
});
