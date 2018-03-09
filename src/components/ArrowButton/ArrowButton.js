import React, {Component} from 'react';
import {Icon} from 'antd';

export default class ArrowButton extends Component {
    constructor (props){
        super(props);
        // support ['left', 'right'] or ['top', 'down'] for horizontally & vertically display
        let {directionRange = ['left', 'right'], direction, switchDirection = false} = this.props;
        this.state = {
            directionRange,
            direction: direction || directionRange[0],
            destination: directionRange.includes('right') ? 'right' : 'down',
            switchDirection
        }
    }

    switchDirection (){
        if (this.state.switchDirection){
            let direction = this.state.directionRange.filter(dire => dire !== this.state.direction)[0];
            setTimeout(() => this.setState({direction}), 400);
        }
        this.props.onClick && this.props.onClick();
    }

    render (){
        let {style, title} = this.props;
        let {direction, destination} = this.state;
        let positive = direction === destination;
        return (
            <span className="fs-arrow-button-wrapper" onClick={this.switchDirection.bind(this)} title={title} style={style}>
                <Icon className={`fs-arrow-${positive ? 1 : 3}`} type={this.state.direction} />
                <Icon className={`fs-arrow-2`} type={this.state.direction} />
                <Icon className={`fs-arrow-${positive ? 3 : 1}`} type={this.state.direction} />
            </span>
        );
    }
}