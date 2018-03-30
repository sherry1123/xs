export const fsOperationActionTypes = {
    SET_STRIPE: 'SET_STRIPE',
};

export default {
    setStripeInformation: stripe => ({
        type: fsOperationActionTypes.SET_STRIPE,
        stripe
    }),
};