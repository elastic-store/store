function isObject (data) {
	return Object.prototype.toString.call(data) === "[object Object]";
}

function isArray (data) {
	return Array.isArray(data);
}

export const Store = function (actions, rootMiddlewares = [], initialState = {}) {
	let middlewares = rootMiddlewares.map((middleware) => {
		if (typeof middleware === "function") {
			return ["", middleware];
		}

		return middleware
	});

	let newStore =
		{ applyMiddleware (newMiddlewares) {
				if (!isArray(newMiddlewares)) {
					throw Error("Please pass a middleware.");
				}

				middlewares = isArray(newMiddlewares[0])
					? middlewares.concat(newMiddlewares)
					: middlewares.concat([newMiddlewares]);
			}
		, unapplyMiddleware (middlewaresToBeRemoved) {
				if (!isArray(middlewaresToBeRemoved)) {
					throw Error("Please pass a middleware.");
				}

				middlewaresToBeRemoved = isArray(middlewaresToBeRemoved[0])
					? middlewaresToBeRemoved
					: [middlewaresToBeRemoved]

				middlewares = middlewares.filter((middleware) => {
					return !middlewaresToBeRemoved.some((mid) => {
						return mid[0] === middleware[0] && mid[1] === middleware[1];
					});
				});
			}
		, getMiddlewares () {
				return middlewares;
			}
		, addNode (nodeName, actions) {
				newStore[nodeName] = wrapActions({}, actions, [nodeName]);
				return newStore[nodeName];
			}
		, removeNode (nodeName) {
				delete newStore[nodeName];
				middlewares = middlewares.filter((middleware) => {
					return middleware[0].indexOf(nodeName) === -1;
				});
			}}

	function wrapActions (destination, target, pathFrags = []) {
		for (let prop in target) {
			if (target.hasOwnProperty(prop)) {

				let property = target[prop];
				pathFrags.push(`${prop}`);

				if (isObject(property)) {
					destination[prop] = wrapActions({}, property, pathFrags);
				}
				else if (typeof property === "function") {
					let pathStr = [].concat(pathFrags).join(".");

					destination[prop] = function (arg) {
						let wrappedAction = middlewares
							.filter((middleware) => pathStr.indexOf(middleware[0]) !== -1)
							.reduceRight((next, middleware) => {
								return middleware[1](next, newStore, pathStr);
							}, property.bind(destination));

						return wrappedAction(arg);
					}
				}
				else {
					destination[prop] = property;
				}

				pathFrags.pop();
			}
		}

		return destination;
	};

	return wrapActions(newStore, actions);
};
