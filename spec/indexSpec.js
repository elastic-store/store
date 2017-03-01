import {
	Store
} from "./../src/index.js";
import {
	expect
} from "chai";

let clone = (data) => {
	return JSON.parse(JSON.stringify(data));
}

let logger = (next, store, path) => {
	return (arg) => {
		console.log("path:", path);
		console.log("before:", clone(store));
		let returnedValue = next(arg);
		console.log("after:", clone(store));
	}
}

describe("Store", () => {
	let store, nodes, mid1, mid1Log, mid2, mid2Log;

	beforeEach(() => {
		nodes = {
			user: {
				list: [],
				add(user) {
					this.list = this.list.concat(user);
				}
			},
			todo: {
				tasks: [],
				allResolved: false,
				add(task) {
					this.tasks = this.tasks.concat(task);
				}
			}
		};

		mid1 = (next, store, path) => {
			return (arg) => {
				mid1Log = [next, store, path, arg];
				next(arg);
			}
		}

		mid2 = (next, store, path) => {
			return (arg) => {
				mid2Log = [next, store, path, arg];
				next(arg);
			}
		}

		store = new Store(nodes, [mid1, mid2]);
	});

	it("handlers are accessibale", () => {
		store.user.add("user 1");
		store.todo.add("task 1");

		expect(store.user.list.length).to.equal(1);
		expect(store.todo.tasks.length).to.equal(1);
	});

	it("handlers are wrapped with middlewares", () => {
		store.user.add("user 1");

		expect(mid1Log.length).to.equal(4);
		expect(typeof mid1Log[0]).to.equal("function")
		expect(mid1Log[1]).to.equal(store);
		expect(mid1Log[2]).to.equal("user.add");
		expect(mid1Log[3]).to.equal("user 1");

		expect(mid2Log.length).to.equal(4);
		expect(typeof mid1Log[0]).to.equal("function")
		expect(mid2Log[1]).to.equal(store);
		expect(mid2Log[2]).to.equal("user.add");
		expect(mid2Log[3]).to.equal("user 1");
	});

	it("works with class based handlers");

	it("middlewares are applied at particular path", () => {
		let store = new Store(nodes, [mid1, ["user.add", mid2]]);

		store.user.add("user 1");
		expect(mid1Log.length).to.equal(4);
		expect(mid2Log.length).to.equal(4);

		mid1Log = null;
		mid2Log = null;
		store.todo.add("task 1");
		expect(mid1Log.length).to.equal(4);
		expect(mid2Log).to.equal(null);
	});

	it("applies initial state", () => {
		let nodes = {
			todo: {
				list: [],
				add(task) {
					this.list = this.list.concat([task]);
				}
			}
		};
		let initialState = {
			todo: {
				list: ["task 1"],
				allResolved: false
			}
		}

		let store = new Store(nodes, [], initialState);

		expect(store.todo.list).to.eql(["task 1"]);
		expect(store.todo.allResolved).to.equal(false);
		expect(typeof store.todo.add).to.equal("function");
	});

	describe("addNode", () => {
		let notification;

		beforeEach(() => {
			notification = store.addNode("notification", {
				list: [],
				add(notification) {
					this.list = this.list.concat([notification]);
				}
			});
		});

		it("returns the attached node", () => {
			expect(notification).to.exit;
		});

		it("addes node to store", () => {
			notification.add("notification 1");

			expect(notification.list).to.eql(["notification 1"]);
		});

		it("wraps handlers with middlewares", () => {
			notification.add("notification 1");

			expect(mid1Log[3]).to.equal("notification 1");
		});
	});

	describe("addNodes", () => {
		it("addes all the given nodes to store", () => {
			let nodes = {
				notification: {},
				feed: {}
			};

			store.addNodes(nodes);

			expect(store.notification).to.exist;
			expect(store.feed).to.exist;
		});
	});

	describe("removeNode", () => {
		beforeEach(() => {
			store.applyMiddleware(["todo", mid1]);
			store.removeNode("todo");
		});

		it("removes the node from store", () => {
			expect(store.todo).to.not.exist;
		});

		it("clears middlewares applied to the node", () => {
			expect(store.getMiddlewares()).to.eql([
				["", mid1],
				["", mid2]
			]);
		});
	});

	describe("removeNodes", () => {
		beforeEach(() => {
			let nodes = {
				notification: {},
				feed: {}
			};

			store.addNodes(nodes);

			expect(store.notification).to.exist;
			expect(store.feed).to.exist;
		});

		it("removes specified nodes", () => {
			store.removeNodes(["notification", "feed"]);

			expect(store.notification).to.not.exist;
			expect(store.feed).to.not.exist;
			expect(store.user).to.exist;
		});
	});

	describe("getMiddlewares", () => {
		it("returns all the middlewares applied at different nodes", () => {
			expect(store.getMiddlewares().length).to.equal(2);
		});
	});

	describe("applyMiddleware", () => {
		it("applies a middleware", () => {
			store.applyMiddleware(["user", mid1]);

			let middlewares = store.getMiddlewares();
			expect(middlewares.length).to.equal(3);
			expect(middlewares[2]).to.eql(["user", mid1]);
		});

		it("applies multiple middlewares.", () => {
			store.applyMiddleware([
				["user", mid1],
				["todo", mid2]
			]);

			let middlewares = store.getMiddlewares();
			expect(middlewares.length).to.equal(4);
			expect(middlewares[2]).to.eql(["user", mid1]);
			expect(middlewares[3]).to.eql(["todo", mid2]);
		});

		it("throws on invalid middlewares", () => {
			expect(store.applyMiddleware.bind(store)).to.throw;
			expect(store.applyMiddleware.bind(store, "invalidMiddleware")).to.throw;
		});

		it("throws on duplication");
	});

	describe("unapplyMiddleware", () => {
		it("throws on invaid middlewares", () => {
			expect(store.unapplyMiddleware.bind(store)).to.throw;
			expect(store.unapplyMiddleware.bind(store, "invalidMiddleware")).to.throw;
		});

		it("unapplies single middleware", () => {
			store.unapplyMiddleware(["", mid1]);

			let middlewares = store.getMiddlewares();
			expect(middlewares.length).to.equal(1);
			expect(middlewares[0]).to.eql(["", mid2]);
		});

		it("unapplies multiple middlewares", () => {
			store.unapplyMiddleware([
				["", mid1],
				["", mid2]
			]);

			let middlewares = store.getMiddlewares();
			expect(middlewares.length).to.equal(0);
		});
	});
});
