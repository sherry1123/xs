import React from "react";
import {render} from "react-dom";
import App from "./views/index";

import "./styleSheets/index.less";
render(
    <App/>,
    document.getElementById('container')
);