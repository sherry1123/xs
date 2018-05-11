import React, {Component} from "react";
import {connect} from "react-redux";
import {Button, Form, Input, Modal} from "antd";
import lang from "../../components/Language/lang";

class EditNFS extends Component {
    constructor (props){
        super(props);
        this.state = {
            visible: false,
            formSubmitting: false,
            shareData: {}
        };
    }

    edit (){

    }

    show (shareData){
        this.setState({
            visible: true,
            formSubmitting: false,
            shareData
        });
    }

    async hide (){
        this.setState({visible: false});
    }

    render (){
        let isChinese = this.props.language === 'chinese';
        let formItemLayout = {
            labelCol: {
                xs: {span: isChinese ? 4 : 6},
                sm: {span: isChinese ? 4 : 6},
            },
            wrapperCol: {
                xs: {span: isChinese ? 20 : 18},
                sm: {span: isChinese ? 20 : 18},
            }
        };
        return (
            <Modal
                title={lang('编辑NFS共享', 'Edit NFS Share')}
                width={400}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button
                            size="small"
                            loading={this.state.formSubmitting}
                            onClick={this.edit.bind(this)}
                        >
                            {lang('编辑', 'Edit')}
                        </Button>
                        <Button
                            size="small"
                            onClick={this.hide.bind(this)}
                        >
                            {lang('取消', 'Cancel')}
                        </Button>
                    </div>
                }
            >
                <Form>
                    <Form.Item {...formItemLayout} label={lang('路径', 'Path')}>
                        {this.state.shareData.path}
                    </Form.Item>
                    <Form.Item {...formItemLayout} label={lang('描述', 'Description')}>
                        <Input.TextArea
                            style={{width: isChinese ? 280 : 260}} size="small"
                            autosize={{minRows: 4, maxRows: 6}}
                            maxLength={255}
                            placeholder={lang('描述为选填项，长度0-255位', 'description is optional, length is 0-255')}
                            value={this.state.shareData.description}
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
    let {language} = state;
    return {language};
};

const mapDispatchToProps = [];

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps, options)(EditNFS);