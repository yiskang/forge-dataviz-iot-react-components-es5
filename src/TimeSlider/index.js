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
import { ChronosTimeSlider } from 'forge-dataviz-iot-react-components';
import { TimeOptions } from '../TimeOptions';
import {
    isSupportedTimeResolution
} from '../TimeResolutions';

/**
 *  The time slider react wrapper based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/ChronosTimeSlider.jsx.
 * @class
 */
class DataVizChronosTimeSlider extends React.Component {
    /**
     * @param {Object} props
     * @param {TimeOptions} props.timeOptions The option for time slice selection in the timeline object.
     * @param {String} props.dataStart The earliest start date (in ISO string format) for the slider.
     * @param {String} props.dataEnd The latest end date (in ISO string format) for the slider.
     * @param {Function} props.handleTimeRangeUpdated A callback
     * &nbsp;function to be invoked when the time selection is updated
     * @param {Function} props.handleCurrentTimeUpdated A callback
     * &nbsp;handler invoked when the current time marker is updated without
     * &nbsp;changing the time selection.
     * @constructor
     */
    constructor(props) {
        super(props);

        this.state = {
            startRange: props.startRange,
            endRange: props.endRange,
            startTime: props.startTime,
            endTime: props.endTime,
            currentTime: props.currentTime,
            resolution: props.resolution
        };
    }

    render() {
        let {
            startRange,
            endRange,
            startTime,
            endTime,
            currentTime,
            resolution
        } = this.state;

        let {
            onTimeRangeUpdated,
            onCurrentTimeUpdated
        } = this.props;

        return (
            <ChronosTimeSlider
                rangeStart={startRange.toISOString()}
                rangeEnd={endRange.toISOString()}
                startTime={new Date(startTime.getTime())}
                endTime={new Date(endTime.getTime())}
                currentTime={currentTime ? new Date(currentTime.getTime()) : null}
                resolution={resolution || 'PT1H'}
                onTimeRangeUpdated={onTimeRangeUpdated}
                onCurrTimeUpdated={onCurrentTimeUpdated}
            />
        );
    }
}

/**
 * Events
 */
const TIME_SLIDER_CONTROL_INITIALIZED_EVENT = 'timeSliderControlInitializedEvent';
const TIME_SLIDER_CONTROL_TIME_RANGE_UPDATED_EVENT = 'timeSliderControlTimeRangeUpdatedEvent';
const TIME_SLIDER_CONTROL_CURRENT_TIME_UPDATED_EVENT = 'timeSliderControlCurrentTimeUpdatedEvent';
const TIME_SLIDER_CONTROL_VISIBILITY_CHANGED_EVENT = 'timeSliderControlVisibilityChangedEvent';

/**
 * The time slider component based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/ChronosTimeSlider.jsx.
 * @class
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.ChronosTimeSliderControl
 */
class ChronosTimeSliderControl extends THREE.EventDispatcher {
    /**
     * @param {HTMLDivElement} container The DOM container holding this control.
     * @param {Object} options
     * @param {TimeOptions} options.timeOptions The option for time slice selection in the timeline object.
     * @param {String} options.dataStart The earliest start date (in ISO string format) for the slider.
     * @param {String} options.dataEnd The latest end date (in ISO string format) for the slider.
     * @param {Function} options.handleTimeRangeUpdated A callback
     * &nbsp;function to be invoked when the time selection is updated
     * @param {Function} options.handleCurrentTimeUpdated A callback
     * &nbsp;handler invoked when the current time marker is updated without
     * &nbsp;changing the time selection.
     * @constructor
     */
    constructor(container, options) {
        super();

        this.container = container;
        this.options = options;

        this.onTimeRangeUpdated = this.onTimeRangeUpdated.bind(this);
        this.onCurrentTimeUpdated = this.onCurrentTimeUpdated.bind(this);
    }

    /**
     * Handles changes on the time slider. The start date and/or end date can
     * be modified by user inputs interactively. This function will be called
     * when such changes happen.
     * @param {Date} startTime The start time for device data fetch call
     * @param {Date} endTime The end time for device data fetch call
     * @param {Date} currentTime The current time at which the TimeMarker is
     */
    onTimeRangeUpdated(startTime, endTime, currentTime) {
        const { handleTimeRangeUpdated } = this.options;
        handleTimeRangeUpdated && handleTimeRangeUpdated(startTime, endTime, currentTime);

        this.dispatchEvent({
            type: TIME_SLIDER_CONTROL_TIME_RANGE_UPDATED_EVENT,
            startTime,
            endTime,
            currentTime
        });
    }

    /**
     * Handles changes of the time slider's time marker. The time marker can be
     * changed interactively by the user when it is dragged within the time window,
     * or during a playback mode of the time slider.
     * @param {Date} currentTime The current time at which the time marker is.
     */
    onCurrentTimeUpdated(currentTime) {
        const { handleCurrentTimeUpdated } = this.options;
        handleCurrentTimeUpdated && handleCurrentTimeUpdated(currentTime);

        this.dispatchEvent({
            type: TIME_SLIDER_CONTROL_CURRENT_TIME_UPDATED_EVENT,
            currentTime
        });
    }

    /**
     * Current resolution of data.
     * @type {string}
     */
    get resolution() {
        if (!this.instance) return;

        return this.instance.state.resolution;
    }

    /**
     * Current resolution of data. Ex. PT1H, PT15M etc.
     * @param {string} value Time resolution value
     */
    set resolution(value) {
        if (!this.instance) return;

        if (!isSupportedTimeResolution(value))
            throw new Error(`Unsupported time resolution \`${value}\`. Please get resolution value from \`Autodesk.DataVisualization.UI.getSupportedTimeResolutions()\`.`);

        let newData = { resolution: value };
        this.options.timeOptions = Object.assign({}, this.options.timeOptions, newData);

        this.instance.setState(newData);
    }

    /**
     * Show timeslider control
     */
    show() {
        this.container.style.display = 'block';

        this.dispatchEvent({
            type: TIME_SLIDER_CONTROL_VISIBILITY_CHANGED_EVENT,
            visible: true
        });
    }

    /**
     * Hide timeslider control
     */
    hide() {
        this.container.style.display = 'none';

        this.dispatchEvent({
            type: TIME_SLIDER_CONTROL_VISIBILITY_CHANGED_EVENT,
            visible: false
        });
    }

    /**
    * Update time change.
    * @param {Date} startTime The start time for device data fetch call
    * @param {Date} endTime The end time for device data fetch call
    * @param {Date} currentTime The current time at which the TimeMarker is
    */
    updateTimeRange(startTime, endTime, currentTime) {
        if (!this.instance) return;

        if (startTime == this.instance.state.startTime) return;
        if (endTime == this.instance.state.endTime) return;

        this.instance.setState({
            startTime,
            endTime,
            currentTime
        },
            () => {
                this.onTimeRangeUpdated(startTime, endTime, currentTime);
            });
    }

    initialize() {
        const { timeOptions } = this.options;

        // if (!(timeOptions instanceof TimeOptions))
        //     throw new Error(`Invalid input \`options.timeOptions\`. They should be a type of \`Autodesk.DataVisualization.UI.TimeOptions\`.`);

        if (!timeOptions.startTime || !timeOptions.endTime)
            throw new Error(`Invalid input \`options.timeOptions.startTime\` or \`options.timeOptions.endTime\`. They should be a type of \`Date\`.`);

        if (!this.container || !(this.container instanceof HTMLDivElement))
            throw new Error(`Invalid input \`container\`. They should be a type of \`HTMLDivElement\`.`);

        // End Range for timeslider
        let endRange = new Date(new Date().getTime() + 7 * 60 * 60 * 1000 * 24);
        let startRange = new Date('2020-01-01T00:00:00Z');

        /**
         * Configure default start/end date to be ranging from two weeks
         * in the past, to tomorrow. Also the current time to be now.
         */
        let currDate = new Date();
        currDate.setUTCHours(0, 0, 0, 0);
        let endDate = new Date(currDate.getTime() + 1 * 24 * 60 * 60 * 1000);
        endDate.setUTCHours(0, 0, 0, 0);
        let startDate = new Date(currDate.getTime() - 14 * 24 * 60 * 60 * 1000);
        startDate.setUTCHours(0, 0, 0, 0);

        if (this.options.dataStart && this.options.dataEnd) {
            let dataStart = new Date(this.options.dataStart.getTime());
            let dataEnd = new Date(this.options.dataEnd.getTime());
            startRange.setTime(dataStart.getTime());
            endRange.setTime(dataEnd.getTime());

            if (
                startDate.getTime() < startRange.getTime() ||
                startDate.getTime() >= endRange.getTime()
            ) {
                startDate.setTime(startRange.getTime());
            }

            if (endDate.getTime() <= startRange.getTime() || endDate.getTime() >= endRange.getTime()) {
                endDate.setTime(endRange.getTime());
            }

            if (
                currDate.getTime() <= startRange.getTime() ||
                currDate.getTime() >= endRange.getTime()
            ) {
                currDate.setTime(endRange.getTime());
            }

            // give it a little bit buffer to make the range selection visible
            startRange.setTime(dataStart.getTime() - 2 * 60 * 60 * 24 * 1000);
            endRange.setTime(dataEnd.getTime() + 2 * 60 * 60 * 24 * 1000);
        }

        this.instance = ReactDOM.render(
            <DataVizChronosTimeSlider
                startRange={startRange}
                endRange={endRange}
                startTime={new Date(timeOptions.startTime.getTime())}
                endTime={new Date(timeOptions.endTime.getTime())}
                currentTime={timeOptions.currentTime ? new Date(timeOptions.currentTime.getTime()) : null}
                resolution={timeOptions.resolution || 'PT1H'}
                onTimeRangeUpdated={this.onTimeRangeUpdated}
                onCurrentTimeUpdated={this.onCurrentTimeUpdated}
            />,
            this.container,
            () => {
                this.dispatchEvent({
                    type: TIME_SLIDER_CONTROL_INITIALIZED_EVENT,
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

ns.ChronosTimeSliderControl = ChronosTimeSliderControl;
ns.TIME_SLIDER_CONTROL_INITIALIZED_EVENT = TIME_SLIDER_CONTROL_INITIALIZED_EVENT;
ns.TIME_SLIDER_CONTROL_TIME_RANGE_UPDATED_EVENT = TIME_SLIDER_CONTROL_TIME_RANGE_UPDATED_EVENT;
ns.TIME_SLIDER_CONTROL_CURRENT_TIME_UPDATED_EVENT = TIME_SLIDER_CONTROL_CURRENT_TIME_UPDATED_EVENT;
ns.TIME_SLIDER_CONTROL_VISIBILITY_CHANGED_EVENT = TIME_SLIDER_CONTROL_VISIBILITY_CHANGED_EVENT;

export {
    ChronosTimeSliderControl
};