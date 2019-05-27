// tslint:disable:no-console
import { difference, pick } from "lodash";
import React, { PureComponent, useContext } from "react";
import store from "store";

interface ProviderProps {
  initialState?: object;
  externalState?: object;
  persistanceKey: string;
  persist: boolean;
  actionsStatus: boolean;
}

const INIT = "INIT";
export const FIRED = "FIRED";
export const COMPLETED = "COMPLETED";
export const FAILED = "FAILED";

/* se omiten estos metodos de la instancia al wrappear
 componentDidMount no está en esta lista porque
 queremos que la respuesta pueda impactar en el state
 */

const dontWrap = [
  "constructor",
  "render",
  "componentWillMount",
  "componentWillReceiveProps",
  "shouldComponentUpdate",
  "componentWillUpdate",
  "componentDidUpdate",
  "componentWillUnmount"
];

const win = typeof window !== "undefined" && (window as any);
const devTools =
  win.__REDUX_DEVTOOLS_EXTENSION__ &&
  win.__REDUX_DEVTOOLS_EXTENSION__.connect();

class ActionProvider<S = any> extends PureComponent<ProviderProps, S> {
  public static defaultProps = {
    persist: false,
    persistanceKey: "persisted-state",
    initialState: {},
    actionsStatus: false
  };
  public static getDerivedStateFromProps(props) {
    /* el external state siempre pisa el state interno
     * ejemplo: url, queryParams
     * (la verdad está afuera)
     */
    const { externalState } = props;
    return externalState || null;
  }
  public Context;
  constructor(props: ProviderProps, Context) {
    super(props);
    const { initialState } = props;

    /* Persistencia */
    const { persist, persistanceKey } = props;
    const persitedState = store.get(persistanceKey) || {};
    this.state = persist ? { ...persitedState, ...initialState } : initialState;
    this.Context = Context;
    this.wrapMethods();
    this.log(INIT, null, null);
  }
  public persistState() {
    const { persist, persistanceKey } = this.props;
    if (persist) {
      store.set(persistanceKey, this.state);
    }
  }
  public componentDidUpdate() {
    const { externalState } = this.props;
    this.log("componentDidUpdate", { externalState }, COMPLETED);
    this.persistState();
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
  public setState(state) {
    return new Promise(resolve => {
      super.setState(state, resolve);
    });
  }
  public async setActionStatus(methodName, status) {
    const { actionsStatus } = this.props;
    const statusMethodName = methodName + "Status";
    if (actionsStatus) {
      return this.setState(prevState => ({
        ...prevState,
        [statusMethodName]: status
      }));
    }
  }
  public wrapMethods() {
    /* wrapea todos los metodos (externos)
     * logea en redux y ademas graba la respuesta
     * de la promesa en el state
     */
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
          await this.setState(() => response);
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
  public render() {
    const { Provider } = this.Context;
    return (
      <Provider value={[this.state, this]}>{this.props.children}</Provider>
    );
  }
}

export function withAppState<ActionType = any>(Context: React.Context<any>) {
  return (keys?: string[]): [any, ActionType] => {
    const [state, actions] = useContext(Context) as any;
    return keys ? [pick(state, keys), actions] : [state, actions];
  };
}

export default ActionProvider;
