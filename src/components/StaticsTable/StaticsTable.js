import React, {Component} from 'react';
import QueueAnim from 'rc-queue-anim';

export default class StaticsTable extends Component {
    constructor (props){
        super(props);
        this.state = {
            headerRowItems: ['ip', 'sum', 'rm', 'cp', 'bb', 'xx', 'aa', 'ss', 'cc', 'oo'],
            bodyRows: [
                {ip: '192.168.100.190', sum: {value: 1, id: 123}, rm: {value: 1, id: 123}, cp: {value: 1, id: 123}, bb: {value: 1, id: 123}, xx: {value: 1, id: 123}, aa: {value: 1, id: 123}, ss: {value: 1, id: 123}, cc: {value: 1, id: 123}, oo: {value: 1, id: 123}},
                {ip: '192.168.100.191', sum: {value: 1, id: 123}, rm: {value: 1, id: 123}, cp: {value: 1, id: 123}, bb: {value: 1, id: 123}, xx: {value: 1, id: 123}, aa: {value: 1, id: 123}, ss: {value: 1, id: 123}, cc: {value: 1, id: 123}, oo: {value: 1, id: 123}},
                {ip: '192.168.100.192', sum: {value: 1, id: 123}, rm: {value: 1, id: 123}, cp: {value: 1, id: 123}, bb: {value: 1, id: 123}, xx: {value: 1, id: 123}, aa: {value: 1, id: 123}, ss: {value: 1, id: 123}, cc: {value: 1, id: 123}, oo: {value: 1, id: 123}},
                {ip: '192.168.100.193', sum: {value: 1, id: 123}, rm: {value: 1, id: 123}, cp: {value: 1, id: 123}, bb: {value: 1, id: 123}, xx: {value: 1, id: 123}, aa: {value: 1, id: 123}, ss: {value: 1, id: 123}, cc: {value: 1, id: 123}, oo: {value: 1, id: 123}},
            ]
        };
    }

    render (){
        return (
            <section className="fs-statics-table-wrapper">
                <QueueAnim className="fs-statics-table-row header">
                    {
                        this.state.headerRowItems.map((item, i) => <div className="fs-statics-table-item header" key={i}>
                            {item}
                        </div>)
                    }
                </QueueAnim>
                <QueueAnim className="fs-statics-table-body-wrapper">
                    {
                        this.state.bodyRows.map((row, y) => <div className="fs-statics-table-row body" key={y}>
                            {
                                Object.keys(row).map((key, x) => <div className="fs-statics-table-item body" key={x}>
                                    {row[key].value || row[key]}
                                </div>)
                            }
                        </div>)
                    }
                </QueueAnim>
            </section>
        );
    }
}