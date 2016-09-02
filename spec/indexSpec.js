import {State} from "./../src/index.js";
import {expect} from "chai";
import concat from "lodash/concat";


describe("state", () => {
	it("is a getter/setter of state.", () => {
		let astate = State();

		let data = {todos: [1]};
		astate(data);

		expect(astate()).to.eql(data);
	})

	it("has 'actions' method.", () => {
		let astate = State();
		expect(astate.actions).to.exist;
	});

	it("has 'apply' method.", () => {
		let astate = State();
		expect(astate.apply).to.exist;
	});

	it("has 'subscribe' method.", () => {
		let astate = State();
		expect(astate.subscribe).to.exist;
	});

	it("has 'addMiddleware' method.", () => {
		let astate = State();
		expect(astate.addMiddleware).to.exist;
	});


	it("has 'removeMiddleware' method.", () => {
		let astate = State();
		expect(astate.removeMiddleware).to.exist;
	});


	it("has 'getMiddlewares' method.", () => {
		let astate = State();
		expect(astate.getMiddlewares).to.exist;
	});

	it("accepts 'keepHistory'");

	it("allows sub state.");

	describe("actions", () => {
		let astate;
		beforeEach(() => {
			astate = State();
		});

		it("gets/sets actions to state.", () => {
			let todosAction = {
				add () {}
			};

			astate.actions({todos: todosAction});
			expect(astate.actions().todos).to.equal(todosAction);
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
			astate.actions(actions);

			let newActions = {
				remove () {}
			};
			astate.actions({todos: newActions});

			let gotActions = astate.actions();
			expect(gotActions.todos).to.eql(newActions);
			expect(gotActions.x).to.eql(actions.x);
		});
	});

	describe("apply", () => {
		let state;

		beforeEach(() => {
			state = State();
		});

		it("applies action at specified path to state associated with it.", () => {
			let todosActions = {
				add (todos = [], atodo) {
					return concat(todos, atodo);
				}
			};

			state.actions({todos: todosActions});
			state.apply("todos.add", "Go to mars.")
			expect(state().todos).to.eql(["Go to mars."]);
		});

		it("applies midlewares", () => {
			let mid1BeforeLog;
			let mid1AfterLog;
			let mid1 = (path, action) => {
				return (previousState, payload) => {
					mid1BeforeLog = [previousState, payload, path];

					let newState = action(previousState, payload);

					mid1AfterLog = newState;

					return newState;
				};
			};

			let mid2BeforeLog;
			let mid2AfterLog;
			let mid2 = (path, action) => {
				return (previousState, payload) => {
					mid2BeforeLog = [previousState, payload, path];

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

			state.addMiddleware("", mid1);
			state.addMiddleware("", mid2);
			state.actions({todos: todosActions});
			state.apply("todos.add", "Pass this test.");

			expect(mid1BeforeLog).to.eql([undefined, "Pass this test.", "todos.add"]);
			expect(mid1AfterLog).to.eql(["Pass this test."]);

			expect(mid2BeforeLog).to.eql([undefined, "Pass this test.", "todos.add"]);
			expect(mid2AfterLog).to.eql(["Pass this test."]);
		});
	});

	describe("subscribe", () => {});

	describe("getMiddlewares", () => {
		it("returns all the middlewares acting on a state", () => {
			let state = State();
			let mid1 = () => {};

			// extended middleware
			let mid1x = state.addMiddleware("", mid1);
			expect(state.getMiddlewares()).to.eql([mid1x]);
		});
	});

	describe("addMiddleware", () => {
		it("adds a middleware which acts on specific path.", () => {
			let state = State();

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
			let globalMiddleware = state.addMiddleware(middleware);
			expect(globalMiddleware).to.exist;

			returnVal = globalMiddleware("todos", action)("previousState", "payload");
			expect(middlewareLog).to.eql(["todos", "previousState", "payload"]);
			expect(returnVal).to.eql(["previousState", "payload"]);

			// "key"
			let todoMiddleware = state.addMiddleware("todos", middleware);
			expect(todoMiddleware).to.exist;

			returnVal = todoMiddleware("todos.remove", action)("previousState", "payload");
			expect(middlewareLog).to.eql(["todos.remove", "previousState", "payload"]);
			expect(returnVal).to.eql(["previousState", "payload"]);

			middlewareLog = [];
			returnVal = todoMiddleware("todos.add", action)("previousState", "payload");
			expect(middlewareLog).to.eql(["todos.add", "previousState", "payload"]);
			expect(returnVal).to.eql(["previousState", "payload"]);

			// "key.action"
			let todosAddMiddleware = state.addMiddleware("todos.add", middleware);
			expect(todoMiddleware).to.exist;

			returnVal = todosAddMiddleware("todos.add", action)("previousState", "payload");
			expect(middlewareLog).to.eql(["todos.add", "previousState", "payload"]);
			expect(returnVal).to.eql(["previousState", "payload"]);
		});
	});

	describe("removeMiddleware", () => {
		it("removes a middleware", () => {
			let state = State();
			let mid1 = () => {};
			let mid2 = () => {};
			let mid3 = () => {};

			let mid1x = state.addMiddleware("", mid1);
			let mid2x = state.addMiddleware("", mid2);
			let mid3x = state.addMiddleware("", mid3);

			state.removeMiddleware(mid1x);
			expect(state.getMiddlewares()).to.eql([mid2x, mid3x]);

			state.removeMiddleware(mid2x);
			state.removeMiddleware(mid3x);
			expect(state.getMiddlewares()).to.eql([]);
		});
	});
});
