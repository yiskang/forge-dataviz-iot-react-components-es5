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

//!-- HeatmapOptions

var propIdGradientMap = {
    Temperature: [0x0000ff, 0x00ff00, 0xffff00, 0xff0000],
    Humidity: [0x00f260, 0x0575e6],
    "CO₂": [0x1e9600, 0xfff200, 0xff0000]
};

var deviceModelProperties = (() => {
    let data = [
        {
            "id": "d370a293-4bd5-4bdb-a3df-376dc131d44c",
            "name": "Human Comfort Sensor",
            "description": "Monitors indoor air quality by measuring levels of Carbon Dioxide (CO2), temperature, and humidity.",
            "properties": [
                {
                    "id": "Temperature",
                    "name": "Temperature",
                    "description": "External temperature in Fahrenheit",
                    "dataType": "double",
                    "dataUnit": "Celsius",
                    "rangeMin": "18.00",
                    "rangeMax": "28.00"
                },
                {
                    "id": "Humidity",
                    "name": "Humidity",
                    "description": "Relative humidity in percentage",
                    "dataType": "double",
                    "dataUnit": "%RH",
                    "rangeMin": "23.09",
                    "rangeMax": "49.09"
                },
                {
                    "id": "CO₂",
                    "name": "CO₂",
                    "description": "Level of carbon dioxide (CO₂)",
                    "dataType": "double",
                    "dataUnit": "ppm",
                    "rangeMin": "482.81",
                    "rangeMax": "640.00"
                }
            ]
        }
    ];

    let deviceModels = Object.values(data);
    let nestedList = deviceModels.map(dm => Object.values(dm.properties)).flat();
    let filteredMap = new Map(nestedList.map((obj) => [`${obj.id}`, obj]));
    return filteredMap;
})();

//!-- HyperionToolContainer

var devicePanelData = JSON.parse('[{"id":"01 - Entry Level","name":"01 - Entry Level","propIds":[],"children":[{"id":"Hyperion-6","name":"Lobby 102 North","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-7","name":"Lobby 102 South","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-9","name":"Cafeteria 121 East","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-8","name":"Cafeteria 121 West","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-10","name":"Conference 123","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-2","name":"Instruction 115","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-5","name":"Instruction 108","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-4","name":"Instruction 106","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-3","name":"Instruction 105","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-1","name":"Conference 103","propIds":["Temperature","Humidity","CO₂"],"children":[]}]},{"id":"02 - Floor","name":"02 - Floor","propIds":[],"children":[{"id":"Hyperion-20","name":"Instruction 204","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-18","name":"Corridor 225","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-12","name":"Lobby 216 South","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-11","name":"Lobby 216 North","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-13","name":"Instruction 218","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-17","name":"Computer Lab 222","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-14","name":"Lounge 223","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-19","name":"Corridor 234","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-16","name":"Drafting 208","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-15","name":"Computer Lab 209","propIds":["Temperature","Humidity","CO₂"],"children":[]}]},{"id":"03 - Floor","name":"03 - Floor","propIds":[],"children":[{"id":"Hyperion-27","name":"Instruction 302","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-30","name":"Instruction 304","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-26","name":"Instruction 306","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-24","name":"Instruction 313","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-25","name":"Instruction 314","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-22","name":"Lobby 318 South","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-21","name":"Lobby 318 North","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-29","name":"Media Review 319","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-23","name":"Open Office 321","propIds":["Temperature","Humidity","CO₂"],"children":[]},{"id":"Hyperion-28","name":"Conference 325","propIds":["Temperature","Humidity","CO₂"],"children":[]}]}]');

//!-- DataPanelContainer


//!-- Custom Tooltip
