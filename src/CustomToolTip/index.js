//
// Copyright 2021 Autodesk
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import React from 'react';
import ReactDOM from 'react-dom';
import { CustomToolTip } from 'forge-dataviz-iot-react-components';

/**
 * The CustomToolTip react wrapper based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/CustomToolTip.jsx
 * @class
 */
class DataVizTooltip extends React.Component {
    /**
     * @param {Object} props
     * @param {HoveredDeviceInfo} props.hoveredDeviceInfo Object containing the id and (x,y) canvas coordinates of the
     * &nbsp;device being hovered over.
     * @param {ChartData} props.chartData Data used to generate charts for each property associated with props.hoveredDeviceInfo
     * @param {CurrentDeviceData} props.currentDeviceData Data containing the estimated propertyValue for each property
     * &nbsp;associated with props.hoveredDeviceInfo
     * @constructor
     */
    constructor(props) {
        super(props);

        this.state = {
            hoveredDeviceInfo: props.hoveredDeviceInfo,
            chartData: props.chartData,
            currentDeviceData: props.currentDeviceData
        };
    }

    render() {
        let {
            hoveredDeviceInfo,
            chartData,
            currentDeviceData
        } = this.state;

        return (
            <CustomToolTip
                hoveredDeviceInfo={hoveredDeviceInfo}
                chartData={chartData}
                currentDeviceData={currentDeviceData}
            />
        );
    }
}

/**
 * Events
 */
const TOOLTIP_CONTROL_INITIALIZED_EVENT = 'tooltipControlInitializedEvent';
const TOOLTIP_CONTROL_VISIBILITY_CHANGED_EVENT = 'tooltipControlVisibilityChangedEvent';

/**
 * The CustomToolTip component based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/CustomToolTip.jsx
 * @class
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.CustomTooltipControl
 */
class CustomTooltipControl extends THREE.EventDispatcher {
    /**
     * @param {HTMLDivElement} container The DOM container holding this control.
     * @constructor
     */
    constructor(container) {
        super();

        this.container = container;
        this.instance = null;
    }

    /**
     * True if the tooltip is visible.
     * @returns {boolean}
     */
    get visible() {
        if (!this.instance) return false;

        return (this.instance.state.hoveredDeviceInfo?.id != null);
    }

    /**
     * Show tooltip with given sensor data
     * @param {Object} data
     * @param {HoveredDeviceInfo} data.hoveredDeviceInfo Object containing the id and (x,y) canvas coordinates of the
     * &nbsp;device being hovered over.
     * @param {ChartData} data.chartData Data used to generate charts for each property associated with props.hoveredDeviceInfo
     * @param {CurrentDeviceData} data.currentDeviceData Data containing the estimated propertyValue for each property
     * &nbsp;associated with props.hoveredDeviceInfo
     */
    show(data) {
        if (!this.instance) return;

        this.instance.setState({
            hoveredDeviceInfo: data.hoveredDeviceInfo,
            chartData: data.chartData,
            currentDeviceData: data.currentDeviceData
        },
            () => {
                this.dispatchEvent({
                    type: TOOLTIP_CONTROL_VISIBILITY_CHANGED_EVENT,
                    visible: true
                });
            });
    }

    /**
     * Hide tooltip
     */
    hide() {
        if (!this.instance) return;

        this.instance.setState({
            hoveredDeviceInfo: {},
            chartData: {},
            currentDeviceData: {}
        },
            () => {
                this.dispatchEvent({
                    type: TOOLTIP_CONTROL_VISIBILITY_CHANGED_EVENT,
                    visible: false
                });
            });
    }

    initialize() {
        if (!this.container || !(this.container instanceof HTMLDivElement))
            throw new Error(`Invalid input \`container\`. They should be a type of \`HTMLDivElement\`.`);

        let hoveredDeviceInfo = {};
        let chartData = {};
        let currentDeviceData = {};

        this.instance = ReactDOM.render(
            <DataVizTooltip
                hoveredDeviceInfo={hoveredDeviceInfo}
                chartData={chartData}
                currentDeviceData={currentDeviceData}
            />,
            this.container,
            () => {
                this.dispatchEvent({
                    type: TOOLTIP_CONTROL_INITIALIZED_EVENT,
                    control: this
                });
            });
    }

    uninitialize() {
        this.hide();

        delete this.instance;
        this.instance = null;

        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this.container));
    }
}

const ns = AutodeskNamespace('Autodesk.DataVisualization.UI');

ns.CustomTooltipControl = CustomTooltipControl;
ns.TOOLTIP_CONTROL_INITIALIZED_EVENT = TOOLTIP_CONTROL_INITIALIZED_EVENT;
ns.TOOLTIP_CONTROL_VISIBILITY_CHANGED_EVENT = TOOLTIP_CONTROL_VISIBILITY_CHANGED_EVENT;

export {
    CustomTooltipControl
};