import React, {Component} from 'react';
import lang from '../Language/lang';

export default class RAIDConfiguration extends Component {
    render (){
       return (
           <section className="fs-raid-config-wrapper">
               <div className="fs-raid-config-description">
                   {lang('说明：请先选择节点，再选择RAID级别，然后该该节点中要进行RAID配置的盘放入容器中，然后点击应用。一旦启用配置，请以此方式配置完所有的元数据和存储节点。',
                       '')
                   }
               </div>
           </section>
       );
    }
}