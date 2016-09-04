import {Store} from "./../src/index.js";
import {expect} from "chai";


describe("Store", () => {
	it("accepts initial actions", () => {
		let initialActions = {};
		let astore = Store(initialActions);
		expect(astore.action()).to.equal(initialActions);
	});

	it("accepts initial middlewares", () => {
		let initialMiddlewares = {};
		let astore = Store(null, initialMiddlewares);
		expect(astore.middlewares()).to.equal(initialMiddlewares);
	});

	it("accepts initial state", () => {
		let initialState = {};
		let astore = Store(null, null, initialState);
		expect(astore()).to.equal(initialState);
	});

	it("is a getter/setter of state.", () => {
		let astore = Store();

		let data = {todos: [1]};
		astore(data);

		expect(astore()).to.eql(data);
	})

	it("has 'action' method.", () => {
		let astore = Store();
		expect(astore.action).to.exist;
	});

	it("has 'middlewares' method.", () => {
		let astore = Store();
		expect(astore.middlewares).to.exist;
	});

	it("has 'dispatch' method.", () => {
		let astore = Store();
		expect(astore.dispatch).to.exist;
	});


	it("has 'attach' method.", () => {
		let astore = Store();
		expect(astore.attach).to.exist;
	});

	describe("action", () => {
		let astore;
		beforeEach(() => {
			astore = Store();
		});

		it("gets/sets actions.", () => {
			let todosAction = {
				add () {}
			};

			astore.action({todos: todosAction});
			expect(astore.action().todos).to.equal(todosAction);
		});

		it("overrides existing actions under a key", () => {
			let actions = {
				todos: {
					add () {}
				},
				x: {
					xAction () {}
				}
			};
			astore.action(actions);

			let newActions = {
				remove () {}
			};
			astore.action({todos: newActions});

			let gotActions = astore.action();
			expect(gotActions.todos).to.eql(newActions);
			expect(gotActions.x).to.eql(actions.x);
		});
	});

	describe("dispatch", () => {
		let astore;

		beforeEach(() => {
			astore = Store();
		});

		it("applies action at specified path to state associated with it.", () => {
			let todosActions = {
				add (todos = [], atodo) {
					return todos.concat(atodo);
				}
			};

			astore.action({todos: todosActions});
			astore.dispatch("todos.add", "Go to mars.")
			expect(astore().todos).to.eql(["Go to mars."]);
		});

		it("applies midlewares", () => {
			let mid1BeforeLog;
			let mid1AfterLog;
			let mid1 = (path, action) => {
				return (previousState, payload) => {
					mid1BeforeLog = [Object.assign({}, previousState), payload, path];

					let newState = action(previousState, payload);

					mid1AfterLog = newState;

					return newState;
				};
			};

			let mid2BeforeLog;
			let mid2AfterLog;
			let mid2 = (path, action) => {
				return (previousState, payload) => {
					mid2BeforeLog = [Object.assign({}, previousState), payload, path];

					let newState = action(previousState, payload);

					mid2AfterLog = newState;

					return newState;
				};
			};

			let todosActions = {
				add (todos = [], atodo) {
					return todos.concat(atodo);
				}
			};

			astore.attach("", mid1);
			astore.attach("", mid2);
			astore.action({todos: todosActions});
			astore.dispatch("todos.add", "Pass this test.");

			expect(mid1BeforeLog).to.eql([{}, "Pass this test.", "todos.add"]);
			expect(mid1AfterLog).to.eql({todos: ["Pass this test."]});

			expect(mid2BeforeLog).to.eql([{}, "Pass this test.", "todos.add"]);
			expect(mid2AfterLog).to.eql({todos: ["Pass this test."]});
		});

		it("throws on invalid action path", () => {
			expect(astore.dispatch.bind(astore, "invalid.path")).to.throw(Error);
		});
	});

	describe("attach", () => {
		let astore;

		beforeEach(() => {
			astore = Store();
		});

		it("attaches middleware", () => {
			let mid1 = astore.attach(()=>{});
			expect(astore.middlewares()).to.eql([mid1]);
		});


		it("returns a middleware which acts on specific path.", () => {
			let middlewareLog;
			let middleware = (path, action) => {
				return (previousState, payload) => {
					middlewareLog = [path, previousState, payload];
					return action(previousState, payload);
				};
			};
			let action = (previousState, payload) => {
				return [previousState, payload];
			};

			let returnVal;
			// "" - global
			let globalMiddleware = astore.attach(middleware);
			expect(globalMiddleware).to.exist;

			returnVal = globalMiddleware("todos", action)("previousState", "payload");
			expect(middlewareLog).to.eql(["todos", "previousState", "payload"]);
			expect(returnVal).to.eql(["previousState", "payload"]);

			// "key"
			let todoMiddleware = astore.attach("todos", middleware);
			expect(todoMiddleware).to.exist;

			returnVal = todoMiddleware("todos.remove", action)("previousState", "payload");
			expect(middlewareLog).to.eql(["todos.remove", "previousState", "payload"]);
			expect(returnVal).to.eql(["previousState", "payload"]);

			middlewareLog = [];
			returnVal = todoMiddleware("todos.add", action)("previousState", "payload");
			expect(middlewareLog).to.eql(["todos.add", "previousState", "payload"]);
			expect(returnVal).to.eql(["previousState", "payload"]);

			// "key.action"
			let todosAddMiddleware = astore.attach("todos.add", middleware);
			expect(todoMiddleware).to.exist;

			returnVal = todosAddMiddleware("todos.add", action)("previousState", "payload");
			expect(middlewareLog).to.eql(["todos.add", "previousState", "payload"]);
			expect(returnVal).to.eql(["previousState", "payload"]);
		});

		it("can be detached from middleware pool.", () => {
			let mid1 = astore.attach(()=>{});
			mid1.detach();
			expect(astore.middlewares()).to.eql([]);
		});
	});


	describe("middlewares", () => {
		it("lists midlewares attached to a store.", () => {
			let astore = Store();
			let mid1 = astore.attach(()=>{});
			expect(astore.middlewares()).to.eql([mid1]);
		});
	});
});
