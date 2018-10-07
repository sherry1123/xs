import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Modal, message, Form, Input} from 'antd';
import lang from 'Components/Language/lang';
import httpRequests from 'Http/requests';

class CreateDataClassification extends Component {
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

	async validationUpdateState (key, value, valid){
		let {cn, en} = value;
		let validation = {
			[key]: {
				status: (cn || en) ? 'error' : '',
				help: lang(cn, en),
				valid
			}
		};
		validation = Object.assign({}, this.state.validation, validation);
		await this.setState({validation});
	}

	async validateForm (key){
		await this.validationUpdateState(key, {cn: '', en: ''}, true);
		let {name} = this.state.dataClassificationData;
		if (key === 'name'){
			if (!name){
				// no name enter
				await this.validationUpdateState('name', {
					cn: '请输入数据分级名称',
					en: 'please enter data classification name'
				}, false);
			} else {
				let isNameDuplicated = this.props.dataClassificationList.some(dataClassification => dataClassification.name === name);
				if (isNameDuplicated){
					await this.validationUpdateState('name', {
						cn: '该数据分级已经存在',
						en: 'The data classification is already existed'
					}, false);
				}
			}
		}


		// calculate whole form validation
		let formValid = true;
		Object.keys(this.state.validation).forEach(key => {
			formValid = formValid && this.state.validation[key].valid;
		});
		this.setState({formValid});
	}

	async createDataClassification (){
		let dataClassificationData = Object.assign({}, this.state.dataClassificationData);
		this.setState({formSubmitting: true});
		try {
			await httpRequests.createDataClassification(dataClassificationData);
			httpRequests.getDataClassificationList();
			await this.hide();
			message.success(lang(`创建数据分级 ${dataClassificationData.name} 成功!`, `Create data classification ${dataClassificationData.name} successfully!`));
		} catch ({msg}){
			message.error(lang(`数据分级 ${dataClassificationData.name} 创建失败, 原因: `, `Create data classification ${dataClassificationData.name} failed, reason: `) + msg);
		}
		this.setState({formSubmitting: false});
	}

    async show (){
        this.setState({
            visible: true,
			formValid: false,
            formSubmitting: false,
			dataClassificationData: {
				name: '',
				description: '',
			},
			validation: {
				name: {status: '', help: '', valid: false},
			}
        });
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
				title={lang('创建数据分级', 'Create Data Classification')}
                width={480}
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
                            onClick={this.createDataClassification.bind(this)}
                        >
                            {lang('创建', 'Create')}
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
							placeholder={lang('请输入数据分级名称', 'please enter data classification name')}
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
							style={{width: '100%'}}
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(CreateDataClassification);