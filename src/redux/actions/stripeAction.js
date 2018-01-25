export const stripeActionTypes = {
    SET_STRIPE_INFORMATION: 'SET_STRIPE_INFORMATION',
};

export default {
    setStripeInformation: stripeInformation => ({
        type: stripeActionTypes.SET_STRIPE_INFORMATION,
        stripeInformation
    }),
};