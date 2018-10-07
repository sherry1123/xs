import React, {Component} from 'react';
import {connect} from 'react-redux';
import httpRequests from 'Http/requests';
import lang from 'Components/Language/lang';
import {Button, Modal, Form, Input, message} from 'antd';

class EditDataClassification extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formValid: false,
            formSubmitting: false,
            dataClassificationData: {
                name: '',
				description: '',
            },
            validation: {
                name: {status: '', help: '', valid: false},
            }
        };
    }

	formValueChange (key, value){
		let dataClassificationData = Object.assign({}, this.state.dataClassificationData, {[key]: value});
		this.setState({dataClassificationData});
	}

    show (dataClassificationData){
        this.setState({
            visible: true,
            formSubmitting: false,
            dataClassificationData,
            validation: {
                name: {status: '', help: '', valid: false},
            }
        });
    }

	async editDataClassification (){
		let dataClassificationData = Object.assign({}, this.state.dataClassificationData);
		this.setState({formSubmitting: true});
		try {
			await httpRequests.updateDataClassification(dataClassificationData);
			httpRequests.getDataClassificationList();
			await this.hide();
			message.success(lang(`编辑数据分级 ${dataClassificationData.name} 成功!`, `Edit data classification ${dataClassificationData.name} successfully!`));
		} catch ({msg}){
			message.error(lang(`编辑数据分级 ${dataClassificationData.name} 失败, 原因: `, `Edit data classification ${dataClassificationData.name} failed, reason: `) + msg);
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
                title={lang('编辑数据分级', 'Edit Data Classification')}
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
							disabled={!this.state.formValid}
                            loading={this.state.formSubmitting}
                            onClick={this.editDataClassification.bind(this)}
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
						validateStatus={this.state.validation.name.status}
						help={this.state.validation.name.help}
					>
						<Input
							size="small"
							style={{width: '100%'}}
							value={this.state.dataClassificationData.name}
							onChange={({target: {value}}) => {
								this.formValueChange.bind(this, 'name')(value);
								this.validateForm.bind(this)('name');
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
							placeholder={lang('描述为可选项，长度0-200位', 'description is optional, length 0-200 bits')}
							value={this.state.dataClassificationData.description}
							maxLength={200}
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
    let {language, main: {storagePool: {dataClassificationList}}} = state;
    return {language, dataClassificationList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditDataClassification);