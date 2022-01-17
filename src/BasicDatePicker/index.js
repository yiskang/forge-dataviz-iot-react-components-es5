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
import { BasicDatePicker } from 'forge-dataviz-iot-react-components';
import { TimeOptions } from '../TimeOptions';

/**
 *  The date picker react wrapper based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/BasicDatePicker.jsx.
 * @class
 */
class DataVizBasicDatePicker extends React.Component {
    /**
     * @param {Object} props
     * @param {TimeOptions} props.timeOptions The option for data picker.
     * @param {String} props.startTime The end date for the DatePicker.
     * @param {String} props.endTime The last date the user can select from the DatePicker.
     * @param {Function} props.onTimeRangeUpdated A callback
     * &nbsp;invoked when changes are made to the DatePicker.
     * @constructor
     */
    constructor(props) {
        super(props);

        this.state = {
            startTime: props.startTime,
            endTime: props.endTime
        };
    }

    render() {
        let {
            startTime,
            endTime
        } = this.state;

        let {
            onTimeRangeUpdated
        } = this.props;

        return (
            <BasicDatePicker
                startTime={new Date(startTime.getTime())}
                endTime={new Date(endTime.getTime())}
                onRangeChange={onTimeRangeUpdated}
            />
        );
    }
}

/**
 * Events
 */
const BASIC_DATE_PICKER_CONTROL_INITIALIZED_EVENT = 'basicDatePickerControlInitializedEvent';
const BASIC_DATE_PICKER_CONTROL_TIME_RANGE_UPDATED_EVENT = 'basicDatePickerControlTimeRangeUpdatedEvent';

/**
 * The date picker component based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/BasicDatePicker.jsx.
 * @class
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.BasicDatePickerControl
 */
class BasicDatePickerControl extends THREE.EventDispatcher {
    /**
     * @param {HTMLDivElement} container The DOM container holding this control.
     * @param {Object} options
     * @param {TimeOptions} options.timeOptions The option for time slice selection in the timeline object.
     * @param {String} options.startTime The end date for the DatePicker.
     * @param {String} options.endTime The last date the user can select from the DatePicker.
     * @param {Function} options.handleTimeRangeUpdated A callback
     * &nbsp;invoked when changes are made to the DatePicker.
     * @constructor
     */
    constructor(container, options) {
        super();

        this.container = container;
        this.options = options;

        this.onTimeRangeUpdated = this.onTimeRangeUpdated.bind(this);
    }

    /**
     * Called when a date change occurs in the picker.
     * @param {Date} startTime The start moment of date picked
     * @param {Date} endTime The end end moment of date picked
     */
    onTimeRangeUpdated(startTime, endTime) {
        this.updateTimeRange(startTime, endTime);
    }

    /**
     * Update date change.
     * @param {Date} startTime The start moment of date picked
     * @param {Date} endTime The end end moment of date picked
     */
    updateTimeRange(startTime, endTime) {
        if (!this.instance) return;

        if (startTime == this.instance.state.startTime) return;
        if (endTime == this.instance.state.endTime) return;

        this.instance.setState({
            startTime,
            endTime
        },
            () => {
                const { handleTimeRangeUpdated } = this.options;
                handleTimeRangeUpdated && handleTimeRangeUpdated(startTime, endTime);

                this.dispatchEvent({
                    type: BASIC_DATE_PICKER_CONTROL_TIME_RANGE_UPDATED_EVENT,
                    startTime,
                    endTime
                });
            });
    }

    initialize() {
        const { timeOptions } = this.options;

        if (!timeOptions.startTime || !timeOptions.endTime)
            throw new Error(`Invalid input \`options.timeOptions.startTime\` or \`options.timeOptions.endTime\`. They should be a type of \`Date\`.`);

        if (!this.container || !(this.container instanceof HTMLDivElement))
            throw new Error(`Invalid input \`container\`. They should be a type of \`HTMLDivElement\`.`);

        this.instance = ReactDOM.render(
            <DataVizBasicDatePicker
                startTime={new Date(timeOptions.startTime.getTime())}
                endTime={new Date(timeOptions.endTime.getTime())}
                onTimeRangeUpdated={this.onTimeRangeUpdated}
            />,
            this.container,
            () => {
                this.dispatchEvent({
                    type: BASIC_DATE_PICKER_CONTROL_INITIALIZED_EVENT,
                    control: this
                });
            });
    }

    uninitialize() {
        delete this.instance;
        this.instance = null;

        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this.container));
    }
}

const ns = AutodeskNamespace('Autodesk.DataVisualization.UI');

ns.BasicDatePickerControl = BasicDatePickerControl;
ns.BASIC_DATE_PICKER_INITIALIZED_EVENT = BASIC_DATE_PICKER_CONTROL_INITIALIZED_EVENT;
ns.BASIC_DATE_PICKER_CONTROL_TIME_RANGE_UPDATED_EVENT = BASIC_DATE_PICKER_CONTROL_TIME_RANGE_UPDATED_EVENT;

export {
    BasicDatePickerControl
};