import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Modal} from 'antd';
import lang from 'Components/Language/lang';

class CreateStoragePool extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            storagePoolData: {
                name: '',
            },
            validation: {
                name: {status: '', help: '', valid: false},
            }
        };
    }

    show (storagePoolData){
        this.setState({
            visible: true,
            formSubmitting: false,
            storagePoolData,
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 6 : 8},
                sm: {span: isChinese ? 6 : 8},
            },
            wrapperCol: {
                xs: {span: isChinese ? 18 : 16},
                sm: {span: isChinese ? 18 : 16},
            }
        };
        return (
            <Modal
                title={lang('创建存储池', 'Create Storage Pool')}
                width={540}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            size="small"
                            type="primary"
                            loading={this.state.formSubmitting}
                            onClick={this.edit.bind(this)}
                        >
                            {lang('创建', 'Edit')}
                        </Button>
                    </div>
                }
            >
                this is create storage pool
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language} = state;
    return {language};
};

export default connect(mapStateToProps)(CreateStoragePool);