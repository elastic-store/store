function isObject(data) {
	return Object.prototype.toString.call(data) === "[object Object]";
}

function isArray(data) {
	return Array.isArray(data);
}

export const Store = function(actions, rootMiddlewares = [], initialState = {}) {
	let middlewares = rootMiddlewares.map((middleware) => {
		if (typeof middleware === "function") {
			return ["", middleware];
		}

		return middleware
	});

	let newStore = initialState;
	newStore = Object.assign(
		initialState, {
			applyMiddleware(newMiddlewares) {
				if (!isArray(newMiddlewares)) {
					throw Error("Please pass a middleware.");
				}

				middlewares = isArray(newMiddlewares[0]) ?
					middlewares.concat(newMiddlewares) :
					middlewares.concat([newMiddlewares]);
			},
			unapplyMiddleware(middlewaresToBeRemoved) {
				if (!isArray(middlewaresToBeRemoved)) {
					throw Error("Please pass a middleware.");
				}

				middlewaresToBeRemoved = isArray(middlewaresToBeRemoved[0]) ?
					middlewaresToBeRemoved :
					[middlewaresToBeRemoved]

				middlewares = middlewares.filter((middleware) => {
					return !middlewaresToBeRemoved.some((mid) => {
						return mid[0] === middleware[0] && mid[1] === middleware[1];
					});
				});
			},
			getMiddlewares() {
				return middlewares;
			},
			addNode(nodeName, actions) {
				newStore[nodeName] = wrapActions({}, actions, [nodeName]);
				return newStore[nodeName];
			},
			addNodes(nodes) {
				// TODO: check if its object
				for (let key in nodes) {
					if (nodes.hasOwnProperty(key)) {
						newStore.addNode(key, nodes[key]);
					}
				}
			},
			removeNode(nodeName) {
				// TODO: throw proper error if key does not exists
				delete newStore[nodeName];
				middlewares = middlewares.filter((middleware) => {
					return middleware[0].indexOf(nodeName) === -1;
				});
			},
			removeNodes(nodes) {
				// TODO: check if its array
				for (let i = 0; i < nodes.length; i ++) {
					newStore.removeNode(nodes[i]);
				}
			}
		});

	function wrapActions(destination, target, pathFrags = []) {
		for (let prop in target) {
			if (target.hasOwnProperty(prop)) {

				let property = target[prop];
				pathFrags.push(`${prop}`);

				if (isObject(property)) {
					destination[prop] =
						wrapActions(destination[prop] || {}, property, pathFrags);
				} else if (typeof property === "function") {
					let pathStr = [].concat(pathFrags).join(".");

					destination[prop] = function(arg) {
						let wrappedAction = middlewares
							.filter((middleware) => pathStr.indexOf(middleware[0]) !== -1)
							.reduceRight((next, middleware) => {
								return middleware[1](next, newStore, pathStr);
							}, property.bind(destination));

						return wrappedAction(arg);
					}
				} else {
					destination[prop] = destination[prop] || property;
				}

				pathFrags.pop();
			}
		}

		return destination;
	};

	return wrapActions(newStore, actions);
};
