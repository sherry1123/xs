import React, {Component} from 'react';
import PhysicalNodeInfo from './PhysicalNodeInfo';
import PhysicalNodeCPU from './PhysicalNodeCPU';
import PhysicalNodeDRAM from './PhysicalNodeDRAM';
import PhysicalNodeTPS from './PhysicalNodeTPS';
import PhysicalNodeIOPS from './PhysicalNodeIOPS';
import PhysicalNodeTargetList from './PhysicalNodeTargetList';
import httpRequests from '../../http/requests';
import {connect} from "react-redux";

class DataNode extends Component {
    constructor (props){
        super(props);
        let {menuExpand} = this.props;
        let contentWidth = this.calculateContentWidth(menuExpand);
        this.state = {
            contentWidth,
        };
    }

    componentDidMount (){
        httpRequests.getClusterPhysicalNodeList();
        httpRequests.getPhysicalNodeInfo();
        httpRequests.getPhysicalNodeTargets();
        httpRequests.getPhysicalNodeCPU();
        httpRequests.getPhysicalNodeDRAM();
        httpRequests.getPhysicalNodeTPS();
        httpRequests.getPhysicalNodeIOPS();
        // bind a listener to capture the resize event of window, and change the width of content
        // to let charts resize themselves follow this width
        window.addEventListener('resize', this.resizeContentWidth.bind(this));
    }

    componentWillUnmount (){
        window.removeEventListener('resize', this.resizeContentWidth.bind(this));
    }

    resizeContentWidth (){
        let {menuExpand} = this.props;
        let contentWidth = this.calculateContentWidth(menuExpand);
        this.setState({contentWidth});
    }

    calculateContentWidth (menuExpand){
        let {offsetWidth} = document.body;
        return menuExpand ? offsetWidth - 200 - 20 : offsetWidth - 46 - 20;
        /**
         * The number description is as follows:
         *
         * 200px is the width when left menu is in the state of expansion
         * 40px is the width when left menu is in the state of shrinkage
         * 20px is the lef-padding + right-padding of fs-content-wrapper
         *
         * These numbers mentioned above are based on what we set in sideBar.less and dashboard.less, if change them in these files,
         * should change them here too.
         *
         * Why we do this here?
         *
         * On dashboard page, there's only one fs-dashboard-row, so no one else will widen the width of fs-page-content,
         * so it can adaptive the width by itself when menu expand or shrink action happens, then take effect on fs-dashboard-row,
         * and then make this effect extend to fs-page-content. (Since this testing is done on WebKit core browsers, and it doesn't
         * represent a wide range of test results. So, if some browsers' composing engines don't fit to this policy, maybe we should
         * make this layout logic successful by following this way, see it below.)
         *
         * But for here, a two chart rows situation. When one chart row adaptive width, another one is keeping the original width,
         * and keeping widening the width of fs-dashboard-row. So the first adaptive width action will follow the original width
         * of fs-page-content, and will take no effect absolutely, all items will layout with its original width.
         * So we do a calculation to force the fs-dashboard-row to layout with a right width based on menu's current state and the size of window.
         */
    }

    render (){
        return (
            <div
                className="fs-page-content fs-dashboard-wrapper"
                style={{width: this.state.contentWidth}}
            >
                <PhysicalNodeInfo />
                <div className="fs-dashboard-row">
                    <PhysicalNodeCPU />
                    <PhysicalNodeDRAM />
                </div>
                <div className="fs-dashboard-row">
                    <PhysicalNodeTPS />
                    <PhysicalNodeIOPS />
                </div>
                <div className="fs-dashboard-row">
                    <PhysicalNodeTargetList />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    let {language, main: {general: {menuExpand}}} = state;
    return {language, menuExpand};
};

export default connect(mapStateToProps)(DataNode);