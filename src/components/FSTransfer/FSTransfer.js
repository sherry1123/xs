import React, {Component} from 'react';
import {connect} from "react-redux";
import {Button, Checkbox} from 'antd';
import 'antd/lib/transfer/style';
import lang from '../Language/lang';

class FSTransfer extends Component {
    constructor (props){
        super(props);
        let {language, className, notFoundContent = '', titles = ['', ''], dataSource = [], targetKeys = [], onChange, render, footer,} = this.props;
        let selected = dataSource.filter(item => targetKeys.includes(item.diskname));
        this.state = {
            source: dataSource,
            tempSelected: [],
            selected,
            tempSource: [],
            // from props
            language,
            className,
            notFoundContent,
            titles,
            dataSource,
            onChange,
            render,
            footer,
        };
    }

    async allSourceSelect ({target: {checked}}){
        let source = [...this.state.source].map(item => {
            // set all items checked
            item.checked = checked;
            return item;
        });
        let tempSelected = checked ? [...source] : [];
        await this.setState({source, tempSelected});
    }

    oneSourceSelect (item, i, {target: {checked}}){
        let tempSelected = [...this.state.tempSelected];
        if (checked){
            tempSelected.push(item);
        } else {
            tempSelected = tempSelected.filter(({diskname}) => !(diskname === item.diskname));
        }
        let source = [...this.state.source];
        // set one item checked
        source[i].checked = checked;
        this.setState({source, tempSelected});
    }

    allUnSelect ({target: {checked}}){
        let selected = [...this.state.selected].map(item => {
            item.checked = checked;
            return item;
        });
        let tempSource = checked ? [...selected] : [];
        this.setState({selected, tempSource});
    }

    oneUnSelect (item, i, {target: {checked}}){
        let tempSource = [...this.state.tempSource];
        if (checked){
            tempSource.push(item);
        } else {
            tempSource = tempSource.filter(({diskname}) => !(diskname === item.diskname));
        }
        let selected = [...this.state.selected];
        selected[i].checked = checked;
        this.setState({selected, tempSource});
    }

    toRight (){
        let {source, tempSelected, selected} = this.state;
        tempSelected = [...tempSelected];
        let tempSelectedNames = tempSelected.map(item => item.diskname);
        source = [...source].filter(item => !tempSelectedNames.includes(item.diskname));
        selected = [...selected].concat(tempSelected).map(item => {
            // clear checked status
            item.checked = false;
            return item;
        });
        this.setState({source, tempSelected: [], selected});
        this.selectedChange(selected, 'right', tempSelected);
    }

    toLeft (){
        let {source, selected, tempSource} = this.state;
        tempSource = [...tempSource];
        let tempSourceNames = tempSource.map(item => item.diskname);
        selected = [...selected].filter(item => !tempSourceNames.includes(item.diskname));
        source = [...source].concat(tempSource).map(item => {
            item.checked = false;
            return item;
        });
        this.setState({source, selected, tempSource: []});
        this.selectedChange(selected, 'left', tempSource);
    }

    selectedChange (selected){
        // whenever click right or left button, call this function
        // call the function that pass in, and give all the items back which are in right box
        let {onChange} = this.props;
        !!onChange && onChange([...selected]);
        console.info(selected);
    }

    render (){
        let {
            source, // all items in left box，the same with dataSource on initial time
            tempSelected, // selected item in left box, ready to be dropped into right box
            selected, // all item in right box
            tempSource, // selected items in right box, ready to be dropped into left box
            // from props
            className,
            notFoundContent,
            titles,
            render,
            footer,
        } = this.state;

        return (
            <div className={`ant-transfer ${className}`}>
                <div className="ant-transfer-list ant-transfer-list-with-footer">
                    <div className="ant-transfer-list-header">
                        <Checkbox
                            indeterminate={!!tempSelected.length && (tempSelected.length < source.length)}
                            checked={!!source.length && (tempSelected.length === source.length)}
                            onChange={this.allSourceSelect.bind(this)}
                        />
                        <span>{tempSelected.length} {lang('项', 'Items')}</span>
                        <span className="ant-transfer-list-header-title">
                            {titles[0]}
                        </span>
                    </div>
                    <div className="ant-transfer-list-body">
                        <ul className="ant-transfer-list-content">
                            {!!source.length ?
                                source.map((data, i) => {
                                    let {title, label} = render(data);
                                    return (
                                        <div className="LazyLoad is-visible" key={i}>
                                            <li
                                                className="ant-transfer-list-content-item"
                                                onClick={this.oneSourceSelect.bind(this, data, i, {target: {checked: !data.checked}})}
                                            >
                                                <Checkbox
                                                    checked={!!data.checked}
                                                    onChange={this.oneSourceSelect.bind(this, data, i)}
                                                />
                                                <span title={title}>
                                                {label}
                                            </span>
                                            </li>
                                        </div>
                                    );
                                }) :
                                <span>{!selected.length && notFoundContent}</span>
                            }
                        </ul>
                    </div>
                    <div className="ant-transfer-list-footer">

                    </div>
                </div>
                <div className="ant-transfer-operation">
                    <Button
                        type="primary" icon="right"
                        disabled={!tempSelected.length}
                        onClick={this.toRight.bind(this)}
                    />
                    <Button
                        type="primary" icon="left"
                        disabled={!tempSource.length}
                        onClick={this.toLeft.bind(this)}
                    />
                </div>
                <div className="ant-transfer-list ant-transfer-list-with-footer">
                    <div className="ant-transfer-list-header">
                        <Checkbox
                            indeterminate={!!tempSource.length && (tempSource.length < selected.length)}
                            checked={!!selected.length && (tempSource.length === selected.length)}
                            onChange={this.allUnSelect.bind(this)}
                        />
                        <span>{tempSource.length} {lang('项', 'Items')}</span>
                        <span className="ant-transfer-list-header-title">
                            {titles[1]}
                        </span>
                    </div>
                    <div className="ant-transfer-list-body">
                        <ul className="ant-transfer-list-content">
                            {selected.map((data, i) => {
                                let {title, label} = render(data);
                                return (
                                    <div className="LazyLoad is-visible" key={i}>
                                        <li
                                            className="ant-transfer-list-content-item"
                                            onClick={this.oneSourceSelect.bind(this, data, i, {target: {checked: !data.checked}})}
                                        >
                                            <Checkbox
                                                checked={!!data.checked}
                                                onChange={this.oneUnSelect.bind(this, data, i)}
                                            />
                                            <span title={title}>
                                            {label}
                                        </span>
                                        </li>
                                    </div>
                                );
                            })}
                        </ul>
                    </div>
                    {
                        footer ?
                            <div className="ant-transfer-list-footer">
                                {footer()}
                            </div>
                            : null
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

export default connect(mapStateToProps)(FSTransfer);

// onChange callback function: (nextTargetItems, direction, moveItems): void