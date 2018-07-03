import React, {Component} from 'react';

export default importComponentCallBack =>  {
    return class AsyncComponent extends Component {
        constructor (props){
            super(props);
            this.state = {
                Component: null
            };
        }

        async componentDidMount (){
            // import is an async function
            // key default is the final exported component of this chunk file
            // key __esModule is true
            const {default: Component} = await importComponentCallBack();
            this.setState({Component});
        }

        render (){
            const {Component} = this.state;
            return Component ? <Component {...this.props} /> : null;
        }
    };
};

// This is a HOC factory which is used as a function to collaborate with webpack Code-Splitting feature.
// It receives a component dynamically import callback function, and return the HOC(AsyncComponent).
// The HOC will load the target component(a js extension file named like *.chunk.js) synchronously
// after itself is mounted, and render the then loaded component with props proxy.
// Through these work, the loading performance of first screen of OrcaFs-UI web App will be greatly improved!
// HOC here means High Order Component, it's a designing pattern in React, also a basic concept in functional programming.