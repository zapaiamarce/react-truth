import { defaults, difference, pick } from "lodash";
import { useState, useEffect } from "react";
import store from "store";

// redux dev tools
const win: any = typeof window !== "undefined" && window;
const devTools =
  win.__REDUX_DEVTOOLS_EXTENSION__ &&
  win.__REDUX_DEVTOOLS_EXTENSION__.connect();

class Settings {
  persist?: boolean = false;
  persistPick?: string[] = [];
  persistanceKey?: string = "persisted-state";
  debug?: boolean = false;
  actionsStatus?: boolean = false;
}

export const INIT = "INIT";
export const FIRED = "FIRED";
export const COMPLETED = "COMPLETED";
export const FAILED = "FAILED";

class Truth<State = any> {
  protected state: State;
  private settings: Settings;
  private hooksListeners: any[] = [];
  private fireHooks() {
    console.log("fireHooks()");
    if (this.hooksListeners.length) {
      this.debug("fireHooks()", this.hooksListeners.length);
    }
    this.hooksListeners.forEach(listener => {
      listener(this.state);
    });
  }
  public onLoad() {}
  constructor(initialState: State = {} as any, settings: Settings = {}) {
    this.settings = defaults(settings, new Settings());

    this.wrapMethods();

    /* Persistencia */
    const persitedState = this.getPersistedState();
    const initial = persitedState || initialState;
    this.debug(
      ":: constructor()",
      persitedState ? "persisted" : "initialState"
    );
    this.setState(initial);

    this.log(INIT, null, null);
    this.onLoad();
  }
  public debug(...params) {
    return this.settings.debug && console.log("[truth]", ...params);
  }
  public async setState(newState) {
    this.debug("setState()", "\n", JSON.stringify(newState, null, "   "));
    this.fireHooks();
    this.persistState();
    return this.setStateRaw(newState);
  }
  public setStateRaw(newState) {
    this.state = {
      ...this.state,
      ...newState
    };
    return this.state;
  }
  public useState(pick?: string[]): [State, this] {
    const newListener = useState()[1];
    useEffect(() => {
      this.hooksListeners.push(newListener);
      return () => {
        this.hooksListeners = this.hooksListeners.filter(
          listener => listener !== newListener
        );
      };
    }, []);
    return [this.state, this];
  }
  public getState(): State {
    return this.state;
  }
  public withState(Com) {
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
      this.setActionStatus(m, null);
      objPrototype[m] = async (...args) => {
        await this.setActionStatus(m, FIRED);
        this.log(m, args, FIRED);
        try {
          const response = await method.apply(this, [...args]);
          if (response) {
            await this.setState(response);
            await this.setActionStatus(m, COMPLETED);
            this.log(m, args, COMPLETED);
          }
        } catch (error) {
          await this.setActionStatus(m, FAILED);
          this.log(m, args, FAILED);
          console.error(error);
        }
      };
      // bind all methods just in case
      objPrototype[m] = objPrototype[m].bind(this);
    });
  }
  public persistState() {
    const { persist, persistPick, persistanceKey } = this.settings;
    if (persist) {
      const all = !persistPick.length;
      const stateToPersist = all ? this.state : pick(this.state, persistPick);
      this.debug("persistState()");
      store.set(persistanceKey, stateToPersist);
    }
  }
  public getPersistedState() {
    const { persist, persistPick, persistanceKey } = this.settings;
    if (persist) {
      const all = !persistPick.length;
      const persistedRaw = store.get(persistanceKey);
      return all ? persistedRaw : pick(persistedRaw, persistPick);
    } else {
      this.debug(
        "you are trying to get a persisted state but 'persist' setting is off"
      );
      return null;
    }
  }
  public flushPersisted() {
    const { persistanceKey } = this.settings;
    store.remove(persistanceKey);
  }
  public async setActionStatus(methodName, status) {
    const { actionsStatus } = this.settings;
    const statusMethodName = methodName + "Status";
    if (actionsStatus) {
      return this.setStateRaw({
        ...this.state,
        [statusMethodName]: status
      });
    }
  }
  public log(actionName, args, status) {
    this.debug("log:status", actionName, status);
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

export default Truth;
