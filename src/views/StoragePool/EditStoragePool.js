import React, {Component} from 'react';
import {connect} from 'react-redux';
import httpRequests from 'Http/requests';
import lang from 'Components/Language/lang';
import {Button, Modal, Form, Input, message} from 'antd';

class EditStoragePool extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            storagePoolData: {
                name: '',
				description: '',
            },
            validation: {
                name: {status: '', help: '', valid: false},
            }
        };
    }

	formValueChange (key, value){
		let storagePoolData = Object.assign({}, this.state.storagePoolData, {[key]: value});
		this.setState({storagePoolData});
	}

    show (storagePoolData){
        this.setState({
            visible: true,
            formSubmitting: false,
            storagePoolData,
        });
    }

	async editStoragePool (){
		let storagePool = Object.assign({}, this.state.storagePoolData);
		this.setState({formSubmitting: true});
		try {
			await httpRequests.updateStoragePool(storagePool);
			httpRequests.getStoragePoolList();
			await this.hide();
			message.success(lang(`编辑存储池 ${storagePool.name} 成功!`, `Edit Storage Pool ${storagePool.name} successfully!`));
		} catch ({msg}){
			message.error(lang(`编辑存储池 ${storagePool.name} 失败, 原因: `, `Edit Storage Pool ${storagePool.name} failed, reason: `) + msg);
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
                xs: {span: isChinese ? 5 : 7},
                sm: {span: isChinese ? 5 : 7},
            },
            wrapperCol: {
                xs: {span: isChinese ? 19 : 17},
                sm: {span: isChinese ? 19 : 17},
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
                            onClick={this.editStoragePool.bind(this)}
                        >
                            {lang('编辑', 'Edit')}
                        </Button>
                    </div>
                }
            >
				<Form>
					<Form.Item
						{...formItemLayout}
						label={lang('名称', 'Name')}
					>
						<Input
							size="small"
							style={{width: '100%'}}
							value={this.state.storagePoolData.name}
							onChange={({target: {value}}) => {
								this.formValueChange.bind(this, 'name')(value);
							}}
						/>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('描述', 'Description')}
					>
						<Input.TextArea
							size="small"
							autosize={{minRows: 4, maxRows: 6}}
							placeholder={lang('描述为可选项', 'description is optional')}
							value={this.state.storagePoolData.description}
							maxLength={255}
							onChange={({target: {value}}) => {
								this.formValueChange.bind(this, 'description')(value);
							}}
						/>
					</Form.Item>
				</Form>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {storagePool: {storagePoolList}}} = state;
    return {language, storagePoolList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditStoragePool);