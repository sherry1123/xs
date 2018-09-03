import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Modal} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from "../../http/requests";
import {message} from "antd/lib/index";

class EditStoragePool extends Component {
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

	async editStoragepool (){
		let storagePoolData = Object.assign({}, this.state.storagePoolData);
		this.setState({formSubmitting: true});
		try {
			await httpRequests.updateStoragePool(storagePoolData);
			httpRequests.getStoragePoolList();
			await this.hide();
			message.success(lang('编辑存储池成功!', 'Edit Storage Pool successfully!'));
		} catch ({msg}){
			message.error(lang('编辑存储池失败, 原因: ', 'Edit Storage Pool failed, reason: ') + msg);
		}
		this.setState({formSubmitting: false});
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
                title={lang('编辑存储池', 'Edit Storage Pool')}
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
                            onClick={this.editStoragepool.bind(this)}
                        >
                            {lang('编辑', 'Edit')}
                        </Button>
                    </div>
                }
            >
                this is edit storage pool
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {storagepool: {storagepoolList}}} = state;
    return {language, storagepoolList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditStoragePool);