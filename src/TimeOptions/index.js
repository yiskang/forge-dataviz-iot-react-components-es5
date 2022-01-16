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

/**
 * Time slice selection of the timeline object.
 * @class
 * 
 * @memberof Autodesk.DataVisualization.UI
 * @alias Autodesk.DataVisualization.UI.TimeOptions
 */
 class TimeOptions {
    /**
     * @param {Date} startTime The start time for the time range selected in the slider.
     * @param {Date} endTime The end time for the time range selected in the slider.
     * @param {Date} currentTime The current time for the current time indicator in the slider.
     * @param {string} [resolution='PT1H'] Current resolution of data. Ex. PT1H, PT15M etc.
     * @constructor
     */
    constructor(startTime, endTime, currentTime, resolution = 'PT1H') {
        this.endTime = endTime;
        this.startTime = startTime;
        this.resolution = resolution;
        this.currentTime = currentTime;
    }
}

const ns = AutodeskNamespace('Autodesk.DataVisualization.UI');

ns.TimeOptions = TimeOptions;

export {
    TimeOptions
};