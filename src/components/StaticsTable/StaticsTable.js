import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Icon} from 'antd';
import QueueAnim from 'rc-queue-anim';
import lang from '../../components/Language/lang';

class StaticsTable extends Component {
    constructor (props){
        super(props);
        let {filter, data} = props;
        this.state = {
            header: filter,
            rows: this.filterRows(filter, data),
            /*
            [
                {ip: '192.168.100.190', sum: {value: 1, id: 123}, rm: {value: 1, id: 123}, cp: {value: 1, id: 123}, bb: {value: 1, id: 123}, xx: {value: 1, id: 123}, aa: {value: 1, id: 123}, ss: {value: 1, id: 123}, cc: {value: 1, id: 123}, oo: {value: 1, id: 123}},
                {ip: '192.168.100.191', sum: {value: 1, id: 123}, rm: {value: 1, id: 123}, cp: {value: 1, id: 123}, bb: {value: 1, id: 123}, xx: {value: 1, id: 123}, aa: {value: 1, id: 123}, ss: {value: 1, id: 123}, cc: {value: 1, id: 123}, oo: {value: 1, id: 123}},
                {ip: '192.168.100.192', sum: {value: 1, id: 123}, rm: {value: 1, id: 123}, cp: {value: 1, id: 123}, bb: {value: 1, id: 123}, xx: {value: 1, id: 123}, aa: {value: 1, id: 123}, ss: {value: 1, id: 123}, cc: {value: 1, id: 123}, oo: {value: 1, id: 123}},
                {ip: '192.168.100.193', sum: {value: 1, id: 123}, rm: {value: 1, id: 123}, cp: {value: 1, id: 123}, bb: {value: 1, id: 123}, xx: {value: 1, id: 123}, aa: {value: 1, id: 123}, ss: {value: 1, id: 123}, cc: {value: 1, id: 123}, oo: {value: 1, id: 123}},
            ],
            */
            stickRows: []
        };
    }

    componentWillReceiveProps (nextProps){
        let {filter, data} = nextProps;
        let rows = this.filterRows(filter, data);
        this.setState({rows: rows});
    }

    filterRows (filter, data){
        let rows = [];
        data.forEach(row => {
            let newRow = {};
            filter.forEach(key => newRow[key] = row[key] || 0);
            rows.push(newRow);
        });
        return rows;
    }

    stick (row){
        // add it into stick rows
        let stickRows = Object.assign([], this.state.stickRows);
        row = Object.assign({}, row);
        row['_index'] = Date.now();
        stickRows.push(row);
        // remove it from normal rows
        let {ip} = row;
        let rows = this.state.rows.filter(row => row.ip !== ip);
        // re-render
        this.setState({rows, stickRows});
    }

    unStick (row){
        let stickRows = this.state.stickRows.filter(stickRow => stickRow._index !== row._index);
        this.setState({stickRows});
    }

    render (){
        return (
            <section className="fs-statics-table-wrapper">
                <QueueAnim type={['right', 'left']} delay={100}>
                    <div className="fs-statics-table-row header" key={1}>
                        {
                            this.state.header.map((item, i) => <div className="fs-statics-table-item header" key={i}>
                                {i === 0 && this.props.relaceFirstItem ? this.props.relaceFirstItem : item}
                            </div>)
                        }
                        <div className="fs-statics-table-item header stick" key={99} />
                    </div>
                </QueueAnim>
                <QueueAnim className="fs-statics-table-body-wrapper stick" type={['left', 'right']} delay={300}>
                    {
                        this.state.stickRows.map((row, y) => <div className="fs-statics-table-row body" key={y}>
                            {
                                Object.keys(row).filter(key => key !== '_index').map((key, x) => <div className="fs-statics-table-item body" key={x}>
                                    {key === 'ip' ? row[key] : row[key].value}
                                </div>)
                            }
                            <div className="fs-statics-table-item body un-stick" key={99}>
                                <Icon type="pushpin-o" title={lang('移除钉住', 'Un-pushpin')} onClick={() => {this.unStick.bind(this, row)()}} />
                            </div>
                        </div>)
                    }
                </QueueAnim>
                <QueueAnim className="fs-statics-table-body-wrapper" type={['left', 'right']} delay={300}>
                    {
                        this.state.rows.map((row, y) => <div className="fs-statics-table-row body" key={y}>
                            {
                                Object.keys(row).map((key, x) => <div className="fs-statics-table-item body" key={x}>
                                    {key === 'ip' ? row[key] : row[key].value}
                                </div>)
                            }
                            <div className="fs-statics-table-item body stick" key={99}>
                                <Icon type="pushpin" title={lang('钉住', 'Pushpin')} onClick={() => {this.stick.bind(this, row)()}} />
                            </div>
                        </div>)
                    }
                    {
                        this.state.rows.length === 0 && <div className="fs-statics-table-row no-io" key={99}>
                            <div className="fs-statics-table-item body">
                                {lang('无 I/O 发生', 'No I/O happened')}
                            </div>
                        </div>
                    }
                </QueueAnim>
            </section>
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

export default connect(mapStateToProps, [], mergeProps)(StaticsTable);