// consider to the point of 'this' in decorator, we must be cautious of the
// using of 'function' and 'arrow function'.

export function throttle (time){
	const instanceMap = new Map();
	return function (target, key, descriptor){
	    return Object.assign({}, descriptor, {
			value: function (...args){
				if (instanceMap.get(this)){
                    instanceMap.set(this, false);
                    setTimeout(() => {
                        descriptor.value.apply(this, args);
                        instanceMap.set(this, true);
                    }, time);
                }
			}
		});
    }
}

export function debounce (time){
	// we need the parameter time, so use a currying here.
	// console.info(this); // undefined
	const instanceMap = new Map();
	return function (target, key, descriptor){
		// target point to the class extends from React origin Component.
		// key point to the member property name.
		// descriptor point the member property method.
		return Object.assign({}, descriptor, {
			value: function (...args){
				// console.info(target); // => class extends from React origin Component
				// console.info(this); // => custom React component instance
				clearTimeout(instanceMap.get(this));
				instanceMap.set(this, setTimeout(() => {
					descriptor.value.apply(this, args); // correct the context to custom React component instance
					// instanceMap.set(this, null);
                    instanceMap.delete(this);
				}, time));
			}
		});
	}
}

export function validationUpdateState (lang){
	return function (target){
		target.prototype.validationUpdateState = async function (key, value, valid){
			let {cn, en} = value;
			let validation = {
				[key]: {
					status: (cn || en) ? 'error' : '',
					help: lang(cn, en),
					valid
				}
			};
			validation = Object.assign({}, this.state.validation, validation);
			await this.setState({validation});
		};
	}
}

