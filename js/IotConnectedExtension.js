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

(function () {
    const SpriteSize = 24; //!<< Sprites as points of size 24 x 24 pixels

    class DataProvider {
        constructor(parent) {
            this.parent = parent;
            this.deviceModels = null;
            this.devicePropertyMap = null;
            this.renderSettings = null;
            this.propertyGradientMap = null;
            this.propertyIconMap = null;
        }

        async fetchJsonAsync(url) {
            return new Promise((resolve, reject) => {
                fetch(url, {
                    method: 'get',
                    headers: new Headers({ 'Content-Type': 'application/json' })
                })
                    .then((response) => {
                        if (response.status === 200) {
                            return resolve(response.json());
                        } else {
                            return reject(
                                new Error(`Failed to fetch token from server (status: ${response.status}, message: ${response.statusText})`)
                            );
                        }
                    })
                    .catch((error) => reject(error));
            });
        }

        async fetchDataAsync() { }

        buildSensorStyleMap() { }

        buildDeviceProperties() { }

        /**
         * Uses the {@link ModelStructureInfo} to construct {@link SurfaceShadingData}
         *
         * @param {Model} model Model loaded in viewer
         * @param {Device[]} deviceList List of devices to be mapped to loaded rooms.
         * @param {string} [nodeName] Optional. Name of the node whose child nodes
         * are to be retrieved and used as the bounding volumns for surface shading.
         * The default value is "Rooms" if none is supplied.
         */
        async createShadingGroupByFloor(model, deviceList, nodeName) {
            let dataVizTool = this.parent.dataVizTool;

            const getShadingData = async () => {
                const structureInfo = new Autodesk.DataVisualization.Core.ModelStructureInfo(model);
                /**
                 * We have a custom type here for the UI in {@link constructDeviceTree}
                 */

                let shadingData = await structureInfo.generateSurfaceShadingData(
                    deviceList,
                    undefined,
                    nodeName
                );

                return shadingData;
            };

            // Ensure that instance tree has loaded.
            await dataVizTool.waitForInstanceTree(model);
            return getShadingData();
        }

        /**
         * Constructs a device tree used to load the device UI.
         *
         * @param {SurfaceShadingData} shadingData The `SurfaceShadingData`, generally
         * the output of {@link createShadingGroupByFloor} or {@link createShadingData}.
         * @param {boolean} usingFullTree When true, constructs a device tree that
         * contains all non-empty `SurfaceShadingGroup`, intermediate `SurfaceShadingNode`,
         * and `SurfaceShadingPoint` objects. When `false`, skips intermediate `SurfaceShadingNode`
         * objects.
         *
         * @returns {TreeNode[]} The device tree containing all groups and their corresponding devices.
         */
        createDeviceTree(shadingData, usingFullTree = false) {
            function traverse(item) {
                if (item.position) {
                    //SurfaceShadingPoint
                    return {
                        id: item.id,
                        name: item.name,
                        propIds: item.types || [],
                        children: [],
                    };
                } else if (item.shadingPoints && item.shadingPoints.length > 0) {
                    //non-empty SurfaceShadingNode
                    return item.shadingPoints.map((sp) => traverse(sp));
                } else if (item.isGroup) {
                    //SurfaceShadingGroup
                    return item.children.map((child) => traverse(child));
                }
            }

            if (usingFullTree) {
                const result = shadingData.children.map((item) => {
                    let obj = {
                        id: item.id,
                        name: item.name,
                        propIds: item.types || [],
                        children: [],
                    };

                    // SurfaceShadingGroup.
                    if (item.isGroup) {
                        obj.children = this.createDeviceTree(item, usingFullTree);
                    } // SurfaceShadingNode
                    else if (item.shadingPoints) {
                        if (item.shadingPoints.length > 0) {
                            obj.children = item.shadingPoints.map((sp) => {
                                return {
                                    id: sp.id,
                                    name: sp.name,
                                    propIds: sp.types || [],
                                    children: [],
                                };
                            });
                        }
                    } else {
                        obj.children = [];
                    }

                    return obj;
                });

                return result.filter((item) => Object.keys(item).length); // Skips over empty SurfaceShadingGroups and SurfaceShadingNodes
            } else {
                return shadingData.children.map((item) => ({
                    id: item.id,
                    name: item.name,
                    propIds: [],
                    children: traverse(item)
                        .filter((i) => i)
                        .flat(),
                }));
            }
        }

        /**
         * Gets the Device object given its identifier.
         *
         * @param {string} deviceId Identifier of the device.
         * @returns {Device} The Device object if one is found,
         * &nbsp;or undefined otherwise.
         * @memberof Autodesk.DataVisualization.Data
         * @alias Autodesk.DataVisualization.Data.DataStore#getDevice
         */
        getDevice(deviceId) {
            let data = Object.values(this.deviceModels);
            let devices = data.map(dm => Object.values(dm.devices)).flat();
            return devices.find(d => d.id == deviceId);
        }

        /**
         * Gets the selected property's range min, max and dataUnit value.
         *
         * @param {string} propertyId String identifier of a device property.
         * @returns {Object} The rangeMin, rangeMax and dataUnit for the selected propertyId
         */
        buildPropertyRanges(propertyId) { }
    }

    class DemoDataProvider extends DataProvider {
        constructor(parent) {
            super(parent);
        }

        #fetchConfigs() {
            return this.fetchJsonAsync('data/config.json');
        }

        #fetchDevicesAsync() {
            return this.fetchJsonAsync('data/devices.json');
        }

        #fetchDeviceModelsAsync() {
            return this.fetchJsonAsync('data/deviceModel.json');
        }

        async fetchDataAsync() {
            let deviceModels = await this.#fetchDeviceModelsAsync();
            let devices = await this.#fetchDevicesAsync();

            deviceModels.forEach((deviceModel) => {
                // Get all the properties that belong to this device type.
                const pids = deviceModel.properties.map(p => p.id);
                const matchedDevices = devices.filter(d => d.modelId == deviceModel.id);
                matchedDevices.forEach(d => {
                    d.sensorTypes = pids;
                    d.deviceModel = deviceModel;

                    delete d.modelId;
                });

                deviceModel.devices = matchedDevices;
            });

            this.deviceModels = deviceModels;

            let configs = await this.#fetchConfigs();
            this.renderSettings = configs.renderSettings;
            this.propertyIconMap = configs.propertyIconMap;

            let propertyGradientMap = {};
            Object.keys(configs.propertyGradientMap).forEach(key => {
                return propertyGradientMap[key] = configs.propertyGradientMap[key].map(color => Number(color));
            });
            this.propertyGradientMap = propertyGradientMap;

            // Create model-to-style map from style definitions.
            this.sensorStyleMap = {};
            Object.entries(configs.sensorStyleDefinitions).forEach(([type, styleDef]) => {
                this.sensorStyleMap[type] = new Autodesk.DataVisualization.Core.ViewableStyle(
                    Autodesk.DataVisualization.Core.ViewableType.SPRITE,
                    new THREE.Color(Number(styleDef.color)),
                    styleDef.url,
                    new THREE.Color(Number(styleDef.highlightedColor)),
                    styleDef.highlightedUrl
                );
            });

            this.devicePropertyMap = this.buildDeviceProperties();
        }

        buildDeviceProperties() {
            let data = Object.values(this.deviceModels);
            let nestedList = data.map(dm => Object.values(dm.properties)).flat();
            let filteredMap = new Map(nestedList.map((obj) => [`${obj.id}`, obj]));
            return filteredMap;
        }

        /**
         * Gets the selected property's range min, max and dataUnit value.
         *
         * @param {string} propertyId String identifier of a device property.
         * @returns {Object} The rangeMin, rangeMax and dataUnit for the selected propertyId
         */
        buildPropertyRanges(propertyId) {
            const propertyMap = this.devicePropertyMap;

            if (propertyId !== 'None') {
                let dataUnit = '';
                let rangeMin = Infinity;
                let rangeMax = -Infinity;

                //Get the property data from the device model
                let deviceProperty = propertyMap.get(propertyId);

                if (deviceProperty) {
                    dataUnit = deviceProperty.dataUnit;
                    dataUnit = dataUnit.toLowerCase() === 'celsius' ? '°C' : dataUnit;
                    dataUnit = dataUnit.toLowerCase() === 'fahrenheit' ? '°F' : dataUnit;
                    rangeMin = Math.min(rangeMin, deviceProperty.rangeMin); // will be NaN if deviceProperty.rangeMin == undefined or NaN
                    rangeMax = Math.max(rangeMax, deviceProperty.rangeMax); // will be NaN if deviceProperty.rangeMax == undefined or NaN
                }

                // Check if the property min and max range is available in the device model, else notify user
                if (isNaN(rangeMin) || isNaN(rangeMax)) {
                    console.warn(
                        `RangeMin and RangeMax for ${propertyId} not specified. Please update these values in the device model`
                    );
                    rangeMin = 0;
                    rangeMax = 100;
                    dataUnit = '%';
                }
                return { rangeMin, rangeMax, dataUnit };
            }
        }
    }

    class IotConnectedExtension extends Autodesk.Viewing.Extension {
        constructor(viewer, options) {
            super(viewer, options);

            this.deviceDbId = 1;
            this.dataProvider = new DemoDataProvider(this);

            //!--- DataViz UI
            this.onTimeRangeUpdated = this.onTimeRangeUpdated.bind(this);
            this.onCurrentTimeUpdated = this.onCurrentTimeUpdated.bind(this);
            this.onRenderSettingsUpdated = this.onRenderSettingsUpdated.bind(this);
            this.onHeatmapOptionsChanged = this.onHeatmapOptionsChanged.bind(this);
            this.onDeviceTreeNodeHovered = this.onDeviceTreeNodeHovered.bind(this);
            this.onDeviceTreeNodeBlurred = this.onDeviceTreeNodeBlurred.bind(this);
            this.onDataPanelTreeNodeHovered = this.onDataPanelTreeNodeHovered.bind(this);
            this.onDataPanelTreeNodeBlurred = this.onDataPanelTreeNodeBlurred.bind(this);
            this.onDataPanelTreeNodeClicked = this.onDataPanelTreeNodeClicked.bind(this);

            //!-- DataViz ext
            this.onSpriteHovered = this.onSpriteHovered.bind(this);
            this.onSpriteClicked = this.onSpriteClicked.bind(this);
            this.getSensorValue = this.getSensorValue.bind(this);

            //!-- Viewer
            this.createUI = this.createUI.bind(this);
            this.onToolbarCreated = this.onToolbarCreated.bind(this);
            this.onModelLoaded = this.onModelLoaded.bind(this);
        }

        get levelSelector() {
            const levelExt = this.viewer.getExtension('Autodesk.AEC.LevelsExtension');
            return levelExt && levelExt.floorSelector;
        }

        get dataVizTool() {
            const dataVizExt = this.viewer.getExtension('Autodesk.DataVisualization');
            return dataVizExt;
        }

        onTimeRangeUpdated(event) {
            console.log(event);

            switch (event.type) {
                case Autodesk.DataVisualization.UI.BASIC_DATE_PICKER_CONTROL_TIME_RANGE_UPDATED_EVENT:
                    this.timeSliderCtrl.updateTimeRange(event.startTime, event.endTime);
                    break;
                case Autodesk.DataVisualization.UI.TIME_SLIDER_CONTROL_TIME_RANGE_UPDATED_EVENT:
                    this.datePickerCtrl.updateTimeRange(event.startTime, event.endTime);
                    break;
            }
        }

        onCurrentTimeUpdated(event) {
            console.log(event);

            const currentTime = new Date(event.currentTime.getTime());
            console.log('Current time: ', currentTime);

            this.dataVizTool.updateSurfaceShading(this.getSensorValue);

            //!todo: Update dataPanelCtrl's currentDeviceData together.
        }

        onRenderSettingsUpdated(event) {
            console.log(event);

            let newSettings = event.data;

            this.dataProvider.renderSettings = Object.assign({}, this.dataProvider.renderSettings, newSettings);

            let { heatmapType, occlusion, showTextures, showViewables } = newSettings;

            this.dataVizTool.showHideViewables(showViewables, occlusion);
            if (showTextures) {
                this.dataVizTool.showTextures();
            } else {
                this.dataVizTool.hideTextures();
            }

            //heatmapType
            this.updateHeatmapType(heatmapType);
        }

        onHeatmapOptionsChanged(event) {
            console.log(event);

            const { selectedPropertyId, resolutionValue } = event.data;

            this.timeSliderCtrl.resolution = resolutionValue;

            this.dataPanelCtrl.updateData({
                selectedPropertyId: selectedPropertyId
            });

            this.dataVizTool.removeSurfaceShading();

            if (event.data?.showHeatMap) {
                this.dataVizTool.renderSurfaceShading(
                    this.dataPanelCtrl.currentTreeNodeId,
                    selectedPropertyId,
                    this.getSensorValue
                );
            }
        }

        onDeviceTreeNodeHovered(event) {
            console.log(event, event.data);

            this.#highlightDevice(event.data.id, true);
        }

        onDeviceTreeNodeBlurred(event) {
            console.log(event, event.data);

            this.dataVizTool.clearHighlightedViewables();
            this.#highlightDevice(event.data.id, false);
        }

        onDataPanelTreeNodeBlurred(event) {
            console.log(event, event.data?.isLeaf);

            this.settingsToolCtrl.currentTreeNodeId = this.dataPanelCtrl.currentTreeNodeId;

            this.dataVizTool.clearHighlightedViewables();
        }

        onDataPanelTreeNodeHovered(event) {
            console.log(event, event.data?.isLeaf);

            if (!event.data?.isLeaf) return;

            this.dataVizTool.clearHighlightedViewables();

            const deviceId = event.data.id;
            //this.settingsToolCtrl.currentTreeNodeId = deviceId;

            // Only attempt select if device IDs have been established.
            if (this.deviceId2DbIdMap && this.deviceId2DbIdMap[deviceId]) {
                this.dataVizTool.highlightViewables([this.deviceId2DbIdMap[deviceId]]);
            }
        }

        onDataPanelTreeNodeClicked(event) {
            console.log(event, event.data?.isLeaf);

            const deviceId = event.data.id;
            this.settingsToolCtrl.currentTreeNodeId = deviceId;

            if (!event.data?.isLeaf) return;

            this.dataVizTool.clearHighlightedViewables();

            // Only attempt select if device IDs have been established.
            if (this.deviceId2DbIdMap && this.deviceId2DbIdMap[deviceId]) {
                this.dataVizTool.highlightViewables([this.deviceId2DbIdMap[deviceId]]);
            }
        }

        onSpriteClicked(event) {
            if (event.clickInfo && this.dataVizTool && this.dbId2DeviceIdMap) {
                const deviceId = this.dbId2DeviceIdMap[event.dbId];
                this.dataPanelCtrl.currentTreeNodeId = deviceId;
            }
        }

        onSpriteHovered(event) {
            if (event.hovering && this.dataVizTool && this.dbId2DeviceIdMap) {
                const deviceId = this.dbId2DeviceIdMap[event.dbId];
                const device = this.dataProvider.getDevice(deviceId);

                if (!device) return;

                const position = device.position;
                const mappedPosition = this.viewer.impl.worldToClient(position);

                const boundRect = this.tooltip.container.getBoundingClientRect();

                // Accounting for vertical offset of viewer container
                const verticalOffset = event.originalEvent.clientY - event.originalEvent.offsetY;

                const hoveredDeviceInfo = {
                    id: deviceId,
                    xcoord: mappedPosition.x,
                    ycoord:
                        mappedPosition.y +
                        verticalOffset -
                        SpriteSize / this.viewer.getWindow().devicePixelRatio,
                };

                this.tooltip.show({
                    hoveredDeviceInfo,
                    chartData: tooltipData.chartData,
                    currentDeviceData: tooltipData.currentDeviceData
                })
            } else {
                this.tooltip.hide();
            }
        }

        async onModelLoaded(event) {
            await this.#renderSprites();
            await this.#renderHeatmap();
        }

        async onToolbarCreated() {
            // Load data
            await this.dataProvider.fetchDataAsync();

            // Create UI
            await this.createUI();
        }

        #highlightDevice(deviceId, isHighlight) {
            const viewer = this.viewer;
            const shadingData = this.shadingData;
            const model = viewer.model;

            let node = shadingData.getNodeById(deviceId);
            if (node && node.dbIds) {
                node.dbIds.map((dbId) => viewer.impl.highlightObjectNode(model, dbId, isHighlight));
                viewer.impl.invalidate(false, false, true);
            } else {
                const leafNodes = [];
                shadingData.getChildLeafs(leafNodes);

                for (let i = 0; i < leafNodes.length; i++) {
                    let leaf = leafNodes[i];
                    if (
                        leaf.shadingPoints &&
                        leaf.shadingPoints.find((item) => item.id == deviceId)
                    ) {
                        let sp = leaf.shadingPoints.find((item) => item.id == deviceId);

                        if (sp.dbId != null) {
                            viewer.impl.highlightObjectNode(model, sp.dbId, isHighlight);
                        } else {
                            leaf.dbIds.map((dbId) =>
                                viewer.impl.highlightObjectNode(model, dbId, isHighlight)
                            );
                        }
                        viewer.impl.invalidate(false, false, true);
                        break;
                    }
                }
            }
        }

        async #renderSprites() {
            const { deviceModels, renderSettings } = this.dataProvider;
            if (!deviceModels || deviceModels.length <= 0)
                return Promise.reject();

            const { devices } = deviceModels[0];
            if (!devices || devices.length <= 0)
                return Promise.reject();

            let shadingData = await this.dataProvider.createShadingGroupByFloor(
                this.viewer.model,
                devices
            );
            this.shadingData = shadingData;

            this.dbId2DeviceIdMap = {};
            this.deviceId2DbIdMap = {};

            const DataVizCore = Autodesk.DataVisualization.Core;
            const styleMap = this.dataProvider.sensorStyleMap;
            const viewableData = new DataVizCore.ViewableData();
            viewableData.spriteSize = SpriteSize;

            const leafNodes = [];
            shadingData.getChildLeafs(leafNodes);

            for (let i = 0; i < leafNodes.length; i++) {
                let leaf = leafNodes[i];
                for (let j = 0; leaf.shadingPoints && j < leaf.shadingPoints.length; j++) {
                    let device = leaf.shadingPoints[j];

                    const style = styleMap[device.contextData.styleId] || styleMap['default'];
                    const position = device.position;
                    const viewable = new DataVizCore.SpriteViewable(position, style, this.deviceDbId);

                    this.dbId2DeviceIdMap[this.deviceDbId] = device.id;
                    this.deviceId2DbIdMap[device.id] = this.deviceDbId;
                    this.deviceDbId++;

                    viewableData.addViewable(viewable);
                }
            }

            await viewableData.finish();
            this.dataVizTool.addViewables(viewableData);

            this.dataVizTool.showHideViewables(renderSettings.showViewables, renderSettings.occlusion);

            if (!renderSettings.showTextures) {
                this.dataVizTool.hideTextures();
            }

            return Promise.resolve();
        }

        async #renderHeatmap() {
            const { renderSettings } = this.dataProvider;
            if (!this.shadingData)
                return Promise.reject();

            let devicePanelData = this.dataProvider.createDeviceTree(this.shadingData, false);
            this.settingsToolCtrl.devicePanelData = devicePanelData;

            let newDataPanelData = {
                devices: devicePanelData,
                deviceId2DbIdMap: this.deviceId2DbIdMap,
                dbId2DeviceIdMap: this.dbId2DeviceIdMap,
                chartData: dataPanelData.chartData,
                currentDeviceData: dataPanelData.currentDeviceData,
                selectedPropertyId: this.heatmapOptsCtrl.selectedPropertyTypeId
            };

            this.dataPanelCtrl.updateData(newDataPanelData);

            await this.dataVizTool.setupSurfaceShading(
                this.viewer.model,
                this.shadingData,
                { type: renderSettings.heatmapType }
            );

            let gradientSettings = this.dataProvider.propertyGradientMap;
            for (let deviceType in gradientSettings) {
                this.dataVizTool.registerSurfaceShadingColors(
                    deviceType,
                    gradientSettings[deviceType],
                    0.7
                );
            }

            return Promise.resolve();
        }

        #initTimeSlider() {
            //!-- ChronosTimeSlider
            let currentTime = new Date();
            currentTime.setUTCHours(0, 0, 0, 0);
            let endTime = new Date(currentTime.getTime() + 1 * 24 * 60 * 60 * 1000);
            endTime.setUTCHours(0, 0, 0, 0);
            let startTime = new Date(currentTime.getTime() - 14 * 24 * 60 * 60 * 1000);
            startTime.setUTCHours(0, 0, 0, 0);

            let timeOptions = new Autodesk.DataVisualization.UI.TimeOptions(startTime, endTime, currentTime);
            let timeSliderOptions = {
                dataStart: startTime,
                dataEnd: endTime,
                timeOptions,
                handleTimeRangeUpdated: (startTime, endTime, currentTime) => console.log(startTime, endTime, currentTime),
                handleCurrentTimeUpdated: (currentTime) => console.log(currentTime)
            };
            let timeSliderCtrl = new Autodesk.DataVisualization.UI.ChronosTimeSliderControl(document.getElementById('timeline'), timeSliderOptions);
            this.timeSliderCtrl = timeSliderCtrl;

            timeSliderCtrl.addEventListener(
                Autodesk.DataVisualization.UI.TIME_SLIDER_CONTROL_INITIALIZED_EVENT,
                console.log
            );

            timeSliderCtrl.addEventListener(
                Autodesk.DataVisualization.UI.TIME_SLIDER_CONTROL_CURRENT_TIME_UPDATED_EVENT,
                this.onCurrentTimeUpdated
            );

            timeSliderCtrl.addEventListener(
                Autodesk.DataVisualization.UI.TIME_SLIDER_CONTROL_TIME_RANGE_UPDATED_EVENT,
                this.onTimeRangeUpdated
            );

            timeSliderCtrl.initialize();
        }

        #initDatePicker() {
            //!-- BasicDatePicker
            const { timeOptions } = this.timeSliderCtrl.options;
            let datePickerCtrl = new Autodesk.DataVisualization.UI.BasicDatePickerControl(document.getElementById('datepicker'), { timeOptions });
            this.datePickerCtrl = datePickerCtrl;

            datePickerCtrl.addEventListener(
                Autodesk.DataVisualization.UI.BASIC_DATE_PICKER_INITIALIZED_EVENT,
                console.log
            );

            datePickerCtrl.addEventListener(
                Autodesk.DataVisualization.UI.BASIC_DATE_PICKER_CONTROL_TIME_RANGE_UPDATED_EVENT,
                this.onTimeRangeUpdated
            );

            datePickerCtrl.initialize();
        }

        #initHeatmapOptions() {
            //!-- HeatmapOptions
            let heatmapOptsContainer = document.getElementById('heatmapOpts');
            let heatmapOptions = {
                propIdGradientMap: this.dataProvider.propertyGradientMap,
                deviceModelProperties: this.dataProvider.devicePropertyMap,
                getPropertyRanges: (propertyId) => this.dataProvider.buildPropertyRanges(propertyId)
            };
            let heatmapOptsCtrl = new Autodesk.DataVisualization.UI.HeatmapOptionsControlControl(heatmapOptsContainer, heatmapOptions);
            this.heatmapOptsCtrl = heatmapOptsCtrl;

            heatmapOptsCtrl.addEventListener(
                Autodesk.DataVisualization.UI.HEATMAP_OPTIONS_CONTROL_INITIALIZED_EVENT,
                console.log
            );

            heatmapOptsCtrl.addEventListener(
                Autodesk.DataVisualization.UI.HEATMAP_OPTIONS_CONTROL_STATE_CHANGED_EVENT,
                this.onHeatmapOptionsChanged
            );

            heatmapOptsCtrl.initialize();
        }

        #initDataPanel() {
            let dataPanelContainer = document.getElementById('dataPanel');
            let dataPanelOptions = {
                // devices: [],
                // selectedDevice: null,
                selectedPropertyId: this.heatmapOptsCtrl.selectedPropertyTypeId,
                // selectedGroupNode: null,
                // currentDeviceData: null,
                // chartData: null,
                // deviceId2DbIdMap: null,
                // dbId2DeviceIdMap: null,
                propertyIconMap: this.dataProvider.propertyIconMap,
                dataVizExtn: this.viewer.getExtension('Autodesk.DataVisualization')
            };
            let dataPanelCtrl = new Autodesk.DataVisualization.UI.DataPanelControl(dataPanelContainer, dataPanelOptions);
            this.dataPanelCtrl = dataPanelCtrl;

            dataPanelCtrl.addEventListener(
                Autodesk.DataVisualization.UI.DATA_PANEL_CONTROL_INITIALIZED_EVENT,
                console.log
            );

            dataPanelCtrl.addEventListener(
                Autodesk.DataVisualization.UI.DATA_PANEL_CONTROL_TREE_NODE_HOVERED_EVENT,
                this.onDataPanelTreeNodeHovered
            );

            dataPanelCtrl.addEventListener(
                Autodesk.DataVisualization.UI.DATA_PANEL_CONTROL_TREE_NODE_BLURRED_EVENT,
                this.onDataPanelTreeNodeBlurred
            );

            dataPanelCtrl.addEventListener(
                Autodesk.DataVisualization.UI.DATA_PANEL_CONTROL_TREE_NODE_CLICKED_EVENT,
                this.onDataPanelTreeNodeClicked
            );

            this.settingsToolCtrl.addEventListener(
                Autodesk.DataVisualization.UI.SETTINGS_TOOL_CONTROL_TREE_NODE_CLICKED_EVENT,
                (event) => {
                    console.log(event, event.data?.isLeaf);
                    if (!event.data?.isLeaf) {
                        const deviceId = event.data?.id;

                        if (this.dataPanelCtrl.currentTreeNodeId == deviceId) return;

                        this.dataPanelCtrl.currentTreeNodeId = deviceId;
                        this.dataVizTool.renderSurfaceShading(
                            deviceId,
                            this.heatmapOptsCtrl.selectedPropertyTypeId,
                            this.getSensorValue
                        );

                        this.setLevelSectionsByName(deviceId);
                    }
                });

            dataPanelCtrl.initialize();
        }

        #initSettingsTool() {
            //!-- HyperionToolContainer
            let settingsToolContainer = document.getElementById('settingsTool');
            let settingsToolOptions = {
                devicePanelData: [],
                selectedGroupNode: null
            };
            let settingsToolCtrl = new Autodesk.DataVisualization.UI.SettingsToolControl(settingsToolContainer, settingsToolOptions);
            this.settingsToolCtrl = settingsToolCtrl;

            settingsToolCtrl.addEventListener(
                Autodesk.DataVisualization.UI.SETTINGS_TOOL_CONTROL_INITIALIZED_EVENT,
                console.log
            );

            settingsToolCtrl.addEventListener(
                Autodesk.DataVisualization.UI.SETTINGS_TOOL_CONTROL_RENDER_SETTINGS_CHANGED_EVENT,
                this.onRenderSettingsUpdated
            );

            settingsToolCtrl.addEventListener(
                Autodesk.DataVisualization.UI.SETTINGS_TOOL_CONTROL_TREE_NODE_HOVERED_EVENT,
                this.onDeviceTreeNodeHovered
            );

            settingsToolCtrl.addEventListener(
                Autodesk.DataVisualization.UI.SETTINGS_TOOL_CONTROL_TREE_NODE_BLURRED_EVENT,
                this.onDeviceTreeNodeBlurred
            );

            settingsToolCtrl.initialize();
        }

        #initTooltip() {
            //!-- Custom Tooltip
            let tooltipContainer = document.getElementById('tooltip');
            let tooltip = new Autodesk.DataVisualization.UI.CustomTooltipControl(tooltipContainer);
            this.tooltip = tooltip;
            tooltip.initialize();
        }

        #clamp(value, lower, upper) {
            if (value == undefined) {
                return lower;
            }

            if (value > upper) {
                return upper;
            } else if (value < lower) {
                return lower;
            } else {
                return value;
            }
        }

        /**
         * Gets the device property value given the current time marker.
         *
         * @param {SurfaceShadingPoint} surfaceShadingPoint A point that
         * &nbsp;contributes to the heatmap generally generated from a {@link Device} object.
         * &nbsp;This is generally created from a call to {@link ModelSurfaceInfo#generateSurfaceShadingData}
         * @param {string} sensorType The device property for which normalized
         * &nbsp;property value is to be retrieved.
         * @returns {number} The property value of the device at the time given in
         * &nbsp;timeOptions.currentTime field.
         * @private
         */
        getSensorValue(surfaceShadingPoint, sensorType) {
            const propertyMap = this.dataProvider.devicePropertyMap;
            const property = propertyMap.get(sensorType);

            if (!property) return 0;

            const rangeMax = Number(property.rangeMax);
            const rangeMin = Number(property.rangeMin);

            const value = Math.random() * (rangeMax - rangeMin) + rangeMin;;
            let normalized = (value - rangeMin) / (rangeMax - rangeMin);
            normalized = this.#clamp(normalized, 0, 1);

            return normalized;
        }

        async updateHeatmapType(heatmapType) {
            if (!this.dataVizTool) return;

            await this.dataVizTool.setupSurfaceShading(
                this.viewer.model,
                this.shadingData,
                { type: heatmapType }
            );

            this.dataVizTool.renderSurfaceShading(
                this.dataPanelCtrl.currentTreeNodeId,
                this.heatmapOptsCtrl.selectedPropertyTypeId,
                this.getSensorValue
            );
        }

        async createUI() {
            this.#initTimeSlider();
            this.#initDatePicker();

            this.#initSettingsTool();
            this.#initHeatmapOptions(); //!<< Heatmap control must be initialized after settings tool control.

            this.#initDataPanel();
            this.#initTooltip();
        }

        findLevelByName(name) {
            const levelData = this.levelSelector.floorData;
            return levelData.find(level => level.name.includes(name));
        }

        isCurrentLevel(name) {
            const levelData = this.levelSelector.floorData;
            const currentLevelIdx = this.levelSelector.currentFloor;
            const idx = levelData.findIndex(lvl => lvl.name == name);
            return (idx != -1) && (idx == currentLevelIdx);
        }

        setLevelSectionsByName(name) {
            this.viewer.setCutPlanes();

            const level = this.findLevelByName(name);
            if (level) {
                // if (this.isCurrentLevel(name)) {
                //     this.levelSelector.selectFloor();
                // } else {
                //     this.levelSelector.selectFloor(level.index, true);
                // }
                this.levelSelector.selectFloor(level.index, true);
            } else {
                this.levelSelector.selectFloor();
            }

            return true;
        }

        async load() {
            // Pre-load level extension 
            await this.viewer.loadExtension('Autodesk.AEC.LevelsExtension', { doNotCreateUI: true, });
            await this.viewer.loadExtension('Autodesk.DataVisualization');

            this.viewer.addEventListener(
                Autodesk.DataVisualization.Core.MOUSE_CLICK,
                this.onSpriteClicked
            );

            this.viewer.addEventListener(
                Autodesk.DataVisualization.Core.MOUSE_HOVERING,
                this.onSpriteHovered
            );

            if (!this.viewer.model?.isLoadDone()) {
                this.viewer.addEventListener(
                    Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                    this.onModelLoaded,
                    { once: true });
            } else {
                this.onModelLoaded({
                    type: Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
                    target: this.viewer,
                    model: this.viewer.model
                })
            }

            return true;
        }

        unload() {
            return true;
        }
    }

    Autodesk.Viewing.theExtensionManager.registerExtension('IotConnectedExtension', IotConnectedExtension);
})();