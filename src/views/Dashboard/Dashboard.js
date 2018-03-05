import React, {Component} from 'react';
import {connect} from 'react-redux';
import lang from '../../components/Language/lang';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    componentWillUnmount (){

    }

    render () {
        return (
            <section className="fs-page-content fs-dashboard-wrapper">
                <section className="fs-page-item-wrapper fs-cluster-monitor-wrapper">
                    <h3 className="fs-page-title item">{lang('集群监控', 'Cluster Monitor')}</h3>
                    <section className="fs-page-item-content fs-cluster-monitor-content">
                        <div className="fs-cluster-throughput-wrapper">

                        </div>
                        <div className="fs-cluster-iops-delay-wrapper">

                        </div>
                    </section>
                    <section className="fs-page-item-content fs-cluster-monitor-content">

                    </section>
                </section>
            </section>
        )
    }
}

const mapStateToProps = state => {
    const {language} = state;
    return {language};
};

export default connect(mapStateToProps)(Dashboard);