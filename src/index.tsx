import { defaults, difference } from "lodash"
import { useState } from "react"
import store from "store";

const INIT = "INIT";
export const FIRED = "FIRED";
export const COMPLETED = "COMPLETED";
export const FAILED = "FAILED";

// redux dev tools
const win = typeof window !== "undefined" && (window as any);
const devTools =
  win.__REDUX_DEVTOOLS_EXTENSION__ &&
  win.__REDUX_DEVTOOLS_EXTENSION__.connect();

class Settings {
  persist?: boolean = false
  persistanceKey?: string = "persisted-state"
  actionsStatus?: boolean = false
}


class Truth <State = any> {
  protected state: State
  private settings: any
  private hookSetState(any){}
  public onLoad() {}
  constructor(initialState: State = {} as any, settings: Settings = {}) {
    this.settings = defaults(settings, new Settings())

    /* Persistencia */
    const { persist, persistanceKey } = this.settings;
    const persitedState = store.get(persistanceKey);
    this.state = persist && persitedState ? persitedState : initialState;

    this.wrapMethods();
    this.log(INIT, null, null);
    this.onLoad()
  }
  public async setState(newState) {
    this.state = {
      ...this.state,
      ...newState
    }
    this.hookSetState(this.state)
    return this.state
  }
  public useState(): [State, this] {
    this.hookSetState = useState()[1]
    console.log("this.state", this.state)
    return [this.state, this];
  }
  public getState(): State {
    return this.state;
  }
  public wrapMethods() {
    /* wrapea todos los metodos (externos)
     * logea en redux y ademas graba la respuesta
     * de la promesa en el state
     */

    const dontWrap = ["constructor"];
    const objPrototype = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(objPrototype);
    const toBind = difference(methods, dontWrap);

    toBind.forEach(m => {
      const method = objPrototype[m];

      objPrototype[m] = async (...args) => {
        await this.setActionStatus(m, FIRED);
        this.log(m, args, FIRED);
        try {
          const response = await method.apply(this, [...args]);
          await this.setState(response);
          await this.setActionStatus(m, COMPLETED);
          this.log(m, args, COMPLETED);
        } catch (error) {
          await this.setActionStatus(m, FAILED);
          this.log(m, args, FAILED);
          console.error(error);
        }
      };
    });
  }
  public async setActionState(actionName: string, stateName: string) {
    return this.setState({
      [`${actionName}InProgress`]: stateName === FIRED,
      [`${actionName}Completed`]: stateName === COMPLETED,
      [`${actionName}Failed`]: stateName === FAILED
    });
  }
  public flushPersisted() {
    const { persistanceKey } = this.settings;
    store.remove(persistanceKey);
  }
  public async setActionStatus(methodName, status) {
    const { actionsStatus } = this.settings;
    const statusMethodName = methodName + "Status";
    if (actionsStatus) {
      return this.setState({
        ...this.state,
        [statusMethodName]: status
      });
    }
  }
  public log(actionName, args, status) {
    if (actionName === INIT && devTools) {
      devTools.init(this.state);
    } else if (devTools && actionName && status) {
      devTools.send(
        {
          payload: args,
          type: `${actionName}:${status}`
        },
        this.state
      );
    }
  }
}
export default Truth