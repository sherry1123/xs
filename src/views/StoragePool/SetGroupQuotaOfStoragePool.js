import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from 'Components/Language/lang';
import {Button, Col, Form, InputNumber, Modal, message, Row, Select} from 'antd';
import {debounce, validateNotZeroInteger, capacityUnitSize, formatStorageSize} from 'Services';
import httpRequests from 'Http/requests';

class SetGroupQuotaOfStoragePool extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formSubmitting: false,
            poolName: '',
            quotaData: {
                poolId: '',
                name: '',
                sizeLimit: '', sizeLimitNumber: '', sizeLimitUnit: '',
                inodeLimit: '',
            },
            validation: {
                sizeLimit: {status: '', help: '', valid: false},
                inodeLimit: {status: '', help: '', valid: false}
            }
        };
    }

    formValueChange (key, value){
        if (key === 'sizeLimitNumber'){
            if (!validateNotZeroInteger(value)){
                value = value.length > 0 ? this.state.quotaData.sizeLimitNumber : '';
            }
        }
        let quotaData = Object.assign({}, this.state.quotaData, {[key]: value});
        this.setState({quotaData});
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

    @debounce(500)
    async validateForm (key){
        await this.validationUpdateState(key, {cn: '', en: ''}, true);
		let {sizeNumber, sizeUnit, sizeUsed, inodeLimit, inodeUsed} = this.state.quotaData;
        if (key === 'sizeNumber' || key === 'sizeUnit'){
            if (sizeNumber && sizeUnit){
                let sizeLimit = sizeNumber * capacityUnitSize[sizeUnit];
                if (sizeLimit <= sizeUsed){
                    await this.validationUpdateState('sizeLimit', {
                        cn: '大小配额必须设置为大于当前已使用的额度',
                        en: 'Size quota must be bigger than currently used value.'
                    }, false);
                }
            } else {
                await this.validationUpdateState('sizeLimit', {
                    cn: '请设置大小配额',
                    en: 'Please set size quota'
                }, false);
            }
        }
        if (key === 'inodeLimit'){
            if (inodeLimit){
                if (inodeLimit <= inodeUsed){
                    await this.validationUpdateState('sizeLimit', {
                        cn: '索引节点配额必须设置为大于当前已使用的额度',
                        en: 'Inode quota must be bigger than currently used value.'
                    }, false);
                }
            } else {
                await this.validationUpdateState('inodeLimit', {
                    cn: '请设置索引节点配额',
                    en: 'Please set inode quota'
                }, false);
            }
        }

        // calculate whole form validation
        let formValid = true;
        Object.keys(this.state.validation).forEach(key => {
            formValid = formValid && this.state.validation[key].valid;
        });
        this.setState({formValid});
    }

	async setQuota (){
		let {poolName, quotaData} = Object.assign({}, this.state);
		quotaData.sizeLimit = quotaData.sizeLimitNumber * capacityUnitSize[quotaData.sizeLimitUnit];
		this.setState({formSubmitting: true});
		try {
			await httpRequests.setGroupQuotaOfStoragePool(quotaData);
			httpRequests.getGroupQuotasOfStoragePoolById(quotaData.poolId);
			await this.hide();
			message.success(lang(`设置本地认证用户组 ${quotaData.name} 在存储池 ${poolName} 的配额成功!`, `Set the quota of local authentication user group ${quotaData.name} in storage pool ${poolName} successfully!`));
		} catch ({msg}){
			message.error(lang(`设置本地认证用户组 ${quotaData.name} 在存储池 ${poolName} 的配额失败, 原因: `, `Set the quota of local authentication user group ${quotaData.name} in storage pool ${poolName} failed, reason: `) + msg);
		}
		this.setState({formSubmitting: false});
	}

	resolveValueToNumberAndUnit (value, unitSizeMap){
        let units = Object.keys(unitSizeMap);
        if (value === 0){
            return {sizeLimitNumber: value, sizeLimitUnit: units[units.length - 1]};
        }
        for (let i = 0; i < units.length; i ++){
            let sizeLimitUnit = units[i];
            let byteValue = unitSizeMap[sizeLimitUnit];
            let sizeLimitNumber = value / byteValue;
            if (sizeLimitNumber > 1){
                return {sizeLimitNumber, sizeLimitUnit};
            }
        }
    }

    async show (quotaData, {poolId, poolName}){
        // calculate size quota's number and unit
        let {sizeLimitNumber, sizeLimitUnit} = this.resolveValueToNumberAndUnit(quotaData.sizeLimit, capacityUnitSize);
        this.setState({
            visible: true,
            formSubmitting: false,
            poolName,
			quotaData: {
                poolId,
                ...{
                    sizeLimitNumber,
                    sizeLimitUnit,
                    ...quotaData
                }
            }
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let {visible, validation, formSubmitting, quotaData, poolName} = this.state;
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 9 : 9},
                sm: {span: isChinese ? 9 : 9},
            },
            wrapperCol: {
                xs: {span: isChinese ? 15 : 15},
                sm: {span: isChinese ? 15 : 15},
            }
        };
        return (
            <Modal
				title={lang(`设置本地认证用户组 ${quotaData.name} 的配额`, `Set Quota Of Local Authentication User Group ${quotaData.name}`)}
                width={400}
                closable={false}
                maskClosable={false}
                visible={visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            disabled={formSubmitting}
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                        <Button
                            size="small"
                            type="primary"
                            loading={formSubmitting}
                            onClick={this.setQuota.bind(this)}
                        >
                            {lang('设置', 'Set')}
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
                        label={lang('大小配额', 'Size Quota')}
                        validateStatus={validation.sizeLimit.status}
                        help={validation.sizeLimit.help}
                    >
                        {
                            // hope antd will support addon for InputNumber, so we won't need to use this dirty way instead.
                        }
                        <Row style={{height: 32}}>
                            <Col span={5}>
                                <Form.Item validateStatus={validation.sizeLimit.status}>
                                    <InputNumber
                                        type="text" size="small"
                                        value={quotaData.sizeLimitNumber}
                                        onChange={value => {
                                            this.formValueChange.bind(this, 'sizeLimitNumber')(value);
                                            this.validateForm.bind(this)('sizeLimit');
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <p className="ant-form-split" />
                            </Col>
                            <Col span={4}>
                                <Form.Item>
                                    <Select style={{width: 80}} size="small"
                                        value={quotaData.sizeLimitUnit}
                                        onChange={value => {
                                            this.formValueChange.bind(this, 'sizeLimitUnit')(value);
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
						label={lang('大小配额已使用', 'Used Size Quota')}
					>
						<span>{formatStorageSize(quotaData.sizeUsed)}</span>
					</Form.Item>
                    <Form.Item
						{...formItemLayout}
						label={lang('索引节点配额', 'Inode Quota')}
						validateStatus={validation.inodeLimit.status}
						help={validation.inodeLimit.help}
					>
						<InputNumber
							size="small"
							placeholder={lang('请输入索引节点配额', 'Please enter inode quota')}
							value={quotaData.inodeLimit}
							onChange={value => {
								this.formValueChange.bind(this, 'inodeLimit')(value);
								this.validateForm.bind(this)('inodeLimit');
							}}
						/>
					</Form.Item>
                     <Form.Item
						{...formItemLayout}
						label={lang('索引节点配额已使用', 'Used Inode Quota')}
					>
						<span>{quotaData.inodeUsed}</span>
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

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(SetGroupQuotaOfStoragePool);