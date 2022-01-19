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
import { HyperionToolContainer, EventTypes } from 'forge-dataviz-iot-react-components';
import { EventBus } from '../EventBus';

const defaultRenderSettings = {
    showViewables: true,
    occlusion: false,
    showTextures: true,
    heatmapType: "GeometryHeatmap",
};

/**
 * Find node in device tree by given id
 * @param {string} id Node id to search
 * @param {TreeNode} node TreeNodes
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
 * The HyperionToolContainer react wrapper based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/HyperionToolContainer.jsx
 * @class
 */
class DataVizSettingsTool extends React.Component {
    /**
     * @param {Object} props
     * @param {TreeNode[]} props.data Array of device {@link TreeNode} in the scene
     * @param {EventBus} props.eventBus Used to dispatch mouse events when a user interacts with a {@link TreeNode}
     * @param {boolean} [props.structureToolOnly] Flag that renders only the BasicTree option when true.
     * @param {(SurfaceShadingGroup|SurfaceShadingNode)} props.selectedGroupNode Represents the
     * &nbsp;group node that is currently selected in the scene.
     * @param {{Object}} props.renderSettings Defines settings that are configured via the DataViz extension.
     * @param {boolean} props.renderSettings.showViewables Defines whether sprite viewables are visible in the scene.
     * @param {boolean} props.renderSettings.occlusion Defines whether the sprite viewables are occluded.
     * @param {boolean} props.renderSettings.showTextures Defines whether textures are shown.
     * @param {"GeometryHeatmap"|"PlanarHeatmap"} props.renderSettings.heatmapType Heatmap type to render in scene.
     * @constructor
     */
    constructor(props) {
        super(props);

        this.state = {
            selectedGroupNode: props.selectedGroupNode,
            renderSettings: props.renderSettings,
            devicePanelData: props.devicePanelData
        };
    }

    render() {
        let {
            selectedGroupNode,
            renderSettings,
            devicePanelData
        } = this.state;

        let {
            eventBus,
            structureToolOnly
        } = this.props;

        return (
            <HyperionToolContainer
                eventBus={eventBus}
                data={devicePanelData}
                selectedGroupNode={selectedGroupNode}
                renderSettings={renderSettings}
                structureToolOnly={structureToolOnly}
            />
        );
    }
}

/**
 * Events
 */
const SETTINGS_TOOL_CONTROL_INITIALIZED_EVENT = 'settingsToolControlInitializedEvent';
const SETTINGS_TOOL_CONTROL_VISIBILITY_CHANGED_EVENT = 'settingsToolControlVisibilityChangedEvent';
const SETTINGS_TOOL_CONTROL_TREE_NODE_CLICKED_EVENT = 'settingsToolControlTreeNodeClickedEvent';
const SETTINGS_TOOL_CONTROL_TREE_NODE_HOVERED_EVENT = 'settingsToolControlTreeNodeHoveredEvent';
const SETTINGS_TOOL_CONTROL_TREE_NODE_BLURRED_EVENT = 'settingsToolControlTreeNodeBlurredEvent';
const SETTINGS_TOOL_CONTROL_RENDER_SETTINGS_CHANGED_EVENT = 'settingsToolControlRenderSettingsChangedEvent';

/**
 * The HyperionToolContainer component based of https://github.com/Autodesk-Forge/forge-dataviz-iot-react-components/blob/main/client/components/HyperionToolContainer.jsx
 * @class
 *
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.SettingsToolControl
 */
class SettingsToolControl extends THREE.EventDispatcher {
    /**
     * @param {HTMLDivElement} container The DOM container holding this control.
     * @param {Object} options
     * @param {TreeNode[]} options.devicePanelData Array of device {@link TreeNode} in the scene
     * @param {boolean} [options.structureToolOnly=false] Flag that renders only the BasicTree option when true.
     * @param {{Object}} options.renderSettings Defines settings that are configured via the DataViz extension.
     * @param {boolean} options.renderSettings.showViewables Defines whether sprite viewables are visible in the scene.
     * @param {boolean} options.renderSettings.occlusion Defines whether the sprite viewables are occluded.
     * @param {boolean} options.renderSettings.showTextures Defines whether textures are shown.
     * @param {"GeometryHeatmap"|"PlanarHeatmap"} options.renderSettings.heatmapType Heatmap type to render in scene.
     * @constructor
     */
    constructor(container, options) {
        super();

        this.container = container;
        this.options = options;
        this.eventBus = new EventBus();
        this.instance = null;

        this.onRenderSettingsChange = this.onRenderSettingsChange.bind(this);
        this.onHoveringGroupSelection = this.onHoveringGroupSelection.bind(this);
        this.onNotHoveringGroupSelection = this.onNotHoveringGroupSelection.bind(this);
        this.onClickingGroupSelection = this.onClickingGroupSelection.bind(this);
    }

    onRenderSettingsChange(event) {
        if (!this.instance) return;

        this.instance.setState({
            renderSettings: event.data
        },
            () => {
                this.dispatchEvent({
                    type: SETTINGS_TOOL_CONTROL_RENDER_SETTINGS_CHANGED_EVENT,
                    data: event.data
                });
            });
    }

    onHoveringGroupSelection(event) {
        this.dispatchEvent({
            type: SETTINGS_TOOL_CONTROL_TREE_NODE_HOVERED_EVENT,
            data: event.data
        });
    }

    onNotHoveringGroupSelection(event) {
        this.dispatchEvent({
            type: SETTINGS_TOOL_CONTROL_TREE_NODE_BLURRED_EVENT,
            data: event.data
        });
    }

    onClickingGroupSelection(event) {
        if (this.currentTreeNodeId == event.data?.id) {
            this.currentTreeNodeId = null;
            return;
        }

        this.currentTreeNodeId = event.data?.id;
    }

    /**
     * Represents array of device {@link TreeNode} in the scene.
     * @type {TreeNode[]}
     */
    get devicePanelData() {
        if (!this.instance) return;

        return this.instance.state.devicePanelData;
    }

    /**
     * Represents array of device {@link TreeNode} in the scene.
     * @param {TreeNode[]} data
     */
    set devicePanelData(data) {
        if (!this.instance) return;

        delete this.options.devicePanelData;
        this.options.devicePanelData = Object.assign({}, data);

        this.instance.setState({
            devicePanelData: data
        });
    }

    /**
     * Current selected device node. Ex. Hyperion-1
     * @type {string}
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
        let data = this.devicePanelData;
        for (let i = 0; i < data.length; i++) {
            node = findNode(value, data[i]);
            if (node != null) break;
        }

        // if (!node)
        //     throw new Error(`No device matching the given id \`${value}\` in the device tree found. Please check \`options.devicePanelData\`.`);

        if (node && node.children.length <= 0)
            return;

        this.instance.setState({
            selectedGroupNode: node
        },
            () => {
                let data = null;
                if (node != null) {
                    let isLeaf = (node && (node.children.length <= 0));
                    data = {
                        ...node,
                        isLeaf
                    };
                }

                this.dispatchEvent({
                    type: SETTINGS_TOOL_CONTROL_TREE_NODE_CLICKED_EVENT,
                    data
                });
            });
    }

    /**
     * Settings that are configured via the DataViz extension.
     * @type {{Object}}
     * @param {boolean} renderSettings.showViewables Defines whether sprite viewables are visible in the scene.
     * @param {boolean} renderSettings.occlusion Defines whether the sprite viewables are occluded.
     * @param {boolean} renderSettings.showTextures Defines whether textures are shown.
     * @param {"GeometryHeatmap"|"PlanarHeatmap"} renderSettings.heatmapType Heatmap type to render in scene.
     */
    get renderSettings() {
        if (!this.instance) return;

        return Object.assign({}, this.instance.state.renderSettings);
    }

    initialize() {
        if (!this.container || !(this.container instanceof HTMLDivElement))
            throw new Error(`Invalid input \`container\`. They should be a type of \`HTMLDivElement\`.`);

        let {
            devicePanelData,
            selectedGroupNode,
            renderSettings,
            structureToolOnly
        } = this.options;

        this.eventBus.addEventListener(
            EventTypes.RENDER_SETTINGS_CHANGED,
            this.onRenderSettingsChange
        );

        this.eventBus.addEventListener(
            EventTypes.GROUP_SELECTION_MOUSE_OVER,
            this.onHoveringGroupSelection
        );

        this.eventBus.addEventListener(
            EventTypes.GROUP_SELECTION_MOUSE_OUT,
            this.onNotHoveringGroupSelection
        );

        this.eventBus.addEventListener(
            EventTypes.GROUP_SELECTION_MOUSE_CLICK,
            this.onClickingGroupSelection
        );

        this.instance = ReactDOM.render(
            <DataVizSettingsTool
                eventBus={this.eventBus}
                devicePanelData={devicePanelData}
                selectedGroupNode={selectedGroupNode}
                renderSettings={renderSettings || defaultRenderSettings}
                structureToolOnly={Boolean(structureToolOnly)}
            />,
            this.container,
            () => {
                this.dispatchEvent({
                    type: SETTINGS_TOOL_CONTROL_INITIALIZED_EVENT,
                    control: this
                });
            });
    }

    uninitialize() {
        delete this.instance;
        this.instance = null;

        ReactDOM.unmountComponentAtNode(ReactDOM.findDOMNode(this.container));

        this.eventBus.removeEventListener(
            EventTypes.RENDER_SETTINGS_CHANGED,
            this.onRenderSettingsChange
        );

        this.eventBus.removeEventListener(
            EventTypes.GROUP_SELECTION_MOUSE_OVER,
            this.onHoveringGroupSelection
        );

        this.eventBus.removeEventListener(
            EventTypes.GROUP_SELECTION_MOUSE_OUT,
            this.onNotHoveringGroupSelection
        );

        this.eventBus.removeEventListener(
            EventTypes.GROUP_SELECTION_MOUSE_CLICK,
            this.onClickingGroupSelection
        );
    }
}

const ns = AutodeskNamespace('Autodesk.DataVisualization.UI');

ns.SettingsToolControl = SettingsToolControl;
ns.SETTINGS_TOOL_CONTROL_INITIALIZED_EVENT = SETTINGS_TOOL_CONTROL_INITIALIZED_EVENT;
ns.SETTINGS_TOOL_CONTROL_VISIBILITY_CHANGED_EVENT = SETTINGS_TOOL_CONTROL_VISIBILITY_CHANGED_EVENT;
ns.SETTINGS_TOOL_CONTROL_TREE_NODE_CLICKED_EVENT = SETTINGS_TOOL_CONTROL_TREE_NODE_CLICKED_EVENT;
ns.SETTINGS_TOOL_CONTROL_TREE_NODE_HOVERED_EVENT = SETTINGS_TOOL_CONTROL_TREE_NODE_HOVERED_EVENT;
ns.SETTINGS_TOOL_CONTROL_TREE_NODE_BLURRED_EVENT = SETTINGS_TOOL_CONTROL_TREE_NODE_BLURRED_EVENT;
ns.SETTINGS_TOOL_CONTROL_RENDER_SETTINGS_CHANGED_EVENT = SETTINGS_TOOL_CONTROL_RENDER_SETTINGS_CHANGED_EVENT;
ns.defaultRenderSettings = defaultRenderSettings;

export {
    SettingsToolControl,
    defaultRenderSettings
};