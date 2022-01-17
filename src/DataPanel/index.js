//
// Copyright 2021 Autodesk
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import React from 'react';
import ReactDOM from 'react-dom';
import { DataPanelContainer, EventTypes } from 'forge-dataviz-iot-react-components';
import { EventBus } from '../EventBus';

// import circleSvg from 'forge-dataviz-iot-react-components/assets/images/circle.svg';
// import circleHighlightedSvg from 'forge-dataviz-iot-react-components/assets/images/circle_highlighted.svg';
import temperatureSvg from 'forge-dataviz-iot-react-components/assets/images/temperature_property.svg';
import humiditySvg from 'forge-dataviz-iot-react-components/assets/images/humidity_property.svg';
import co2Svg from 'forge-dataviz-iot-react-components/assets/images/co2_property.svg';

const defaultPropertyIconMap = {
    Temperature: temperatureSvg,
    Humidity: humiditySvg,
    'CO₂': co2Svg
};

/**
 * Find node in device tree by given id
 * @param {string} id Node id to search
 * @param {TreeNode} node TreeNode
 * @returns {TreeNode|null} Matched TreeNode
 */
function findNode(id, node) {
    if (node.id == id) {
        return node;
    } else if (node.children != null) {
        let result = null;
        for (let i = 0; result == null && i < node.children.length; i++) {
            result = findNode(id, node.children[i]);
        }
        return result;
    }

    return null;
}

/**
 * Find node parent in device tree by given child node id
 * @param {string} id Child node id to search
 * @param {TreeNode} node TreeNode
 * @returns {TreeNode|null} Matched parent TreeNode
 */
function findNodeParent(id, node) {
    if (node.children) {
        if (node.children.some(ch => ch.id == id)) {
            return node;
        } else {
            let result = null;
            for (let i = 0; result == null && i < node.children.length; i++) {
                result = findNodeParent(id, node.children[i]);
            }
            return result;
        }
    }

    return null;
}

/**
 *  The date panel react wrapper based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/DataPanelContainer.jsx.
 * @class
 */
class DataVizDataPanel extends React.Component {
    /**
     * @param {Object} props
     * @param {EventBus} props.eventBus Used to dispatch mouse events when a user interacts with a {@link TreeNode}
     * @param {string} props.selectedDevice An optional value that represents the
     * &nbsp;identifier of the current selected device. Empty string if no
     * &nbsp;device is selected.
     * @param {Function} props.onNavigateBack A callback function invoked when 'Back
     * &nbsp;to devices' button is clicked.
     * @param {TreeNode[]} props.devices Array of device {@link TreeNode} in the scene
     * @param {OnNodeSelected} props.onNodeSelected A callback function that is invoked
     * &nbsp;when a tree node is selected
     * @param {Map<Number,String>} props.deviceId2DbIdMap A mapping of device identifiers
     * &nbsp;to the dbId corresponding to its visual representation in the viewer.
     * @param {Object} props.dataVizExtn Represents the Forge Viewer Data Visualization extension
     * @param {ChartData} props.chartData Data used to generate charts for each property associated with props.selectedDevice
     * @param {CurrentDeviceData} props.currentDeviceData Data containing the estimated propertyValue for each property
     * &nbsp;associated with props.selectedDevice
     * @param {Object} props.propertyIconMap  A mapping of property names to image paths used for
     * &nbsp;each {@link DeviceStats} object.
     * @param {(SurfaceShadingGroup|SurfaceShadingNode)} props.selectedGroupNode Represents the
     * &nbsp;group node that is currently selected in the scene.
     * @constructor
     */
    constructor(props) {
        super(props);

        this.state = {
            selectedDevice: props.selectedDevice,
            selectedPropertyId: props.selectedPropertyId,
            selectedGroupNode: props.selectedGroupNode,
            currentDeviceData: props.currentDeviceData,
            deviceId2DbIdMap: props.deviceId2DbIdMap,
            devices: props.devices,
            chartData: props.chartData
        };
    }

    render() {
        let {
            selectedDevice,
            selectedPropertyId,
            selectedGroupNode,
            currentDeviceData,
            deviceId2DbIdMap,
            devices,
            chartData
        } = this.state;

        let {
            eventBus,
            propertyIconMap,
            dataVizExtn,
            onNodeSelected,
            onNavigateBack
        } = this.props;

        return (
            <DataPanelContainer
                selectedDevice={selectedDevice}
                selectedPropertyId={selectedPropertyId}
                deviceId2DbIdMap={deviceId2DbIdMap}
                devices={devices}
                onNodeSelected={onNodeSelected}
                onNavigateBack={onNavigateBack}
                propertyIconMap={propertyIconMap}
                dataVizExtn={dataVizExtn}
                selectedGroupNode={selectedGroupNode}
                currentDeviceData={currentDeviceData}
                chartData={chartData}
                eventBus={eventBus}
            />
        );
    }
}

/**
 * Events
 */
const DATA_PANEL_CONTROL_INITIALIZED_EVENT = 'dataPanelControlInitializedEvent';
const DATA_PANEL_CONTROL_TREE_NODE_CLICKED_EVENT = 'dataPanelControlTreeNodeClickedEvent';
const DATA_PANEL_CONTROL_TREE_NODE_HOVERED_EVENT = 'dataPanelControlTreeNodeHoveredEvent';
const DATA_PANEL_CONTROL_TREE_NODE_BLURRED_EVENT = 'dataPanelControlTreeNodeBlurredEvent';

/**
* The data panel component based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/DataPanelContainer.jsx
* @class
*
* @memberof Autodesk.DataVisualization.UI
* @alias Autodesk.DataVisualization.UI.DataPanelControl
*/
class DataPanelControl extends THREE.EventDispatcher {
    /**
     * @param {HTMLDivElement} container The DOM container holding this control.
     * @param {Object} options
     * @constructor
     */
    constructor(container, options) {
        super();

        this.container = container;
        this.options = options;
        this.eventBus = new EventBus();
        this.instance = null;

        this.onDataPanelNavigateBack = this.onDataPanelNavigateBack.bind(this);
        this.onDashboardNodeSelected = this.onDashboardNodeSelected.bind(this);
        this.onDashboardTreeNodeClicked = this.onDashboardTreeNodeClicked.bind(this);
    }

    onDataPanelNavigateBack(event, data) {
        event && event.stopPropagation();

        if (!this.instance) return;

        if (!event && !data) { //!<< Navigating from device charts back to device list
            data = Object.assign({}, this.instance.state.selectedGroupNode);

            let node = null;
            let devices = this.instance.state.devices;
            for (let i = 0; i < devices.length; i++) {
                node = findNodeParent(this.currentDeviceId, devices[i]);
                if (node != null) break;
            }

            this.instance.setState({
                selectedDevice: '',
                selectedGroupNode: node
            });
        }

        this.dispatchEvent({
            type: DATA_PANEL_CONTROL_TREE_NODE_BLURRED_EVENT,
            data
        });
    }

    onDashboardNodeSelected(event, id) {
        event && event.stopPropagation();

        let node = null;
        let data = this.instance.state.devices;
        for (let i = 0; i < data.length; i++) {
            node = findNode(id, data[i]);
            if (node != null) break;
        }

        let isLeaf = (node.children.length <= 0);

        if (id && event.type == 'mouseover') {
            this.dispatchEvent({
                type: DATA_PANEL_CONTROL_TREE_NODE_HOVERED_EVENT,
                data: {
                    id,
                    isLeaf
                }
            });

            return;
        }

        this.currentTreeNodeId = id;
        this.dispatchEvent({
            type: DATA_PANEL_CONTROL_TREE_NODE_CLICKED_EVENT,
            data: {
                id,
                isLeaf
            }
        });
    }

    /**
     * For handling events of expanding DeviceTree.
     * @private
     */
    onDashboardTreeNodeClicked(event) {
        if (this.currentTreeNodeId == event.data?.id) {
            this.currentTreeNodeId = null;
            return;
        }

        this.currentTreeNodeId = event.data?.id;
        this.dispatchEvent({
            type: DATA_PANEL_CONTROL_TREE_NODE_CLICKED_EVENT,
            data: {
                id: event.data?.id,
                isLeaf: false
            }
        });
    }

    /**
     * Current selected device node. Ex. Hyperion-1
     * @type {string}
     */
    get currentDeviceId() {
        if (!this.instance) return;

        return this.instance.state.selectedDevice;
    }

    /**
     * Current selected device node. Ex. Hyperion-1
     * @type {string}
     */
    get currentDeviceId() {
        if (!this.instance) return;

        return this.instance.state.selectedDevice;
    }

    /**
     * Current selected device node. Ex. Hyperion-1
     * @param {string} value Device id to select. Ex. Hyperion-1
     */
    get currentTreeNodeId() {
        if (!this.instance) return;

        return this.instance.state.selectedGroupNode?.id;
    }

    /**
     * Current selected device node
     * @param {string} value Device id to select. Ex. Hyperion-1
     */
    set currentTreeNodeId(value) {
        if (!this.instance) return;

        let node = null;
        let data = this.instance.state.devices;
        for (let i = 0; i < data.length; i++) {
            node = findNode(value, data[i]);
            if (node != null) break;
        }

        // if (!node)
        //     throw new Error(`No device matching the given id \`${value}\` in the device tree found. Please check \`options.devicePanelData\`.`);

        let selectedDevice = '';
        if (node && node.children.length <= 0)
            selectedDevice = value;

        this.instance.setState({
            selectedDevice,
            selectedGroupNode: node
        });
    }

    initialize() {
        if (!this.container || !(this.container instanceof HTMLDivElement))
            throw new Error(`Invalid input \`container\`. They should be a type of \`HTMLDivElement\`.`);

        let {
            devices,
            selectedDevice,
            selectedPropertyId,
            selectedGroupNode,
            currentDeviceData,
            chartData,
            deviceId2DbIdMap,
            dbId2DeviceIdMap,
            propertyIconMap,
            dataVizExtn
        } = this.options;

        //!-- For handling events of expanding DeviceTree.
        this.eventBus.addEventListener(
            EventTypes.DEVICE_TREE_EXPAND_EVENT,
            this.onDashboardTreeNodeClicked
        );

        this.instance = ReactDOM.render(
            <DataVizDataPanel
                eventBus={this.eventBus}
                devices={devices}
                selectedDevice={selectedDevice}
                selectedPropertyId={selectedPropertyId}
                propertyIconMap={propertyIconMap || defaultPropertyIconMap}
                selectedGroupNode={selectedGroupNode}
                currentDeviceData={currentDeviceData}
                chartData={chartData}
                deviceId2DbIdMap={deviceId2DbIdMap}
                dbId2DeviceIdMap={dbId2DeviceIdMap}
                dataVizExtn={dataVizExtn}
                onNodeSelected={this.onDashboardNodeSelected}
                onNavigateBack={this.onDataPanelNavigateBack}
            />,
            this.container,
            () => {
                this.dispatchEvent({
                    type: DATA_PANEL_CONTROL_INITIALIZED_EVENT,
                    control: this
                });
            });
    }

    uninitialize() {
        delete this.instance;
        this.instance = null;

        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this.container));

        this.eventBus.removeEventListener(
            EventTypes.DEVICE_TREE_EXPAND_EVENT,
            this.onDashboardTreeNodeClicked
        );
    }
}

const ns = AutodeskNamespace('Autodesk.DataVisualization.UI');

ns.DataPanelControl = DataPanelControl;
ns.DATA_PANEL_CONTROL_INITIALIZED_EVENT = DATA_PANEL_CONTROL_INITIALIZED_EVENT;
ns.DATA_PANEL_CONTROL_TREE_NODE_CLICKED_EVENT = DATA_PANEL_CONTROL_TREE_NODE_CLICKED_EVENT;
ns.DATA_PANEL_CONTROL_TREE_NODE_HOVERED_EVENT = DATA_PANEL_CONTROL_TREE_NODE_HOVERED_EVENT;
ns.DATA_PANEL_CONTROL_TREE_NODE_BLURRED_EVENT = DATA_PANEL_CONTROL_TREE_NODE_BLURRED_EVENT;
ns.defaultPropertyIconMap = defaultPropertyIconMap;

export {
    DataPanelControl,
    defaultPropertyIconMap
};