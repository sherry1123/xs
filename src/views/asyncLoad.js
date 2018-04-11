import React, {Component} from "react";

export default (importComponentCallBack) =>  {
    return class AsyncComponent extends Component {
        constructor (props){
            super(props);
            this.state = {
                component: null
            };
        }

        async componentDidMount (){
            const {default: component} = await importComponentCallBack();
            this.setState({component});
        }

        render (){
            const Component = this.state.component;
            return Component ? <Component {...this.props} /> : null;
        }
    };
};

// This is a HOC factory which is used as a function to collaborate with Code Splitting.
// It will receive a component dynamically import callback function, and return the HOC(AsyncComponent).
// The HOC will load the target component(a js extension file named like *.chunk.js) synchronously
// after itself is mounted, and render the then loaded component with props proxy.
// Through these work, the loading performance on initial time of our app will be greatly improved!