import assign from "lodash/assign";

export const State = function () {
	let state = {};
	let actions = {};
	let middlewears = [];

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

	newState.apply = function (path, data) {
		let frags = path.split(".");
		let action = actions[frags[0]][frags[1]];

		state[frags[0]] = action(state[frags[0]], data)
	};

	newState.subscribe = function (callback) {};

	newState.middlewares = function (middlewares) {};

	return newState;
};
