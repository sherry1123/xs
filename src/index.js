import React from "react";
import {render} from "react-dom";
import App from "./views/App";
import "./styleSheets/index.less";

render(
    <App/>,
    document.getElementById('container')
);