# Introduction
A simple and flexible state container.

## Features
- generates state tree from action tree
- supports late action binding
- supports multi level state tree
- attach/detach middlewares
- middlewares can be attached to particular nodes of state tree
- supports late middleware binding

## Installation


## Walkthrough
```javascript
import {Store} from "elastic-store";

// Create action tree
let actions = {
	todos: {
		// initial value
		init () {
			return [];
		},
		add (todos, newTodo) {
			return todos.concat([newTodo]);
		},
		remove (todos, id) {
			return todos.filter((todo) => { todo.id !== id});
		}
	}
};

// Create store with given actions
let store = Store(actions);

// Add new todo
store.dispatch("todos.add", {id: 1, task: "Demo dispatch"});


// Get todos
console.log(store().todos);
// => {todos: [{id: 1, task: "Demo dispatch"}]}

// Remove a todo
store.dispatch("todos.remove", 1);

// Get todos
console.log(store().todos);
// => {todos: []}


let clone = (data) => {
	return JSON.parse(JSON.stringify(data));
};

// A middleware to log changes in state
let logger = (actionPath, next, store) => {
	return (state, payload) => {
		console.log("Before:", clone(state));

		let newState = next(state, payload);

		console.log("After:", clone(newState);

		return newState;
	}
}


// Attach logger to 'todos.add' action
// so that it only logs state changes made by this action
let attachedLogger = store.attach("todos.add", logger);

store.dispatch("todos.add", {id: 2, task: "Demo middleware."});
// => 
// Before: {todos: []}
// After: {todos: [{id: 2, task: "Demo middleware."}]};

store.dispatch("todos.remove", 2); // won't log changes made by this action

// Detach logger
attachedLogger.detach();

// Apply logger globally so that state changes made by every actions is logged.
let attachedLogger = store.attach(logger);


store.dispatch("todos.add", {id: 2, task: "Demo middleware."});
// => 
// Before: {todos: []}
// After: {todos: [{id: 2, task: "Demo middleware."}]};

store.dispatch("todos.remove", 2);
// => 
// Before: {todos: [{id: 2, task: "Demo middleware."}]};
// After: {todos: []}


// Use this state to render UI?
// Create a renderer middleware
let renderer = (actionPath, next, store) => {
	return (state, payload) => {
		let newState = next(state, payload);

		aViewFramework.render(document.body, aComponent, newState);

		return newState;
	}
};


// Apply it globally
let attachedRenderer = store.attach(renderer);

// Now every changes to state are rendered
// To stop rendering the changes just detach the middleware
attachedRenderer.detach();
```

## Actions and state
`elastic-store` generates state tree from action tree.
...

## Create Store
```javascript
import {Store} from "elastic-store";

let store = Store(actions, middlewares, initialState);
```

## Get state
```
import {Store} from "elastic-store";

let store = Store(actions, middlewares, initialState);
store(); // returns the state
```

## Get state
### Syntax
```javascript
aStore();
```

### Example
```javascript
import {Store} from "elastic-store";

let aStore = Store(actions, middlewares, initialState);
aStore(); // returns the state
```

## Add actions
Actions can be added in two different ways.

### 1. While creating store
```javascript
import {Store} from "elastic-store";

let store = Store(actions);
```

### 2. After creating store
```javascript
astore.actions(actions);
```

### Example
```javascript
let commonActions = {...};

let store = Store(commonActions);


// attach new actions
let newActions = {...};
store.actions(newActions);
```

## Dispatch action
Changes to state are made by dispatching messages to actions.

### Syntax
```javascript
store.dispatch(actionPath, payload);
```

### Example
```javascript
let actions = {
	todos: {
		add (state, payload) {
			return state.concat([payload]);
		}
	}
};

// dispatch
store.dispatch("todos.add", {id: 1, text: "Demo action dispatch."});
```

## Middlewares
Middlewares in `elastic-store` are similar to that of (Express.js)[http://expressjs.com/].

### Attach Middleware
Middlewares can be attached in two different ways:

#### 1. While creating store
Middlewares attached while creating a store are globally applied.

```javascript
let aStore = Store(actions, middleware);
```

#### 2. After creating store
Middlewares attached to an instance acts 3 different ways depending on how they were attached.

##### Acts globally
A middleware can be attached globally,
so that it can act upon any actions.

```javascript
let actions = {
	todos: {
		add (state, todo) {...},
		remove (state, id) {...}
	},
	trash: {
		add (state, todo) {...},
		restore (state, id) {..}
	}
};

let aStore = Store(actions);

let clone = (data) => {
	return JSON.parse(JSON.stringify(data));
};

// A middleware to log changes in state
let logger = (actionPath, next, store) => {
	return (state, payload) => {
		console.log("Before:", clone(state));

		let newState = next(state, payload);

		console.log("After:", clone(newState);

		return newState;
	}
}

// acts globally i.e. on
// todos.add
// todos.remove
// trash.add
// trash.restore
aStore.attach(logger);
```

##### Acts on particular state node
A middleware can be attached to a particular state node,
so that it can act upon any actions within that node.

```javascript
// acts on actions under 'todos' i.e.
// todos.add
// todos.remove
aStore.attach("todos", logger);
```

##### Acts on particular action
A middleware can be attached to a particular action,
so that it reacts to that single action.

``` javascript
// acts on the action 'todos.add'
aStore.attach("todos.add", logger);
```

#### Detach Middleware
Middlewares are detachable.

```javascript
aattachedMiddlewar.detach();
```

### Custom middleware
...


## Setting initial values
...

## Setting initial state
...
