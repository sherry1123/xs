import React, {PureComponent} from 'react';

export default class RollingBack extends PureComponent {
    render (){
        // 这里需要一个回滚中的背景图
        return (
            <div className="fs-page-content fs-error-wrapper">
                <section className="fs-error-content">
                    <div className="fs-error-img" />
                    <p>roll backing</p>
                </section>
            </div>
        );
    }
}