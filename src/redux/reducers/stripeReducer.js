import MockData from '../../mockData';
import {stripeActionTypes} from '../actions/stripeAction';

const stripeReducer = (state = MockData.main, action) => {
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