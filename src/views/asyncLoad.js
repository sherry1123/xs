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

// This is a HOC factory which is used as a function that receive an component dynamically import,
// and return the HOC(AsyncComponent). The HOC component will load the component synchronously
// after itself is mounted, and render the then loaded component with props proxy.