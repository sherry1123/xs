import React, {Component} from 'react';
import {Icon} from 'antd';

export default class ArrowButton extends Component {
    constructor (props){
        super(props);
        // support ['left', 'right'] or ['up', 'down'] for horizontally or vertically display
        let {directionRange = ['left', 'right'], direction} = this.props;
        this.state = {
            directionRange,
            direction: direction || directionRange[0],
        }
    }

    switchDirection (){
        let direction = this.state.directionRange.filter(dire => dire !== this.state.direction)[0];
        setTimeout(() => this.setState({direction}), 400);
        this.props.onClick && this.props.onClick();
    }

    render (){
        let {style, title} = this.props;
        let {direction, directionRange} = this.state;
        let positive = direction === directionRange[0];
        return (
            <span className="fs-arrow-button-wrapper" onClick={this.switchDirection.bind(this)} title={title} style={style}>
                <Icon className={`fs-arrow-${positive ? 3 : 1}`} type={this.state.direction} />
                <Icon className={`fs-arrow-2`} type={this.state.direction} />
                <Icon className={`fs-arrow-${positive ? 1 : 3}`} type={this.state.direction} />
            </span>
        );
    }
}