import assign from "lodash/assign";

export const State = function () {
	let state = {};
	let actions = {};
	let middlewares = [];

	let newState = function (stateOverride) {
		if (stateOverride) {
			assign(state, stateOverride);
		}

		return state;	
	};

	newState.actions = function (newActions) {
		if (!newActions) return actions;
		assign(actions, newActions);
	};

	newState.apply = function (path, payload) {
		let frags = path.split(".");
		let action = actions[frags[0]][frags[1]];

		let finalAction = middlewares.reduceRight((action, middleware) => {
			return middleware(path, action);
		}, action);

		state[frags[0]] = finalAction(state[frags[0]], payload)
	};

	newState.subscribe = function (callback) {};

	newState.addMiddleware = (desiredPath, middleware) => {
		let pathAwareMiddleware = (appliedPath, action) => {
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
