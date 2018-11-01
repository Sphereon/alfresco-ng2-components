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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { setupTestBed } from '@alfresco/adf-core';
import { TreeViewComponent } from './tree-view.component';
import { ContentTestingModule } from '../../testing/content.testing.module';
import { TreeViewService } from '../services/tree-view.service';
import { of } from 'rxjs';
import { TreeBaseNode } from '../models/tree-view.model';
/*tslint:disable*/
fdescribe('TreeViewComponent', () => {

    let fixture: ComponentFixture<TreeViewComponent>;
    let element: HTMLElement;
    let treeService: TreeViewService;
    let component: any;

    let fakeNodeList: TreeBaseNode[] = [
        { nodeId: 'fake-node-id', name: 'fake-node-name', level: 0, expandable: true }
    ];

    let fakeChildrenList: TreeBaseNode[] = [
        { nodeId: 'fake-child-id', name: 'fake-child-name', level: 0, expandable: true },
        { nodeId: 'fake-second-id', name: 'fake-second-name', level: 0, expandable: true }
    ];

    let returnRootOrChildrenNode = function(nodeId: string) {
        if (nodeId === '9999999' ) {
            return of(fakeNodeList);
        }else{
            return of(fakeChildrenList);
        }
    }

    setupTestBed({
        imports: [
            ContentTestingModule
        ],
        declarations: [
        ]
    });

    describe('When there is a nodeId', () => {

        beforeEach(async(() => {
            treeService = TestBed.get(TreeViewService);
            fixture = TestBed.createComponent(TreeViewComponent);
            element = fixture.nativeElement;
            component = fixture.componentInstance;
            spyOn(treeService,'getTreeNodes').and.callFake((nodeId) => returnRootOrChildrenNode(nodeId));
            component.nodeId = '9999999';
            fixture.detectChanges();
        }));

        it('should show the folder', async(() => {
            expect(element.querySelector('#fake-node-name-main-tree-child-node')).not.toBeNull();
        }));

        it('should show the subfolders when the folder is clicked', async(() => {
            spyOn(treeService,'getTreeNodes').and.returnValues(of(fakeNodeList), of(fakeChildrenList));
            fixture.componentInstance.nodeId = '9999999';
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                let rootFolderButton: HTMLButtonElement = <HTMLButtonElement>element.querySelector('#button-fake-node-name');

            });
        }));
    });

    describe('When no nodeId is given', () => {

        let emptyElement:HTMLElement;

        beforeEach(async(() => {
            fixture = TestBed.createComponent(TreeViewComponent);
            emptyElement = fixture.nativeElement;
        }));

        it('should show an error message when no nodeId is provided', async(() => {
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(emptyElement.querySelector('#adf-tree-view-missing-node')).toBeDefined();
                expect(emptyElement.querySelector('#adf-tree-view-missing-node')).not.toBeNull();
            });
        }));
    });
});