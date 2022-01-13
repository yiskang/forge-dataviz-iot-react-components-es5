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

const timeResolutions = [
    { symbol: 'P1D', label: '1 day' },
    { symbol: 'PT6H', label: '6 hrs' },
    { symbol: 'PT1H', label: '1 hr' },
    { symbol: 'PT15M', label: '15 mins' },
    { symbol: 'PT5M', label: '5 min' }
];

const isSupportedTimeResolution = (resolution) => {
    for (let i = 0; i < timeResolutions.length; ++i) {
        if (timeResolutions[i].symbol === resolution)
            return true;
    }
    return false;
};

const getSupportedTimeResolutions = () => {
    return timeResolutions.slice();
};

const ns = AutodeskNamespace('Autodesk.DataVisualization.UI');

ns.isSupportedTimeResolution = isSupportedTimeResolution;
ns.getSupportedTimeResolutions = getSupportedTimeResolutions;

export {
    getSupportedTimeResolutions,
    isSupportedTimeResolution
};