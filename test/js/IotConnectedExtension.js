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

            this.dataProvider = new DemoDataProvider(this);

            this.createUI = this.createUI.bind(this);
            this.onToolbarCreated = this.onToolbarCreated.bind(this);
            this.onTimeRangeUpdated = this.onTimeRangeUpdated.bind(this);
            this.onRenderSettingsUpdated = this.onRenderSettingsUpdated.bind(this);
            this.onHeatmapOptionsChanged = this.onHeatmapOptionsChanged.bind(this);
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
        }

        onHeatmapOptionsChanged(event) {
            this.dataPanelCtrl.updateData({
                selectedPropertyId: event.data.selectedPropertyId
            });
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

        async #renderSprites() {
            const { deviceModels, renderSettings } = this.dataProvider;
            if (!deviceModels || deviceModels.length <= 0)
                return Promise.reject();

            const { devices } = deviceModels[0];
            if (!devices || devices.length <= 0)
                return Promise.reject();

            this.dbId2DeviceIdMap = {};
            this.deviceId2DbIdMap = {};

            let dbId = 1;
            const DataVizCore = Autodesk.DataVisualization.Core;
            const styleMap = this.dataProvider.sensorStyleMap;
            const viewableData = new DataVizCore.ViewableData();
            viewableData.spriteSize = 24; // Sprites as points of size 24 x 24 pixels

            for (let i = 0; i < devices.length; i++) {
                const device = devices[i];
                const style = styleMap[device.type] || styleMap['default'];
                const viewable = new DataVizCore.SpriteViewable(device.position, style, dbId);

                this.dbId2DeviceIdMap[dbId] = device.id;
                this.deviceId2DbIdMap[device.id] = dbId;
                dbId++;

                viewableData.addViewable(viewable);
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

            let devicePanelData = this.dataProvider.createDeviceTree(shadingData, false);
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
                console.log
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
                (event) => console.log(event, event.data)
            );

            dataPanelCtrl.addEventListener(
                Autodesk.DataVisualization.UI.DATA_PANEL_CONTROL_TREE_NODE_BLURRED_EVENT,
                (event) => console.log(event, event.data)
            );

            dataPanelCtrl.addEventListener(
                Autodesk.DataVisualization.UI.DATA_PANEL_CONTROL_TREE_NODE_CLICKED_EVENT,
                (event) => {
                    console.log(event, event.data?.isLeaf);
                    this.settingsToolCtrl.currentTreeNodeId = event.data?.id;
                });

            this.settingsToolCtrl.addEventListener(
                Autodesk.DataVisualization.UI.SETTINGS_TOOL_CONTROL_TREE_NODE_CLICKED_EVENT,
                (event) => {
                    console.log(event, event.data?.isLeaf);
                    this.dataPanelCtrl.currentTreeNodeId = event.data?.id;

                    if (!event.data?.isLeaf) {
                        this.setLevelSectionsByName(event.data?.id);
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
                console.log
            );

            settingsToolCtrl.addEventListener(
                Autodesk.DataVisualization.UI.SETTINGS_TOOL_CONTROL_TREE_NODE_BLURRED_EVENT,
                console.log
            );

            settingsToolCtrl.initialize();
        }

        #initTooltip() {
            //!-- Custom Tooltip
            let tooltipContainer = document.getElementById('tooltip');
            let tooltip = new Autodesk.DataVisualization.UI.CustomTooltipControl(tooltipContainer);
            tooltip.initialize();
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
                if (this.isCurrentLevel(name)) {
                    this.levelSelector.selectFloor();
                } else {
                    this.levelSelector.selectFloor(level.index, true);
                }
            } else {
                this.levelSelector.selectFloor();
            }

            return true;
        }

        async load() {
            // Pre-load level extension 
            await this.viewer.loadExtension('Autodesk.AEC.LevelsExtension', { doNotCreateUI: true, });
            await this.viewer.loadExtension('Autodesk.DataVisualization');

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