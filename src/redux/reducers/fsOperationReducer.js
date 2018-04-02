import State from '../state';
import {fsOperationActionTypes} from '../actions/fsOperationAction';

const fsOperationReducer = (state = State.main.fsOperation, action) => {
    switch (action.type){
        case fsOperationActionTypes.SET_STRIPE:
            let {stripeInformation} = action;
            return Object.assign({}, state, {stripeInformation});

        default:
            return state;
    }
};

export default fsOperationReducer;