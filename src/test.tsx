import test from "ava";
import React from "react";
import Truth from "./";
import { create, act } from "react-test-renderer";

class State {
  value?: string = ""
  idState?: string = ""
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
    return {
      ...this.state,
      a: 45,
      value: newValue
    };
  }
}



// test.serial("basic, ", async t => {
//   // console.log(":::::::::::::::::::::::::::::::::::::::: AAA")
//   const appState = new AppState(new State(), {
//     actionsStatus: true,
//     id: "33"
//   });

//   await appState.promise
//   // console.log("promise", appState.promise)
//   // console.log("after promise state", appState.getState())

//   const Comp = () => {
//     const [state, actions] = appState.useState();
//     const { testAction } = actions

//     return (
//       <div>
//         <button onClick={async () => testAction("some value from comp action")}>
//           {JSON.stringify(state)}
//         </button>
//       </div>
//     );
//   };

//   const Dummy = () => (
//     <div>Dummy {Math.random()}</div>
//   )


//   const App = () => {
//     return (
//       <div>
//         <Comp></Comp>
//         <Dummy></Dummy>
//         <Comp></Comp>
//       </div>
//     );
//   };

//   let comp;

//   act(() => {
//     comp = create(<App />);
//   })

//   await comp.root.findAllByType("button")[1].props.onClick();
//   // console.log("after click state", appState.getState())

//   const tree = comp.toJSON();
//   // console.log(tree);
//   // console.log("after print tree");

//   t.truthy(true);
// });


test.serial("persistance, ", async t => {
  const CHECK_VALUE = "persistance value"
  const createState = (id) => new AppState({ a: 2 }, { persist: true, debug: false, id })

  const newAppState = createState("a");
  await newAppState.promise;
  await newAppState.testAction(CHECK_VALUE);

  const anotherAppState = createState("b");
  await anotherAppState.promise;

  const cAppState = createState("c");
  await cAppState.promise;

  console.log(newAppState.getState())
  console.log(anotherAppState.getState())
  console.log(cAppState.getState());

  t.truthy(cAppState.getState().value == CHECK_VALUE);
});