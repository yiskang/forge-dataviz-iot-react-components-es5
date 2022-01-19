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

import {
    QueryParam,
    DataAdapter,
    AzureDataAdapter,
    RestApiDataAdapter,
    PropertyValue,
    AggregatedValues,
    PropertyData,
    DeviceData,
    Device,
    DeviceProperty,
    DeviceModel,
    EventType,
    EventSource,
    QueryCompletedEventArgs,
    Session,
    DateTimeSpan,
    DataView,
    DataStore
} from 'forge-dataviz-iot-data-modules/client';

const ns = AutodeskNamespace('Autodesk.DataVisualization.Data');

ns.QueryParam = QueryParam;
ns.DataAdapter = DataAdapter;
ns.AzureDataAdapter = AzureDataAdapter;
ns.RestApiDataAdapter = RestApiDataAdapter;
ns.PropertyValue = RestApiDataAdapter;
ns.AggregatedValues = AggregatedValues;
ns.PropertyData = PropertyData;
ns.DeviceData = DeviceData;
ns.Device = Device;
ns.DeviceProperty = DeviceProperty;
ns.DeviceModel = DeviceModel;
ns.EventType = EventType;
ns.EventSource = EventSource;
ns.QueryCompletedEventArgs = QueryCompletedEventArgs;
ns.Session = Session;
ns.DateTimeSpan = DateTimeSpan;
ns.DataView = DataView;
ns.DataStore = DataStore;

export {
    QueryParam,
    DataAdapter,
    AzureDataAdapter,
    RestApiDataAdapter,
    PropertyValue,
    AggregatedValues,
    PropertyData,
    DeviceData,
    Device,
    DeviceProperty,
    DeviceModel,
    EventType,
    EventSource,
    QueryCompletedEventArgs,
    Session,
    DateTimeSpan,
    DataView,
    DataStore
};