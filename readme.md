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
```shell
$ npm install --save elastic-store
```

## Usage
```javascript
// ES6
import {Store} from "elastic-store";

// node
var Store = require("elastic-store").Store;
```

## Walkthrough
```javascript
import {Store} from "elastic-store";

let todoHandler = {
	list: [],
	add (task) {
		this.list = this.list.concat([task]);
	},
	remove (id) {
		this.list = this.list.filter((task) => task.id !== id);
	}
}

let nodes = {
	todo: todoHandler
};


let store = new Store(nodes);

store.todo.add({id: 1, task: "task 1"});
console.log(store.todo.list);
// =>
// [ { id: 1, task: 'task 1' } ]

store.todo.remove(1);
console.log(store.todo.list);
// =>
// []


let clone = (data) => {
  return JSON.parse(JSON.stringify(data));
}

// A middleware to log changes in state
let logger = (next, store, path) => {
	return (arg) => {
		console.log("path:", path);
		console.log("before:", clone(store));
		let returnedValue = next(arg);
		console.log("after:", clone(store));
	}
}

// Attach logger to 'todo.add' action
// so that it only logs state changes made by this action
store.applyMiddleware(["todo.add", logger]);

store.todo.add({id: 2, task: "Demo middleware."});
// =>
// path: todo.add
// before: { todo: { list: [ [] ] } }
// after: { todo: { list: [ {id: 2, task: "Demo middleware."} ] } }

store.todo.remove(2); // won't log changes made by this action

// Detach logger
store.unapplyMiddleware(["todo.add", logger]);

// Apply logger globally so that state changes made by every actions is logged.
store.applyMiddleware(["", logger]);


store.todo.add({id: 2, task: "Demo middleware."});
// =>
// path: todo.add
// before: { todo: { list: [] } }
// after: { todo: { list: [ {id: 2, task: "Demo middleware."} ] } }

store.todo.remove(2);
// =>
// path: todo.remove
// before: { todo: { list: [ {id: 2, task: "Demo middleware."} ] } }
// after: { todo: { list: [] } }


// Use this state to render UI?
// Create a renderer middleware
let renderer = (next, store, path) => {
	return (arg) => {
		let newState = next(arg);

		aViewFramework.render(document.body, aComponent, newState);

		return newState;
	}
};

// Apply it globally
store.applyMiddleware(["", renderer]);

// Now every changes to state are rendered
// To stop rendering the changes just detach the middleware
store.unapplyMiddleware(["", renderer]);
```

## Actions and state
`elastic-store` generates state tree from action tree.

The action tree below generates the state tree that follows it.

```javascript
// action tree
let actions = {
	todos: {
		allResolved: {
			// default value for this node
			init () { return false; },
			toggle (prevState) { ... }
		},
		items: {
			// default value for this node
			init () { return []; },
			add (notifications, newOne) { ... },
			remove (notifications, id) { ... },
	   }
    },
	notifications: {
		init () {
			return [];
		}
		add (notifications, newOne) { ... },
		dismiss (notifications, newOne) { ... }
   }
};

// state tree
{
	todos: {
		allResolved: false,
		items: []
	},
	notifications: []
}
```

## Create Store
```javascript
import {Store} from "elastic-store";

let store = Store(nodes, middlewares, initialState);
```

## Get state
The store instance is a function. Invoke it to get the state in it.

### Example
```javascript
import {Store} from "elastic-store";

let aStore = Store(actions, middlewares, initialState);
aStore(); // returns the state
```

## Add nodes
Actions can be added in two different ways.

### 1. While creating store
```javascript
import {Store} from "elastic-store";

let nodes = {...};

let store = Store(nodes);
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
Middlewares in `elastic-store` are similar to that of [Express.js](http://expressjs.com/).

### Attach Middleware
Middlewares can be attached in two different ways:

#### 1. While creating store
Middlewares attached while creating a store are globally applied.

```javascript
let aStore = Store(actions, middlewares);
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
let attachedMiddleware = aStore.attach(logger);
```

##### Acts on particular state node
A middleware can be attached to a particular state node,
so that it can act upon any actions within that node.

```javascript
// acts on actions under 'todos' i.e.
// todos.add
// todos.remove
let attachedMiddleware = aStore.attach("todos", logger);
```

##### Acts on particular action
A middleware can be attached to a particular action,
so that it reacts to that single action.

``` javascript
// acts on the action 'todos.add'
let attachedMiddleware = aStore.attach("todos.add", logger);
```

#### Detach Middleware
Middlewares are detachable.

```javascript
attachedMiddlewar.detach();
```

### Custom middleware
A middleware has following signature:

```javascript
/*
* actionPath: Dot separated path to an action in the action tree
* action: The action at the action path, which changes data
* store: The store
*/
let aMiddleware = (actionPath, action, store) => {
	/*
	* state: The entire state tree, returned by store()
	* payload: The payload for the action
	*			e.g. 'somePayload' in 'store.dispatch("action.path", somePayload)'
	*/
	return (state, payload) => {
		//...

		let newState = action(state, payload);

		//...

		return newState;
	}
}
```


## Setting initial values
Each state node can have initial value. Actions can have `init()` method which returns the initial value.

```javascript
let actions = {
	todos: {
		// initial value for this node
		init () { return []; },
		add () { ... },
		remove () { ... }
	}
};
```

## Setting initial state
Initial state of a store can be set while creating one.

```javascript
let initialState = {
	todos: [
		{id: 1, todo: "Do something awesome."}
	]
};

let actions = {
	todos: {
		add () { ... },
		remove () { ... }
	}
};

let aStore = Store(actions, middlewares, initialState);
```
