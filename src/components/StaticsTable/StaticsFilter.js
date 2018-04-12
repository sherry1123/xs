import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Checkbox, Icon, message, Modal, Popover, Tag} from 'antd';
import lang from '../Language/lang';

class StaticsFilter extends Component {
    constructor (props){
        super(props);
        let {target, type, extensionTitle = '', limit, totalItems, selectedItems} = this.props;
        let availableItems = this.sortArrayByFirstLetter(totalItems.filter(item => !selectedItems.includes(item)));
        // selectedItems = this.sortArrayByFirstLetter(selectedItems);
        this.state = {
            visible: false,
            target,
            type,
            extensionTitle,
            limit,
            totalItems,
            availableItems,
            selectedItems,
        };
    }

    itemSelectChange (item, checked){
        let {availableItems, selectedItems} = this.state;
        if (checked && selectedItems.length >= this.state.limit){
            return message.warning(lang(`允许选择${this.state.limit}个过滤项`, `Allow select ${this.state.limit}`));
        }
        let fromItems = checked ? availableItems : selectedItems;
        let toItems = checked ? selectedItems : availableItems;
        // remove it from fromItems
        fromItems = [...fromItems];
        fromItems.splice(fromItems.indexOf(item), 1);
        // add it into toItem
        toItems = [...toItems];
        toItems.push(item);
        if (!checked){
            // to make sure userOrClientName always be at the first place on static table header
            toItems = this.sortArrayByFirstLetter(toItems);
        }
        this.setState({
            availableItems: checked ? fromItems : toItems,
            selectedItems: checked ? toItems : fromItems
        });
    }

    sortArrayByFirstLetter (items){
        return items.sort((x, y) => {
            // according to V8's sort policy (start at source code array.js 710 line),
            // x and y here are not one previous and one next
            let a = x.toLowerCase(); // ignore case
            let b = y.toLowerCase();
            if (a < b) return -1;
            if (a > b) return 1;
            return 0;
        })
    }

    show (){
        this.setState({visible: true});
    }

    hide (){
        this.setState({visible: false});
    }

    render (){
        let {target, type, extensionTitle, availableItems, selectedItems} = this.state;
        let title = lang(
            `${target === 'client' ? '客户端' : '用户'}${type === 'metadata' ? '元数据' : '存储'}统计过滤器`,
            `${target === 'client' ? 'Client ' : 'User '}${type === 'metadata' ? 'Metadata ' : 'Storage '} Statics Filter`
        );
        title += extensionTitle;
        return (
            <Modal title={title}
                width={650}
                closable={false}
                maskClosable={false}
                visible={this.state.visible}
                afterClose={this.close}
                footer={
                    <div>
                        <Button size="small" type="primary"
                            onClick={() => {
                                this.props.getFilter([...selectedItems]);
                                this.hide();
                            }}
                        >
                            {lang('应用', 'Apply')}
                        </Button>
                        <Button size="small" onClick={this.hide.bind(this)}>
                            {lang('取消', 'Cancel')}
                        </Button>
                    </div>
                }
            >
                <section className="fs-statics-filter-wrapper">
                    <p className="fs-statics-filter-title">
                        {lang('已选 ', 'Selected ')}<span className="fs-static-filter-num">{selectedItems.length}</span>{lang(' 项', ' Item(s)')}
                        <Popover placement="right" content={lang('过滤项允许选择1-10个', 'Allow 1 to 10 filter items to be selected')}>
                            <Icon type="question-circle-o" className="fs-info-icon m-l cyan" />
                        </Popover>
                    </p>
                    <div className="fs-statics-filter-item-box">
                        {selectedItems.map(item => <Tag className="fs-statics-filter-tag"
                            key={item}
                            color={item !== 'userOrClientName' ? 'cyan' : ''}
                            closable={item !== 'userOrClientName'}
                            onClose={() => {
                                this.itemSelectChange(item, false);
                            }}
                        >
                            {item}
                        </Tag>)
                        }
                    </div>
                    <p className="fs-statics-filter-title">
                        {lang(`剩余 ${availableItems.length} 项`, `Remaining ${availableItems.length} Item(s)`)}
                    </p>
                    <div className="fs-statics-filter-item-box">
                        {availableItems.length > 0 ?
                            availableItems.map(item => <Checkbox className="fs-statics-filter-item"
                                key={item}
                                disabled={selectedItems.length >= this.state.limit}
                                onChange={() => {
                                    this.itemSelectChange(item, true);
                                }}
                            >
                                {item}
                            </Checkbox>) :
                            lang('无', 'No Items')
                        }
                    </div>
                </section>
            </Modal>
        );
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return Object.assign({}, stateProps, dispatchProps, ownProps);
};

const options = {withRef: true};

export default connect(mapStateToProps, [], mergeProps, options)(StaticsFilter);