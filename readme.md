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

// Create store with given actions and
// apply the middleware to the root of state tree
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


// Create a logger
let logger = (actionPath, next, store) => {
	return (state, payload) => {
		console.log("Before:", Object.assign({}, state));

		let newState = next(state, payload);

		console.log("After:", Object.assign({}, newState));

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

## Create Store
```javascript
import {Store} from "elastic-store";

let store = Store(actions, middlewares, initialState);
```

## Add actions
### Syntax
```javascript`
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
### Attach Middleware

Middlewares can be attached in two different ways:

#### 1. while creating store
```javascript
let aStore = Store(actions, middleware);
```

#### 2. after creating store
```javascript
let attachedMiddleware = aStore.attach(middleware);
```

### Detach Middleware
```javascript
aattachedMiddlewar.detach();
```

### Custom middleware
...


## Setting initial values
...

## Setting initial state
...
