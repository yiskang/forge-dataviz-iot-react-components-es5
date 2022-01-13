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
import { HeatmapOptions } from 'forge-dataviz-iot-react-components';
import {
    isSupportedTimeResolution
} from '../TimeResolutions';

/**
 *  The heatmap options react wrapper based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/HeatmapOptions.jsx.
 * @class
 */
class DataVizHeatmapOptions extends React.Component {
    /**
     * @param {Object} props
     * @param {string} props.selectedPropertyId The property id, if any is selected
     * @param {Object.<string, number[]>} props.propIdGradientMap The mapping of property
     * IDs to their corresponding gradient color values.
     * @param {GetPropertyRanges} props.getPropertyRanges The function to get the selected property's range and dataUnit
     * @param {number} props.totalMarkers The total number of slider markers
     * @param {string} props.resolutionValue The value for resolution. Ex. PT1H, PT15M etc.
     * @param {boolean} props.showHeatMap Flag to show/hide heatmap
     * @param {OnHeatMapOptionChange} props.onHeatMapOptionChange A callback function invoked when any combination of
     * &nbsp;resolutionValue, selectedPropertyId, and showHeatMap are changed.
     * @param {Map.<string, DeviceProperty>} props.deviceModelProperties  Map of all the properties across all devicesModels in a {@link DataStore} object.
     * @constructor
     */
    constructor(props) {
        super(props);

        this.state = {
            selectedPropertyId: props.selectedPropertyId,
            resolutionValue: props.resolutionValue,
            showHeatMap: props.showHeatMap,

            // totalMarkers: props.totalMarkers,
            // propIdGradientMap: props.propIdGradientMap,
            // getPropertyRanges: props.getPropertyRanges,
            // deviceModelProperties: props.deviceModelProperties,
            // onHeatMapOptionChange: props.onHeatMapOptionChange
        };

        this.onOptionsChange = this.onOptionsChange.bind(this);
    }

    onOptionsChange(event) {
        this.setState(event, () => {
            if (this.props.onHeatMapOptionChange) {
                this.props.onHeatMapOptionChange(event);
            }
        });
    }

    render() {
        let {
            selectedPropertyId,
            resolutionValue,
            showHeatMap
        } = this.state;

        let {
            totalMarkers,
            propIdGradientMap,
            deviceModelProperties,
            getPropertyRanges
        } = this.props;

        return (
            <HeatmapOptions
                selectedPropertyId={selectedPropertyId}
                resolutionValue={resolutionValue}
                showHeatMap={showHeatMap}

                propIdGradientMap={propIdGradientMap}
                deviceModelProperties={deviceModelProperties}
                totalMarkers={totalMarkers}

                onHeatmapOptionChange={this.onOptionsChange}
                getPropertyRanges={getPropertyRanges}
            />
        );
    }
}

/**
 * Events
 */
const HEATMAP_OPTIONS_CONTROL_INITIALIZED_EVENT = 'heatmapOptionsControlInitializedEvent';
const HEATMAP_OPTIONS_CONTROL_STATE_CHANGED_EVENT = 'heatmapOptionsControlStateChangedEvent';
const HEATMAP_OPTIONS_CONTROL_VISIBILITY_CHANGED_EVENT = 'heatmapOptionsControlVisibilityChangedEvent';

/**
 * The heatmap options react wrapper based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/HeatmapOptions.jsx.
 * @class
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.HeatmapOptionsControlControl
 */
class HeatmapOptionsControlControl extends THREE.EventDispatcher {
    /**
     * @param {HTMLDivElement} container The DOM container holding this control.
     * @param {Object} options
     * @param {Object.<string, number[]>} options.propIdGradientMap The mapping of property
     * IDs to their corresponding gradient color values.
     * @param {GetPropertyRanges} options.getPropertyRanges The function to get the selected property's range and dataUnit
     * @param {number} options.totalMarkers The total number of slider markers
     * @param {string} options.resolutionValue The value for resolution. Ex. PT1H, PT15M etc.
     * @param {Map.<string, DeviceProperty>} options.deviceModelProperties  Map of all the properties across all devicesModels in a {@link DataStore} object.
     * @constructor
     */
    constructor(container, options) {
        super();

        this.container = container;
        this.options = options;

        this.onOptionsChanged = this.onOptionsChanged.bind(this);
    }

    onOptionsChanged(event) {
        this.dispatchEvent({
            type: HEATMAP_OPTIONS_CONTROL_STATE_CHANGED_EVENT,
            ...event
        });
    }

    /**
     * Get current time resolution. Ex. PT1H, PT15M etc.
     * @type {string}
     */
    get timeResolution() {
        if (!this.instance) return;

        return this.instance.state.resolutionValue;
    }

    /**
     * Set current time resolution.
     * @param {string} value The time resolution. Ex. PT1H, PT15M etc.
     */
    set timeResolution(value) {
        if (!this.instance) return;

        if (!isSupportedTimeResolution(value))
            throw new Error(`Unsupported time resolution \`${value}\`. Please get resolution value from \`Autodesk.DataVisualization.UI.getSupportedTimeResolutions()\`.`);

        this.instance.setState({
            resolutionValue: value
        },
            () => {
                this.onOptionsChanged(this.instance.state);
            });
    }

    /**
     * Get currently selected property type id. Ex. Temperature, Humidity, CO₂ and etc.
     * @type {string}
     */
    get selectedPropertyTypeId() {
        if (!this.instance) return;

        return this.instance.state.selectedPropertyId;
    }

    /**
     * Set currently selected property type id.
     * @param {string} value The value for property type id. Ex. Temperature, Humidity, CO₂ and etc.
     */
    set selectedPropertyTypeId(value) {
        if (!this.instance) return;

        if (!this.isSupportedPropertyTypeId(value))
            throw new Error(`Unsupported property type id \`${value}\`. Please get supported values from \`HeatmapOptionsControlControl#getSupportedPropertyTypeIds()\`.`);

        this.instance.setState({
            selectedPropertyId: value
        },
            () => {
                this.onOptionsChanged(this.instance.state);
            });
    }

    /**
     * Get supported property type ids.
     * @returns {string[]}
     */
    getSupportedPropertyTypeIds() {
        return  Array.from(Object.keys(this.options.propIdGradientMap));
    }

    /**
     * Check if input id is a supported property type ids by this control.
     * @param {string} id property type id.
     * @returns False if the input id is not supported.
     */
    isSupportedPropertyTypeId(id) {
        const supportedPropertyTypeIds = this.getSupportedPropertyTypeIds();
        return supportedPropertyTypeIds.includes(id);
    }

    /**
     * Show heatmap control
     */
    show() {
        this.container.style.display = 'block';

        this.dispatchEvent({
            type: HEATMAP_OPTIONS_CONTROL_VISIBILITY_CHANGED_EVENT,
            visible: true
        });
    }

    /**
     * Hide heatmap control
     */
    hide() {
        this.container.style.display = 'none';

        this.dispatchEvent({
            type: HEATMAP_OPTIONS_CONTROL_VISIBILITY_CHANGED_EVENT,
            visible: false
        });
    }

    /**
     * Toggle visibility of the heatmap.
     */
    toggleHeatmap() {
        if (!this.instance) return;

        this.instance.setState({
            showHeatMap: !Boolean(this.instance.state.showHeatMap)
        },
            () => {
                this.onOptionsChanged(this.instance.state);
            });
    }

    initialize() {
        let {
            resolutionValue,
            propIdGradientMap,
            deviceModelProperties,
            totalMarkers,
            getPropertyRanges
        } = this.options;

        let selectedPropertyId = Array.from(Object.keys(propIdGradientMap))[0] || '';

        this.instance = ReactDOM.render(
            <DataVizHeatmapOptions
                selectedPropertyId={selectedPropertyId}
                resolutionValue={resolutionValue || 'PT1H'}
                showHeatMap={true}

                propIdGradientMap={propIdGradientMap}
                deviceModelProperties={deviceModelProperties}
                totalMarkers={totalMarkers || 4}

                getPropertyRanges={getPropertyRanges}
                onHeatMapOptionChange={this.onOptionsChanged}
            />,
            this.container,
            () => {
                this.dispatchEvent({
                    type: HEATMAP_OPTIONS_CONTROL_INITIALIZED_EVENT,
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

ns.HeatmapOptionsControlControl = HeatmapOptionsControlControl;
ns.HEATMAP_OPTIONS_CONTROL_INITIALIZED_EVENT = HEATMAP_OPTIONS_CONTROL_INITIALIZED_EVENT;
ns.HEATMAP_OPTIONS_CONTROL_STATE_CHANGED_EVENT = HEATMAP_OPTIONS_CONTROL_STATE_CHANGED_EVENT;
ns.HEATMAP_OPTIONS_CONTROL_VISIBILITY_CHANGED_EVENT = HEATMAP_OPTIONS_CONTROL_VISIBILITY_CHANGED_EVENT;

export {
    HeatmapOptionsControlControl
}