import { defaults, difference, pick, omit } from "lodash";
import React, { useState, useEffect } from "react";
import store from "store";

// redux dev tools
const win: any = typeof window !== "undefined" && window;
const devTools =
  win.__REDUX_DEVTOOLS_EXTENSION__ &&
  win.__REDUX_DEVTOOLS_EXTENSION__.connect();

class Settings {
  persist?: boolean = false;
  id?: string = "";
  persistPick?: string[] = [];
  persistanceKey?: string = "persisted-state";
  debug?: boolean = false;
  actionsStatus?: boolean = false;
}

export const INIT = "INIT";

// Statuses
export const FIRED = "FIRED";
export const COMPLETED = "COMPLETED";
export const FAILED = "FAILED";

interface TruthState {
  _status?: any;
}

class Truth<State = any> {
  protected state: State & TruthState;
  private settings: Settings;
  private hooksListeners: any[] = [];
  private fireHooks() {
    this.debug("fireHooks()", this.hooksListeners.length);
    this.hooksListeners.forEach(listener => {
      listener(this.state);
    });
  }
  public promise: any;
  public async onLoad(): Promise<State> {
    return this.state;
  }

  constructor(initialState: State = {} as any, settings: Settings = {}) {
    this.settings = defaults(settings, new Settings());
    this.debug("constructor()");

    this.wrapMethods();

    /* Persistencia */
    const persitedState = this.getPersistedState();
    const initial = persitedState || initialState;
    this.promise = this.setState(initial).then(this.onLoad.bind(this));
    this.log(INIT, null, null);
  }
  public debug(...params) {
    return (
      this.settings.debug &&
      console.log(`[truth ${this.settings.id}]`, ...params)
    );
  }
  public getId() {
    return this.settings.id;
  }
  public async setState(newState) {
    this.debug("setState()", "\n", JSON.stringify(newState, null, "   "));
    this.setStateRaw(newState);
    this.fireHooks();
    this.persistState();
    return newState;
  }
  public setStateRaw(newState) {
    this.state = {
      ...this.state,
      ...newState
    };
    return this.state;
  }
  public useState(pickKeys?: string[]): [State, this] {
    // TODO finish pick
    const newListener = useState()[1];
    useEffect(() => {
      this.hooksListeners.push(newListener);
      return () => {
        this.hooksListeners = this.hooksListeners.filter(
          listener => listener !== newListener
        );
      };
    }, []);
    const substate = pickKeys ? pick(this.state, pickKeys) : this.state;
    return [substate, this];
  }
  public getState(): State {
    return this.state;
  }
  public stateResolver(state: State): any {
    return state;
  }
  public async getActions() {
    // TODO: finish this
    const dontWrap = ["constructor", "wrapped"];
    const objPrototype = Object.getPrototypeOf(this);
    const methods = Object.getOwnPropertyNames(objPrototype);
    const toBind = difference(methods, dontWrap);
    const justActions = pick(this, toBind);
    Object.setPrototypeOf(justActions, this);
    await justActions.testAction("lalala");
    console.log(justActions);
    return this;
  }
  public withState(Com, stateResolver = this.stateResolver) {
    const stateProps = stateResolver(this.state);
    return props => <Com {...props} {...stateProps} actions={this} />;
  }
  public wrapMethods() {
    /* wrapea todos los metodos (externos)
     * logea en redux y ademas graba la respuesta
     * de la promesa en el state
     */

    const dontWrap = ["constructor"];
    const objPrototype = Object.getPrototypeOf(this);

    if (objPrototype.wrapped) {
      return;
    }

    const methods = Object.getOwnPropertyNames(objPrototype);
    const toBind = difference(methods, dontWrap);

    toBind.forEach(m => {
      this.setActionStatus(m, null);
      const method = objPrototype[m];
      objPrototype[m] = async function(...args) {
        if (!this) {
          throw `you cannot use an action method without the parent reference: Eg.: actions.${m}()`;
        }
        await this.setActionStatus(m, FIRED);
        this.log(m, args, FIRED);
        try {
          const response = await method.call(this, ...args);
          if (response) {
            await this.setState(response);
          }
          this.log(m, args, COMPLETED);
          await this.setActionStatus(m, COMPLETED);
          return response;
        } catch (error) {
          await this.setActionStatus(m, FAILED);
          this.log(m, args, FAILED);
          console.error(error);
          return error;
        }
      };
    });

    objPrototype.wrapped = true;
  }
  public persistState() {
    const { persist, persistPick, persistanceKey } = this.settings;
    if (persist) {
      this.debug("persistState()");
      const all = !persistPick.length;
      const stateToPersist = all ? this.state : pick(this.state, persistPick);
      const pruned = omit(stateToPersist, ["_status"]);
      store.set(persistanceKey, pruned);
    } else {
      this.debug("persist is not enable");
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
    if (actionsStatus) {
      const currentStatus = this.state._status || {};
      return this.setState({
        ...this.state,
        _status: {
          ...currentStatus,
          [methodName]: status
        }
      });
    }
  }
  public log(actionName, args, status) {
    this.debug("log()", actionName, status);
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
