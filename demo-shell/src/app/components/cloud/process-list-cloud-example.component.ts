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

import { Component, ViewChild, OnInit } from '@angular/core';
import { UserPreferencesService } from '@alfresco/adf-core';
import {
    ProcessListCloudComponent,
    ProcessFilterCloudModel,
    EditProcessFilterCloudComponent,
    ProcessListCloudSortingModel,
    ProcessFiltersCloudComponent
} from '@alfresco/adf-process-services-cloud';

@Component({
    selector: 'app-process-list-example',
    templateUrl: './process-list-cloud-example.component.html',
    styleUrls: ['./process-list-cloud-example.component.scss']
})
export class ProcessListCloudExampleComponent implements OnInit {

    @ViewChild('processCloud')
    processCloud: ProcessListCloudComponent;

    @ViewChild('processFiltersCloud')
    processFiltersCloud: ProcessFiltersCloudComponent;

    currentAppName: string = '';

    sortArray: any[];

    sortDirection: string;

    editedFilter: ProcessFilterCloudModel;

    currentFilter: ProcessFilterCloudModel;

    constructor(private userPreference: UserPreferencesService) {
    }

    ngOnInit() {}

    onAppClick(appClicked: any) {
        this.currentAppName = appClicked.name;
    }

    onClick() {
        this.currentAppName = '';
    }

    onChangePageSize(event) {
        this.userPreference.paginationSize = event.maxItems;
    }

    onClearFilters() {
        this.processCloud.reload();
    }

    onFilterSelected(filter) {
        this.currentFilter = Object.assign({}, filter);
    }

    onFilterChange(filter: any) {
        this.editedFilter = Object.assign({}, filter);
        this.sortArray = [new ProcessListCloudSortingModel({ orderBy: this.editedFilter.sort, direction: this.editedFilter.order })];
    }

    onEditActions(event: any) {
        if (event.actionType === EditProcessFilterCloudComponent.ACTION_SAVE) {
            this.save(event.id);
        } else if (event.actionType === EditProcessFilterCloudComponent.ACTION_SAVE_AS) {
            this.saveAs(event.id);
        } else if (event.actionType === EditProcessFilterCloudComponent.ACTION_DELETE) {
            this.deleteFilter();
        }
    }

    saveAs(filterId) {
        this.processFiltersCloud.filterParam = <any> {id : filterId};
        this.processFiltersCloud.getFilters(this.currentAppName);
    }

    save(filterId) {
        this.processFiltersCloud.filterParam = <any> {id : filterId};
        this.processFiltersCloud.getFilters(this.currentAppName);
    }

    deleteFilter() {
        this.processFiltersCloud.getFilters(this.currentAppName);
    }
}
