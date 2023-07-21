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

(function () {
    function fetchForgeToken(callback) {
        fetch('http://localhost:8091/api/oauth/token', {
            method: 'get',
            headers: new Headers({ 'Content-Type': 'application/json' })
        })
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    return Promise.reject(
                        new Error(`Failed to fetch token from server (status: ${response.status}, message: ${response.statusText})`)
                    );
                }
            })
            .then((data) => {
                if (!data) return Promise.reject(new Error('Empty token response'));

                callback(data.access_token, data.expires_in);
            })
            .catch((error) => console.error(error));
    }

    let options = {
        env: 'AutodeskProduction',
        getAccessToken: fetchForgeToken
    };

    Autodesk.Viewing.Initializer(options, function () {
        let htmlDiv = document.getElementById('forgeViewer');
        let config3d = {
            extensions: ['IotConnectedExtension']
        };

        let viewer = new Autodesk.Viewing.GuiViewer3D(htmlDiv, config3d);
        let startedCode = viewer.start();
        if (startedCode > 0) {
            console.error('Failed to create a Viewer: WebGL not supported.');
            return;
        }

        let documentId = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6OWR5YXI1enNtZ2NsaWJiYWVuaHQ5YmFjaWYyMnpvN3ctc2FuZGJveC9yYWNfYWR2YW5jZWRfc2FtcGxlX3Byb2plY3Rfbm9fbWFzcy5ydnQ';
        Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);

        async function onDocumentLoadSuccess(viewerDocument) {
            const root = viewerDocument.getRoot();

            const viewables = root.search({ 'type': 'geometry', 'role': '3d' });
            console.log('Viewables:', viewables);

            const phaseViews = viewables.filter(v => v.data.name === v.data.phaseNames && v.getViewableRootPath().includes('08f99ae5-b8be-4f8d-881b-128675723c10'));
            console.log('Master Views:', phaseViews);

            const defaultModel = phaseViews[0];

            await viewerDocument.downloadAecModelData();
            viewer.loadDocumentNode(viewerDocument, defaultModel);
        }

        function onDocumentLoadFailure() {
            console.error('Failed fetching Forge manifest');
        }
    });
})();