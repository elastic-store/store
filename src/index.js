export const Store = function (initialActions, initialMiddlewares, initialState) {
	let actions = initialActions || {};
	let middlewares = initialMiddlewares || [];
	let state = initialState || {};

	let newStore = function (stateOverrides) {
		if (stateOverrides) {
			Object.assign(state, stateOverrides);
		}

		return state;	
	};

	newStore.action = function (newActions) {
		if (!newActions) return actions;
		Object.assign(actions, newActions);
	};

	newStore.dispatch = function (path, payload) {
		let frags = path.split(".");

		let action;
		try {
			action = frags.reduce((action, frag) => {
				return action[frag];
			}, actions);
		}
		catch (err) {
			if (err instanceof TypeError) {
				throw Error(`Could not find action associated with path '${path}'.`);
			}
		}

		let wrappedAction = (entireState, payload) => {
			let prevState = entireState[frags[0]]
			state[frags[0]] = action(prevState, payload);
			return state;
		};

		let finalAction = middlewares.reduceRight((action, middleware) => {
			return middleware(path, action);
		}, wrappedAction);

		return finalAction(state, payload)
	};

	newStore.middleware = (desiredPath, middleware) => {
		if (desiredPath === undefined) return middlewares;

		let index = middlewares.indexOf(desiredPath);
		if (index !== -1) {
			middlewares.splice(index, 1);
			return desiredPath;
		}

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

	return newStore;
};
