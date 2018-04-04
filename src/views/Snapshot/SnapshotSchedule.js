import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Icon, Modal, Table} from 'antd';
import lang from "../../components/Language/lang";
import {formatStorageSize, timeFormat} from '../../services';

class SnapshotSchedule extends Component {
    delete (name){
        Modal.confirm({
            title: lang(`确定回滚这个自动快照任务吗: ${name} ?`, `Are you sure you want to delete this snapshot schedule: ${name} ?`),
            content: lang('此操作不可恢复', 'You can\'t undo this action'),
            okText: lang('回滚', 'Roll Back'),
            cancelText: lang('取消', 'Cancel'),
            onOk: () => {

            },
            onCancel: () => {

            }
        });
    }

    render (){
        let tableProps = {
            dataSource: [
                {name: 'snapshot_schedule3', autoDelete: true, startTime: 1522851568579, intervalTime: 99999, createTime: 1522761568579},
                {name: 'snapshot_schedule2', autoDelete: true, startTime: 1522841568579, intervalTime: 99999, createTime: 1522754568579},
                {name: 'snapshot_schedule1', autoDelete: true, startTime: 1522821568579, intervalTime: 99999, createTime: 1522750568579},
            ],
            pagination: true,
            rowKey: 'name',
            locale: {
                emptyText: lang('暂无快照', 'No Snapshot')
            },
            columns: [
                {title: lang('名称', 'Name'), width: 125, dataIndex: 'name',},
                {title: lang('大小', 'Size'), width: 120, dataIndex: 'size',
                    render: (text) => formatStorageSize(text)
                },
                {title: lang('创建时间', 'Create Time'), width: 120, dataIndex: 'createTime',
                    render: (text) => timeFormat(text)
                },
                {title: lang('操作', 'Operation'), width: 80,
                    render: (text, record) => (
                        <a title={lang('删除', 'Delete')}
                           onClick={this.delete.bind(this, record.name)}
                           style={{marginLeft: 10}}
                        >
                            <Icon style={{fontSize: 15}} type="delete" />
                        </a>
                    )
                }
            ],
        };
        return (
            <div className="fs-page-content fs-snapshot-wrapper">
                <section className="fs-page-big-title">
                    <h3 className="fs-page-title">{lang('快照', 'Snapshot')}</h3>
                </section>
                <section className="fs-page-item-wrapper">
                    <section className="fs-page-item-content fs-snapshot-list-wrapper">
                        <Button className="fs-create-snapshot-button"
                                size="small"
                                onClick={() => {

                                }}
                        >
                            {lang('创建快照', 'Create Snapshot')}
                        </Button>
                        <Table {...tableProps} />
                    </section>
                </section>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {language,} = state;
    return {language,};
};

export default connect(mapStateToProps)(SnapshotSchedule);