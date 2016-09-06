export const initStateLeaves = (tree) => {
	for (let key in tree) {
		if (tree.hasOwnProperty(key)) {
			if (typeof tree[key] === "function") return undefined;
			tree[key] = initStateLeaves(tree[key]);
		}
	}
	return tree;
};

export const genStateTree = (actions) => {
	let stateTree = Object.assign({}, actions);
	stateTree = initStateLeaves(stateTree);
	return stateTree;
};

export const Store = function (actions, initialMiddlewares, initialState) {
	if (!actions) throw Error("Please pass action tree.");
	let middlewares = initialMiddlewares || [];
	let state = genStateTree(actions);
	Object.assign(state, initialState);

	let newStore = function (stateOverrides) {
		if (stateOverrides) {
			Object.assign(state, stateOverrides);
		}

		return state;	
	};

	newStore.actions = function () {
		return actions;
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
			return middleware(path, action, newStore);
		}, wrappedAction);

		return finalAction(state, payload)
	};

	newStore.attach = (desiredPath, middleware) => {
		let pathAwareMiddleware = (appliedPath, action, store) => {
			if (typeof desiredPath === "function") {
				return desiredPath(appliedPath, action, store);
			}

			if (appliedPath.indexOf(desiredPath) === 0) {
				return middleware(appliedPath, action, store);
			}

			return action;
		};

		pathAwareMiddleware.detach = () => {
			let index = middlewares.indexOf(pathAwareMiddleware);
			if (index !== -1) {
				middlewares.splice(index, 1);
			}
		};

		middlewares.push(pathAwareMiddleware);

		return pathAwareMiddleware;
	};

	newStore.middlewares = () => {
		return middlewares;
	};

	return newStore;
};
