import React, {Component} from 'react';
import {connect} from 'react-redux';
// import httpRequests from 'Http/requests';
import lang from 'Components/Language/lang';
import {Button, Col, Form, Input, Modal, Row, Select} from "antd";
import {formatStorageSize} from 'Services';
import update from 'react-addons-update';
import {debounce, validateNotZeroInteger, capacityUnitSize} from 'Services';

class SetUserQuotaOfStoragePool extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            poolId: '',
            poolName: '',
			userQuotaData: {
				name: '',
				sizeLimit: '', sizeNumber: '', sizeUnit: '',
				sizeUsed: '',
				inodeLimit: '',
				inodeUsed: '',
			},
			validation: {
                sizeLimit: {status: '', help: '', valid: false},
                inodeLimit: {status: '', help: '', valid: false}
            },
        };
    }

    getQuotaNumAndUnit (sizeLimit){
        for ( var k in capacityUnitSize){
            if (sizeLimit % capacityUnitSize[k] === 0){
                this.setState({userQuotaData: {
                    sizeNumber : sizeLimit % capacityUnitSize[k],
                    sizeUnit : k,
                    }
                });
                break;
            }
        }
    }

    formValueChange (key, value, target = 'userQuotaData'){
        let newUserQuotaData = Object.assign({}, this.state[target]);
        if (key === 'sizeNumber'){
            if (!validateNotZeroInteger(value)){
                value = value.length > 0 ? this.state.userQuotaData.sizeNumber : '';
            }
        }
        newUserQuotaData[key] = value;
        let newState = update(this.state, {userQuotaData: {$set: newUserQuotaData}});
        this.setState(Object.assign(this.state, newState));
    }

    async validationUpdateState (key, value, valid){
        let obj = {validation: {}};
        obj.validation[key] = {
            status: {$set: (value.cn || value.en) ? 'error' : ''},
            help: {$set: lang(value.cn, value.en)},
            valid: {$set: valid}
        };
        let newState = update(this.state, obj);
        await this.setState(Object.assign(this.state, newState));
    }

    @debounce(500)
    async validateForm (key){
        // reset current form field validation
        let validation = Object.assign({}, this.state.validation);
        validation[key] = {status: '', help: '', valid: true};
        let newState = update(this.state, {
            formValid: {$set: false},
            validation: {$set: validation}
        });
        await this.setState(Object.assign(this.state, newState));

        if (key === 'sizeLimit'){
            if (this.state.userQuotaData.sizeLimit < this.state.userQuotaData.sizeUsed){
                this.validationUpdateState('sizeLimit', {cn: '请输入大于已使用的大小配额的正整数', en: ''}, false);
            }
        } else if (key === 'inodeLimit'){
            if(this.state.userQuotaData.inodeLimit < this.state.userQuotaData.inodeUsed){
                this.validationUpdateState('inodeLimit', {cn: '请输入大于已使用的索引节点配额的正整数', en: ''}, false);
			}
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

    editUserQuota (){
        let userQuota = Object.assign({}, this.state.userQuotaData);
        userQuota.sizeLimit = capacityUnitSize[userQuota.sizeUnit] * userQuota.sizeNumber;
        this.setState({formSubmitting: true});

    }

    show (poolId, poolName, userQuotaData){
		this.setState({
			visible: true,
			poolId,
			poolName,
			userQuotaData,
		});
	}

	hide (){
		this.setState({
			visible: false,
		});
	}

    render (){
        let {poolName, userQuotaData} = this.state;
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
				width={600}
				title={lang(`设置本地认证用户 ${userQuotaData.name} 在存储池 ${poolName} 的配额`,`Setting User Quota ${userQuotaData.name} of Storage Pool ${poolName}`)}
				closable={false}
				maskClosable={false}
				visible={this.state.visible}
				afterClose={this.close}
				footer={
			   		<div>
						<Button
							size='small'
							onClick={this.hide.bind(this)}
						>
							{lang('取消', 'Cancel')}
						</Button>
                        <Button
							size='small'
							onClick={this.editUserQuota.bind(this)}
						>
							{lang('编辑', 'Edit')}
						</Button>
			   		</div>
				}
			>
				<Form>
					<Form.Item
						{...formItemLayout}
						label={lang('存储池', 'Storage Pool')}
					>
                        <span>{poolName}</span>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('大小配额', 'Size Limit')}
                        validateStatus={this.state.validation.sizeLimit.status}
                        help={this.state.validation.sizeLimit.help}
					>
						<Row style={{height: 32}}>
                            <Col span={6}>
                                <Form.Item validateStatus={this.state.validation.sizeLimit.status}>
                                    <Input
                                        type="text" size="small"
                                        value={this.state.userQuotaData.sizeNumber}
                                        onChange={({target: {value}}) => {
                                            this.formValueChange.bind(this, 'sizeNumber')(value);
                                            this.validateForm.bind(this)('sizeLimit');
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={1}>
                                <p className="ant-form-split"></p>
                            </Col>
                            <Col span={4}>
                                <Form.Item>
                                    <Select style={{width: 80}} size="small"
                                        value={this.state.userQuotaData.sizeUnit}
                                        onChange={value => {
                                            this.formValueChange.bind(this, 'sizeUnit')(value);
                                            this.validateForm.bind(this)('sizeLimit');
                                        }}
                                    >
                                        <Select.Option value="PB">PB</Select.Option>
                                        <Select.Option value="TB">TB</Select.Option>
                                        <Select.Option value="GB">GB</Select.Option>
                                        <Select.Option value="MB">MB</Select.Option>
                                        <Select.Option value="KB">KB</Select.Option>
                                        <Select.Option value="B">B</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('大小配额已使用', 'Used Of Size Quota')}
					>
                        <span>{formatStorageSize(userQuotaData.sizeUsed)}</span>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('索引节点配额', 'Inode Quota')}
					>
						<Input
							size="small"
							style={{width: 150}}
							value={userQuotaData.inodeLimit}
							onChange={({target: {value}}) => {
								this.formValueChange.bind(this, 'inodeLimit')(value);
								this.validateForm.bind(this)('inodeLimit');
							}}
						/>
					</Form.Item>
					<Form.Item
						{...formItemLayout}
						label={lang('索引节点配额已使用', 'Used Of Inode Quota')}
					>
                        <span>{userQuotaData.inodeUsed}</span>
					</Form.Item>
				</Form>
			</Modal>
		);
	}
}

const mapStateToProps = state => {
	const {language, main: { storagePool: {userQuotasOfStoragePool}}} = state;
	return {language, userQuotasOfStoragePool};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
	return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(SetUserQuotaOfStoragePool);