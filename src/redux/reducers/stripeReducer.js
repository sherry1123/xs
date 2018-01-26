import State from '../state';
import {stripeActionTypes} from '../actions/stripeAction';

const stripeReducer = (state = State.main, action) => {
    switch (action.type){
        // set
        case stripeActionTypes.SET_STRIPE_INFORMATION:
            let {stripeInformation} = action;
            return Object.assign({}, state, {stripeInformation});

        default:
            return state;
    }
};

export default stripeReducer;