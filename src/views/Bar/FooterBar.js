import React, {Component} from 'react';

export default class FooterBar extends Component {
    render (){
        let {VERSION, NODE_ENV} = process.env;
        return (
            <footer className="fs-footer-bar-wrapper">
                ©2018 Orcadt {'v' + VERSION + (NODE_ENV === 'development' && ' dev')}
            </footer>
        );
    }
}