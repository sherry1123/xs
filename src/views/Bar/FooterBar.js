import React, {Component} from 'react';
import {connect} from "react-redux";

class FooterBar extends Component {
    render (){
        return (
            <footer className="fs-footer-bar-wrapper">
                ©2018 OrcaFS {this.props.version}
            </footer>
        );
    }
}

const mapStateToProps = state => {
    const {language, main: {general: {version}}} = state;
    return {language, version};
};

export default connect(mapStateToProps)(FooterBar);