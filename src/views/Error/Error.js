import React, {PureComponent} from 'react';

export default class Error extends PureComponent {
    render (){
        return (
            <div className="fs-error-wrapper">
                <section className="fs-error-content">
                    <div className="fs-error-img" />
                    <p>:) you came to an error page, will go back in 5 seconds...</p>
                </section>
            </div>
        );
    }

    componentDidMount (){
        setTimeout(() => {
            this.props.history.goBack();
        }, 5000);
    }
}