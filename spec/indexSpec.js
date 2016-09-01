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

	it("has 'middlewares' method.", () => {
		let astate = State();
		expect(astate.middlewares).to.exist;
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
	});

	describe("subscribe", () => {});

	describe("middlewares", () => {
	});
});
