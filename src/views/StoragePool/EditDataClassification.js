import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Button, Modal, Form, Input, message} from 'antd';
import httpRequests from 'Http/requests';

class EditDataClassification extends Component {
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

    show (dataClassificationData){
        this.setState({
            visible: true,
            formSubmitting: false,
            dataClassificationData
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
                title={lang('编辑数据分级', 'Edit Data Classification')}
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
					>
                        <span>{this.state.dataClassificationData.name}</span>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('描述', 'Description')}
					>
						<Input.TextArea
							size="small"
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditDataClassification);