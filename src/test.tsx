import test from "ava";
import React from "react";
import Truth, { INIT, FIRED, COMPLETED } from "./";
import { create } from "react-test-renderer";
import { renderHook, act } from "@testing-library/react-hooks";

class State {
  value?: string = "";
  idState?: string = "";
  a: number = 1;
  fromOnLoadAction?: boolean;
  _status?: any;
}

class AppState extends Truth<State> {
  async onLoad(): Promise<State> {
    return {
      ...this.state,
      fromOnLoadAction: true
    };
  }
  async testAction(newValue: string): Promise<State> {
    return {
      ...this.state,
      a: 3,
      value: newValue
    };
  }
}

test.serial("persistance, ", async t => {
  const CHECK_VALUE = Math.random().toString();
  const createState = id => new AppState({ a: 2 }, { persist: true, id });

  const newAppState = createState("a");
  await newAppState.promise;
  await newAppState.testAction(CHECK_VALUE);

  const anotherAppState = createState("b");
  await anotherAppState.promise;

  // t.log(newAppState.getId());
  // t.log(anotherAppState.getId());
  // t.log(CHECK_VALUE);

  t.truthy(anotherAppState.getState().value == CHECK_VALUE);
});

test.serial("pick", async t => {
  const appState = new AppState({ a: 1 }, { actionsStatus: true });
  await appState.promise;

  const { result } = renderHook(() => appState.useState(["a"])[0]);
  // const { result: res } = renderHook(() => appState.useState()[0]);

  t.is(result.current.a, 1);

  await appState.testAction("some value from comp action");

  t.is(result.current.a, 3);

  const pickedState = Object.keys(result.current);

  t.is(pickedState.length, 1);
  t.is(pickedState[0], "a");
  t.truthy(true);
});

test.serial("hoc", async t => {
  const appState = new AppState({ a: 1, value: "some value" });
  await appState.promise;

  const BaseComp = props => (
    <div>
      <button onClick={props.testAction} />
      {JSON.stringify(props)}
    </div>
  );
  const NewComp = appState.withState(BaseComp, state => ({
    a: state.a
  }));
  const renderer = create(<NewComp />);
  t.snapshot(renderer.toJSON());
});

test.serial("status", async t => {
  t.plan(2)
  const appState = new AppState(
    { a: 1 },
    { actionsStatus: true, persist: true }
  );

  await appState.promise;

  const promise = appState.testAction("AAAAAAAAAAA");
  t.truthy(appState.getState()._status.testAction == FIRED);

  return promise.then(() => {
    t.truthy(appState.getState()._status.testAction == COMPLETED);
  });
});
