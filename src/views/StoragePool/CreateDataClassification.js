import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Button, Form, Input, Modal, message, Icon, Popover} from 'antd';
import httpRequests from 'Http/requests';

class CreateDataClassification extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formSubmitting: false,
            dataClassificationData: {
                name: '',
				description: '',
            }
        };
    }

	formValueChange (key, value){
		let dataClassificationData = Object.assign({}, this.state.dataClassificationData, {[key]: value});
		this.setState({dataClassificationData});
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
    	let {dataClassificationList} = this.props;
    	let dataClassification = dataClassificationList.reduce((prev, curr) => prev.name > curr.name ? prev : curr, {name: 1});
    	let name = dataClassification.name;
    	// new classification must be bigger than the current biggest one
    	name += 1;
        this.setState({
            visible: true,
            formSubmitting: false,
			dataClassificationData: {
				name,
				description: '',
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
                xs: {span: isChinese ? 5 : 5},
                sm: {span: isChinese ? 5 : 5},
            },
            wrapperCol: {
                xs: {span: isChinese ? 19 : 19},
                sm: {span: isChinese ? 19 : 19},
            }
        };
        return (
            <Modal
				title={lang('创建数据分级', 'Create Data Classification')}
                width={400}
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
					>
						<span>{this.state.dataClassificationData.name}</span>
						<Popover
                            placement="right"
                            content={lang('分级名称自动在现有基础上递增。', 'Classification name automatically increase on the basis of existing ones.')}
                        >
                            <Icon type="question-circle-o" className="fs-info-icon m-l" />
                        </Popover>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('描述', 'Description')}
					>
						<Input.TextArea
							size="small"
							style={{width: '100%'}}
                            autosize={{minRows: 4, maxRows: 6}}
                            placeholder={lang('描述为可选项，长度为0-200', 'Description is optional, length is 0-200')}
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