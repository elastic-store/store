export const State = function () {
	let state = {};
	let actions = {};
	let middlewares = [];

	let newState = function (stateOverride) {
		if (stateOverride) {
			Object.assign(state, stateOverride);
		}

		return state;	
	};

	newState.actions = function (newActions) {
		if (!newActions) return actions;
		Object.assign(actions, newActions);
	};

	newState.apply = function (path, payload) {
		let frags = path.split(".");

		let action;
		try {
			action = actions[frags[0]][frags[1]];
		}
		catch (err) {
			if (err instanceof TypeError) {
				throw Error(`Could not find action associated with path '${path}'.`);
			}
		}

		let wrappedState = (preState, payload) => {
			state[frags[0]] = action(preState, payload);
			return state;
		};

		let finalAction = middlewares.reduceRight((action, middleware) => {
			return middleware(path, action);
		}, wrappedState);

		return finalAction(state[frags[0]], payload)
	};

	newState.subscribe = function (callback) {};

	newState.addMiddleware = (desiredPath, middleware) => {
		let pathAwareMiddleware = (appliedPath, action) => {
			if (typeof desiredPath === "function") {
				return desiredPath(appliedPath, action);
			}

			if (appliedPath.indexOf(desiredPath) === 0) {
				return middleware(appliedPath, action);
			}

			return action;
		};

		middlewares =  middlewares.concat(pathAwareMiddleware);

		return pathAwareMiddleware;
	};

	newState.removeMiddleware = (toRemove) => {
		middlewares = middlewares.filter((mid) => {
			return mid !== toRemove;
		});
	};

	newState.getMiddlewares = () => {
		return middlewares;
	};

	return newState;
};
