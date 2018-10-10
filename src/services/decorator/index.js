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
	// console.info(this); // undefined
	const instanceMap = new Map();
	return function (target, key, descriptor){
		// console.info(target); // => Component instance
		// console.info(this); // => undefined
		return Object.assign({}, descriptor, {
			value: function (...args){
				// console.info(target); // => Component instance
				// console.info(this); // => Component instance's class(constructor)
				clearTimeout(instanceMap.get(this));
				instanceMap.set(this, setTimeout(() => {
					descriptor.value.apply(this, args);
					// instanceMap.set(this, null);
                    instanceMap.delete(this);
				}, time));
			}
		});
	}
}