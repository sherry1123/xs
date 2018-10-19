import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Button, Form, Icon, Input, message, Modal, Switch} from 'antd';
import {validationUpdateState} from 'Services';
// import httpRequests from 'Http/requests';

const mapStateToProps = state => {
    let {language, main: {SystemConfiguration: {systemParameterList}}} = state;
    return {language, systemParameterList};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign({}, stateProps, dispatchProps, ownProps);

const options = {withRef: true};

@connect(mapStateToProps, mapDispatchToProps, mergeProps, options)
@validationUpdateState(lang)
export default class EditSystemParameter extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formSubmitting: false,
			dataPreparing: true,
            parameterData: {
                name: '',
				currentValue: '', valueType:'',
				description: '',
            },
        };
    }

    formValueChange (key, value){
        let parameterData = Object.assign({}, this.state.parameterData, {[key]: value});
        this.setState({parameterData});
    }

    async show (parameterData){
        this.setState({
            visible: true,
            formSubmitting: false,
			dataPreparing: true,
            parameterData: {
                ...{
                    ...parameterData
                }
            },
        });
		this.setState({dataPreparing: false});
    }

	async editSystemParameter (){
        let parameterData = Object.assign({}, this.state.parameterData);
		this.setState({formSubmitting: true});
		console.info(parameterData.currentValue);
		try {
			// await httpRequests.updateSystemParameter(parameterData);
			// httpRequests.getSystemParameterList();
			await this.hide();
			message.success(lang(`编辑系统参数 ${parameterData.name} 成功!`, `Edit system parameter ${parameterData.name} successfully!`));
		} catch ({msg}){
			message.error(lang(`编辑系统参数 ${parameterData.name} 失败, 原因: `, `Edit system parameter ${parameterData.name} failed, reason: `) + msg);
		}

		this.setState({formSubmitting: false});
	}

    async hide (){
        this.setState({visible: false});
    }

    render (){
    	let {parameterData} = this.state;
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
                title={
                	<span>
                        {lang(`编辑系统参数 ${parameterData.name}`, `Edit System Parameter ${parameterData.name}`)}
                        {this.state.dataPreparing && <Icon type="loading" style={{marginLeft: 10}} />}
                    </span>
				}
                width={500}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            disabled={this.state.formSubmitting}
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            size="small"
                            type="primary"
                            loading={this.state.formSubmitting}
                            onClick={this.editSystemParameter.bind(this)}
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
                        <span>{parameterData.name}</span>
					</Form.Item>
                    <Form.Item
						{...formItemLayout}
						label={lang('参数设置', 'value')}
					>
                        <Switch
                            style={{marginRight: 10}}
                            size="small"
                            checked={parameterData.currentValue}
                            onChange={checked => this.formValueChange.bind(this, 'currentValue')(checked)}
                        />
                        {parameterData.currentValue ? 'true' : 'false'}
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('描述', 'Description')}
					>
						<Input.TextArea
							size="small"
							autosize={{minRows: 4, maxRows: 6}}
							placeholder={lang('描述为可选项，长度为0-200', 'Description is optional, length is 0-200')}
							value={parameterData.description}
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
