// =============================================================================
// State Machine Service - Finite state machine implementation for UI flows,
// form wizards, animation states, and complex component behavior management
// =============================================================================

// =============================================================================
// State Machine Types
// =============================================================================

export interface StateMachineDefinition<TState extends string = string, TEvent extends string = string> {
  id: string;
  initial: TState;
  states: Record<TState, StateNode<TState, TEvent>>;
  context?: Record<string, unknown>;
}

export interface StateNode<TState extends string, TEvent extends string> {
  on?: Partial<Record<TEvent, TransitionConfig<TState> | TState>>;
  entry?: StateAction[];
  exit?: StateAction[];
  after?: Record<number, TransitionConfig<TState> | TState>;
  meta?: Record<string, unknown>;
  type?: 'normal' | 'final' | 'compound' | 'parallel';
}

export interface TransitionConfig<TState extends string> {
  target: TState;
  guard?: string;
  actions?: StateAction[];
}

export interface StateAction {
  type: string;
  params?: Record<string, unknown>;
}

export interface MachineState<TState extends string = string> {
  value: TState;
  context: Record<string, unknown>;
  history: TState[];
  changed: boolean;
}

// =============================================================================
// State Machine Implementation
// =============================================================================

export class StateMachine<TState extends string = string, TEvent extends string = string> {
  private definition: StateMachineDefinition<TState, TEvent>;
  private currentState: TState;
  private context: Record<string, unknown>;
  private history: TState[] = [];
  private listeners: Set<(state: MachineState<TState>) => void> = new Set();
  private guards: Map<string, (context: Record<string, unknown>) => boolean> = new Map();
  private actionHandlers: Map<string, (context: Record<string, unknown>, params?: Record<string, unknown>) => void> = new Map();
  private timerIds: Map<number, ReturnType<typeof setTimeout>> = new Map();
  private idCounter = 0;

  constructor(definition: StateMachineDefinition<TState, TEvent>) {
    this.definition = definition;
    this.currentState = definition.initial;
    this.context = { ...(definition.context || {}) };

    // Execute entry actions for initial state
    this.executeEntry(this.currentState);
    this.scheduleDelayedTransitions(this.currentState);
  }

  get state(): MachineState<TState> {
    return {
      value: this.currentState,
      context: { ...this.context },
      history: [...this.history],
      changed: true,
    };
  }

  send(event: TEvent, payload?: Record<string, unknown>): MachineState<TState> {
    const stateNode = this.definition.states[this.currentState];
    if (!stateNode || !stateNode.on) {
      return this.state;
    }

    const transition = stateNode.on[event];
    if (!transition) {
      return this.state;
    }

    const config = typeof transition === 'string'
      ? { target: transition as TState }
      : transition as TransitionConfig<TState>;

    // Check guard
    if (config.guard) {
      const guardFn = this.guards.get(config.guard);
      if (guardFn && !guardFn({ ...this.context, ...payload })) {
        return this.state;
      }
    }

    // Perform transition
    return this.transitionTo(config.target, config.actions, payload);
  }

  private transitionTo(
    target: TState,
    actions?: StateAction[],
    payload?: Record<string, unknown>
  ): MachineState<TState> {
    const prevState = this.currentState;

    // Clear delayed transitions
    this.clearTimers();

    // Exit actions
    this.executeExit(prevState);

    // Transition actions
    if (actions) {
      actions.forEach(action => this.executeAction(action));
    }

    // Update state
    this.history.push(prevState);
    this.currentState = target;

    // Merge payload into context
    if (payload) {
      Object.assign(this.context, payload);
    }

    // Entry actions
    this.executeEntry(target);

    // Schedule delayed transitions
    this.scheduleDelayedTransitions(target);

    // Notify
    this.emit();

    return this.state;
  }

  private executeEntry(state: TState): void {
    const stateNode = this.definition.states[state];
    if (stateNode?.entry) {
      stateNode.entry.forEach(action => this.executeAction(action));
    }
  }

  private executeExit(state: TState): void {
    const stateNode = this.definition.states[state];
    if (stateNode?.exit) {
      stateNode.exit.forEach(action => this.executeAction(action));
    }
  }

  private executeAction(action: StateAction): void {
    const handler = this.actionHandlers.get(action.type);
    if (handler) {
      handler(this.context, action.params);
    }
  }

  private scheduleDelayedTransitions(state: TState): void {
    const stateNode = this.definition.states[state];
    if (!stateNode?.after) return;

    for (const [delayStr, transition] of Object.entries(stateNode.after)) {
      const delay = Number(delayStr);
      const config = typeof transition === 'string'
        ? { target: transition as TState }
        : transition as TransitionConfig<TState>;

      const id = ++this.idCounter;
      const timerId = setTimeout(() => {
        if (this.currentState === state) {
          this.transitionTo(config.target, config.actions);
        }
        this.timerIds.delete(id);
      }, delay);

      this.timerIds.set(id, timerId);
    }
  }

  private clearTimers(): void {
    this.timerIds.forEach(id => clearTimeout(id));
    this.timerIds.clear();
  }

  registerGuard(name: string, fn: (context: Record<string, unknown>) => boolean): void {
    this.guards.set(name, fn);
  }

  registerAction(name: string, fn: (context: Record<string, unknown>, params?: Record<string, unknown>) => void): void {
    this.actionHandlers.set(name, fn);
  }

  subscribe(listener: (state: MachineState<TState>) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private emit(): void {
    const state = this.state;
    this.listeners.forEach(listener => listener(state));
  }

  matches(state: TState): boolean {
    return this.currentState === state;
  }

  can(event: TEvent): boolean {
    const stateNode = this.definition.states[this.currentState];
    if (!stateNode?.on) return false;
    return event in stateNode.on;
  }

  getAvailableEvents(): TEvent[] {
    const stateNode = this.definition.states[this.currentState];
    if (!stateNode?.on) return [];
    return Object.keys(stateNode.on) as TEvent[];
  }

  reset(): void {
    this.clearTimers();
    this.currentState = this.definition.initial;
    this.context = { ...(this.definition.context || {}) };
    this.history = [];
    this.executeEntry(this.currentState);
    this.scheduleDelayedTransitions(this.currentState);
    this.emit();
  }

  destroy(): void {
    this.clearTimers();
    this.listeners.clear();
    this.guards.clear();
    this.actionHandlers.clear();
  }
}

// =============================================================================
// Pre-built State Machine Definitions
// =============================================================================

export type FetchState = 'idle' | 'loading' | 'success' | 'error';
export type FetchEvent = 'FETCH' | 'RESOLVE' | 'REJECT' | 'RETRY' | 'RESET';

export const FETCH_MACHINE: StateMachineDefinition<FetchState, FetchEvent> = {
  id: 'fetch',
  initial: 'idle',
  context: { data: null, error: null, retries: 0 },
  states: {
    idle: {
      on: { FETCH: 'loading' },
      meta: { description: 'Waiting for fetch request' },
    },
    loading: {
      on: {
        RESOLVE: { target: 'success', actions: [{ type: 'setData' }] },
        REJECT: { target: 'error', actions: [{ type: 'setError' }] },
      },
      entry: [{ type: 'startFetch' }],
      meta: { description: 'Fetching data' },
    },
    success: {
      on: { FETCH: 'loading', RESET: 'idle' },
      meta: { description: 'Data fetched successfully' },
    },
    error: {
      on: {
        RETRY: { target: 'loading', guard: 'canRetry', actions: [{ type: 'incrementRetry' }] },
        FETCH: 'loading',
        RESET: 'idle',
      },
      meta: { description: 'Fetch failed' },
    },
  },
};

export type ModalState = 'closed' | 'opening' | 'open' | 'closing';
export type ModalEvent = 'OPEN' | 'CLOSE' | 'ANIMATION_END';

export const MODAL_MACHINE: StateMachineDefinition<ModalState, ModalEvent> = {
  id: 'modal',
  initial: 'closed',
  context: {},
  states: {
    closed: {
      on: { OPEN: 'opening' },
    },
    opening: {
      on: { ANIMATION_END: 'open' },
      after: { 300: 'open' },
      entry: [{ type: 'lockScroll' }],
    },
    open: {
      on: { CLOSE: 'closing' },
    },
    closing: {
      on: { ANIMATION_END: 'closed' },
      after: { 250: 'closed' },
      exit: [{ type: 'unlockScroll' }],
    },
  },
};

export type FormWizardState = 'step1' | 'step2' | 'step3' | 'review' | 'submitting' | 'complete' | 'error';
export type FormWizardEvent = 'NEXT' | 'PREV' | 'SUBMIT' | 'SUCCESS' | 'FAIL' | 'RETRY' | 'RESET';

export const FORM_WIZARD_MACHINE: StateMachineDefinition<FormWizardState, FormWizardEvent> = {
  id: 'formWizard',
  initial: 'step1',
  context: { currentStep: 1, totalSteps: 3 },
  states: {
    step1: {
      on: {
        NEXT: { target: 'step2', guard: 'isStep1Valid' },
      },
      entry: [{ type: 'setStep', params: { step: 1 } }],
    },
    step2: {
      on: {
        NEXT: { target: 'step3', guard: 'isStep2Valid' },
        PREV: 'step1',
      },
      entry: [{ type: 'setStep', params: { step: 2 } }],
    },
    step3: {
      on: {
        NEXT: { target: 'review', guard: 'isStep3Valid' },
        PREV: 'step2',
      },
      entry: [{ type: 'setStep', params: { step: 3 } }],
    },
    review: {
      on: {
        SUBMIT: 'submitting',
        PREV: 'step3',
      },
    },
    submitting: {
      on: {
        SUCCESS: 'complete',
        FAIL: 'error',
      },
      entry: [{ type: 'submitForm' }],
    },
    complete: {
      on: { RESET: 'step1' },
      type: 'final',
    },
    error: {
      on: {
        RETRY: 'submitting',
        PREV: 'review',
        RESET: 'step1',
      },
    },
  },
};

export type AuthFlowState = 'unauthenticated' | 'loggingIn' | 'authenticated' | 'mfaRequired' | 'mfaVerifying' | 'loggingOut' | 'sessionExpired';
export type AuthFlowEvent = 'LOGIN' | 'LOGIN_SUCCESS' | 'LOGIN_FAIL' | 'MFA_SUBMIT' | 'MFA_SUCCESS' | 'MFA_FAIL' | 'LOGOUT' | 'SESSION_EXPIRED' | 'REAUTH';

export const AUTH_FLOW_MACHINE: StateMachineDefinition<AuthFlowState, AuthFlowEvent> = {
  id: 'authFlow',
  initial: 'unauthenticated',
  context: { user: null, mfaMethod: null },
  states: {
    unauthenticated: {
      on: { LOGIN: 'loggingIn' },
    },
    loggingIn: {
      on: {
        LOGIN_SUCCESS: 'authenticated',
        LOGIN_FAIL: 'unauthenticated',
        MFA_SUBMIT: 'mfaRequired',
      },
      entry: [{ type: 'performLogin' }],
    },
    authenticated: {
      on: {
        LOGOUT: 'loggingOut',
        SESSION_EXPIRED: 'sessionExpired',
      },
      entry: [{ type: 'onAuthenticated' }],
    },
    mfaRequired: {
      on: { MFA_SUBMIT: 'mfaVerifying' },
    },
    mfaVerifying: {
      on: {
        MFA_SUCCESS: 'authenticated',
        MFA_FAIL: 'mfaRequired',
      },
      entry: [{ type: 'verifyMFA' }],
    },
    loggingOut: {
      on: {},
      after: { 500: 'unauthenticated' },
      entry: [{ type: 'performLogout' }],
    },
    sessionExpired: {
      on: { REAUTH: 'loggingIn' },
    },
  },
};

export type AnimationState = 'idle' | 'enter' | 'active' | 'exit' | 'done';
export type AnimationEvent = 'START' | 'ENTER_COMPLETE' | 'EXIT' | 'EXIT_COMPLETE' | 'RESET';

export const ANIMATION_MACHINE: StateMachineDefinition<AnimationState, AnimationEvent> = {
  id: 'animation',
  initial: 'idle',
  context: {},
  states: {
    idle: {
      on: { START: 'enter' },
    },
    enter: {
      on: { ENTER_COMPLETE: 'active' },
    },
    active: {
      on: { EXIT: 'exit' },
    },
    exit: {
      on: { EXIT_COMPLETE: 'done' },
    },
    done: {
      on: { RESET: 'idle' },
      type: 'final',
    },
  },
};

export type DropdownState = 'closed' | 'opening' | 'open' | 'focusedItem' | 'closing';
export type DropdownEvent = 'TOGGLE' | 'OPEN' | 'CLOSE' | 'FOCUS_ITEM' | 'SELECT' | 'BLUR' | 'ANIMATION_END';

export const DROPDOWN_MACHINE: StateMachineDefinition<DropdownState, DropdownEvent> = {
  id: 'dropdown',
  initial: 'closed',
  context: { focusedIndex: -1, selectedValue: null },
  states: {
    closed: {
      on: {
        TOGGLE: 'opening',
        OPEN: 'opening',
      },
    },
    opening: {
      on: { ANIMATION_END: 'open' },
      after: { 200: 'open' },
    },
    open: {
      on: {
        CLOSE: 'closing',
        TOGGLE: 'closing',
        FOCUS_ITEM: 'focusedItem',
        SELECT: { target: 'closing', actions: [{ type: 'setSelected' }] },
        BLUR: 'closing',
      },
    },
    focusedItem: {
      on: {
        FOCUS_ITEM: 'focusedItem',
        SELECT: { target: 'closing', actions: [{ type: 'setSelected' }] },
        CLOSE: 'closing',
        BLUR: 'closing',
      },
    },
    closing: {
      on: { ANIMATION_END: 'closed' },
      after: { 150: 'closed' },
    },
  },
};

// =============================================================================
// State Machine Visualization (Mermaid Diagram Generator)
// =============================================================================

export function generateStateDiagram<TState extends string, TEvent extends string>(
  definition: StateMachineDefinition<TState, TEvent>
): string {
  let diagram = 'stateDiagram-v2\n';
  diagram += `  [*] --> ${definition.initial}\n`;

  for (const [stateName, stateNode] of Object.entries(definition.states) as [TState, StateNode<TState, TEvent>][]) {
    if (stateNode.type === 'final') {
      diagram += `  ${stateName} --> [*]\n`;
    }

    if (stateNode.on) {
      for (const [event, transition] of Object.entries(stateNode.on) as [TEvent, TransitionConfig<TState> | TState][]) {
        const target = typeof transition === 'string' ? transition : transition.target;
        diagram += `  ${stateName} --> ${target}: ${event}\n`;
      }
    }

    if (stateNode.after) {
      for (const [delay, transition] of Object.entries(stateNode.after)) {
        const target = typeof transition === 'string' ? transition : (transition as TransitionConfig<TState>).target;
        diagram += `  ${stateName} --> ${target}: after ${delay}ms\n`;
      }
    }
  }

  return diagram;
}

// =============================================================================
// Utility
// =============================================================================

export function createMachine<TState extends string, TEvent extends string>(
  definition: StateMachineDefinition<TState, TEvent>
): StateMachine<TState, TEvent> {
  return new StateMachine(definition);
}
