import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Modal} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from "../../http/requests";
import {message} from "antd/lib/index";

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

	async createStoragepool (){
		let storagePoolData = Object.assign({}, this.state.storagePoolData);
		this.setState({formSubmitting: true});
		try {
			await httpRequests.createStoragePool(storagePoolData);
			// move this operation to socket, and listen the snapshot start creating event
			// httpRequests.getSnapshotList();
			await this.hide();
			message.success(lang(`开始创建存储池 ${storagePoolData.name}!`, `Start creating storagePool ${storagePoolData.name}!`));
		} catch ({msg}){
			message.error(lang(`存储池 ${storagePoolData.name} 创建失败, 原因: `, `Create storagePool ${storagePoolData.name} failed, reason: `) + msg);
		}
		this.setState({formSubmitting: false});
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
                            onClick={this.createStoragepool.bind(this)}
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

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateStoragePool);