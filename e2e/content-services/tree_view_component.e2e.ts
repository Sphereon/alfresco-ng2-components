/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LoginPage } from '../pages/adf/loginPage';
import { NavigationBarPage } from '../pages/adf/navigationBarPage';
import { TreeViewPage } from '../pages/adf/content_services/treeViewPage';

import AcsUserModel = require('../models/ACS/acsUserModel');

import TestConfig = require('../test.config');

import AlfrescoApi = require('alfresco-js-api-node');
import { UploadActions } from '../actions/ACS/upload.actions';

describe('Tree View Component', () => {

    const loginPage = new LoginPage();
    const navigationBarPage = new NavigationBarPage();
    const treeViewPage = new TreeViewPage();

    let acsUser = new AcsUserModel();
    let uploadActions = new UploadActions();

    let treeFolder, secondTreeFolder;

    let nodeNames = {
        folder: 'Folder1',
        secondFolder: 'Folder2',
        thirdFolder: 'Folder3',
        parentFolder: '-my-'
    };

    beforeAll(async (done) => {

        this.alfrescoJsApi = new AlfrescoApi({
            provider: 'ECM',
            hostEcm: TestConfig.adf.url
        });

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);

        treeFolder = await this.alfrescoJsApi.nodes.addNode(nodeNames.parentFolder, {name: nodeNames.folder, nodeType: 'cm:folder'});
        secondTreeFolder = await this.alfrescoJsApi.nodes.addNode(nodeNames.parentFolder, {name: nodeNames.secondFolder, nodeType: 'cm:folder'});
        await this.alfrescoJsApi.nodes.addNode(secondTreeFolder.entry.id, {name: nodeNames.thirdFolder, nodeType: 'cm:folder'});

        loginPage.loginToContentServicesUsingUserModel(acsUser);

        navigationBarPage.clickTreeViewButton();

        done();
    });

    afterAll(async (done) => {
        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        await uploadActions.deleteFilesOrFolder(this.alfrescoJsApi, treeFolder.entry.id);
        await uploadActions.deleteFilesOrFolder(this.alfrescoJsApi, secondTreeFolder.entry.id);

        done();
    });

    it('[C289972] Should be able to show folders and sub-folders of a node as a tree view', () => {
        treeViewPage.checkTreeViewTitleIsDisplayed();

        expect(treeViewPage.getNodeId()).toEqual(nodeNames.parentFolder);

        treeViewPage.checkNodeIsDisplayedAsClosed(nodeNames.folder);
        treeViewPage.checkNodeIsDisplayedAsClosed(nodeNames.secondFolder);

        treeViewPage.clickNode(nodeNames.secondFolder);

        treeViewPage.checkClickedNodeName(nodeNames.secondFolder);
        treeViewPage.checkNodeIsDisplayedAsOpen(nodeNames.secondFolder);
        treeViewPage.checkNodeIsDisplayedAsClosed(nodeNames.thirdFolder);

        treeViewPage.clickNode(nodeNames.thirdFolder);

        treeViewPage.checkClickedNodeName(nodeNames.thirdFolder);
        treeViewPage.checkNodeIsDisplayedAsOpen(nodeNames.thirdFolder);

        treeViewPage.clickNode(nodeNames.secondFolder);

        treeViewPage.checkClickedNodeName(nodeNames.secondFolder);
        treeViewPage.checkNodeIsDisplayedAsClosed(nodeNames.secondFolder);
        treeViewPage.checkNodeIsNotDisplayed(nodeNames.thirdFolder);
    });

    it('[C289973] Should be able to change the default nodeId', () => {
        treeViewPage.clearNodeIdInput();

        treeViewPage.checkNoNodeIdMessageIsDisplayed();
        treeViewPage.addNodeId(secondTreeFolder.entry.id);

        treeViewPage.checkNodeIsDisplayedAsClosed(nodeNames.thirdFolder);
    });

});
