import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';

class StoragePool extends Component {
    render (){
        return (
            <div>
                this is storage pool page
            </div>
        );
    }
}

const mapStateToProps = state => {
    let {language} = state;
    return {language};
};

export default connect(mapStateToProps)(StoragePool);