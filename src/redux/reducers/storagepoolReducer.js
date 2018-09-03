import State from '../state';
import {storagepoolActionTypes} from '../actions/storagepoolAction';

const storagepoolReducer = (state = State.main.storagepool, action) => {
	let {storagepoolList} = action;
	switch (action.type){
		case storagepoolActionTypes.SET_STORAGEPOOL_LIST:
			return Object.assign({}, state, {storagepoolList});
		default:
			return state;
	}
};

export default storagepoolReducer;