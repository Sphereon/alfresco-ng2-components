import { Component, ViewEncapsulation, OnChanges, AfterContentInit, ContentChild, Output, EventEmitter, SimpleChanges, SimpleChange, Input } from '@angular/core';
import { DataTableSchema, PaginatedComponent,
         EmptyCustomContentDirective, AppConfigService,
         UserPreferencesService, PaginationModel,
         UserPreferenceValues, DataRowEvent } from '@alfresco/adf-core';
import { ProcessListCloudService } from '../services/process-list-cloud.service';
import { BehaviorSubject } from 'rxjs';
import { processCloudPresetsDefaultModel } from '../models/process-cloud-preset.model';
import { ProcessQueryCloudRequestModel } from '../models/process-cloud-query-request.model';

@Component({
    selector: 'adf-cloud-process-list',
    templateUrl: './process-list-cloud.component.html',
    styleUrls: ['./process-list-cloud.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class ProcessListCloudComponent extends DataTableSchema implements OnChanges, AfterContentInit, PaginatedComponent {

    static PRESET_KEY = 'adf-cloud-process-list.presets';

    @ContentChild(EmptyCustomContentDirective)
    emptyCustomContent: EmptyCustomContentDirective;

    @Input()
    applicationName: string = '';

    @Input()
    appVersion: string = '';

    @Input()
    initiator: string = '';

    @Input()
    id: string = '';

    @Input()
    name: string = '';

    @Input()
    processDefinitionId: string = '';

    @Input()
    processDefinitionKey: string = '';

    @Input()
    serviceFullName: string = '';

    @Input()
    serviceName: string = '';

    @Input()
    serviceType: string = '';

    @Input()
    serviceVersion: string = '';

    @Input()
    status: string = '';

    @Input()
    businessKey: string = '';

    @Input()
    selectFirstRow: boolean = true;

    @Input()
    landingTaskId: string;

    @Input()
    selectionMode: string = 'single'; // none|single|multiple

    /** Toggles multiple row selection, renders checkboxes at the beginning of each row */
    @Input()
    multiselect: boolean = false;

    // @Input()
    // sorting: TaskListCloudSortingModel[];

    @Output()
    rowClick: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    rowsSelected: EventEmitter<any[]> = new EventEmitter<any[]>();

    @Output()
    error: EventEmitter<any> = new EventEmitter<any>();

    @Output()
    success: EventEmitter<any> = new EventEmitter<any>();

    pagination: BehaviorSubject<PaginationModel>;
    size: number;
    skipCount: number = 0;
    currentInstanceId: string;
    selectedInstances: any[];
    isLoading = false;
    rows: any[] = [];
    requestNode: ProcessQueryCloudRequestModel;

    constructor(private processListCloudService: ProcessListCloudService,
                appConfigService: AppConfigService,
                private userPreferences: UserPreferencesService) {
        super(appConfigService, ProcessListCloudComponent.PRESET_KEY, processCloudPresetsDefaultModel);
        this.size = userPreferences.paginationSize;
        this.userPreferences.select(UserPreferenceValues.PaginationSize).subscribe((pageSize) => {
            this.size = pageSize;
        });
        this.pagination = new BehaviorSubject<PaginationModel>(<PaginationModel>{
            maxItems: this.size,
            skipCount: 0,
            totalItems: 0
        });
    }

    ngAfterContentInit() {
        this.createDatatableSchema();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.isPropertyChanged(changes) &&
            !this.isEqualToCurrentId(changes['landingTaskId'])) {
            this.reload();
        }
    }

    getCurrentId(): string {
        return this.currentInstanceId;
    }

    reload(): void {
        this.requestNode = this.createRequestNode();
        if (this.requestNode.appName) {
            this.load(this.requestNode);
        } else {
            this.rows = [];
        }
    }

    private load(requestNode: ProcessQueryCloudRequestModel) {
        this.isLoading = true;
        this.processListCloudService.getProcessByRequest(requestNode).subscribe(
            (processes) => {
                this.rows = processes.list.entries;
                // this.selectTask(this.landingTaskId);
                this.success.emit(processes);
                this.isLoading = false;
                this.pagination.next(processes.list.pagination);
            }, (error) => {
                this.error.emit(error);
                this.isLoading = false;
            });
    }

    private isEqualToCurrentId(landingTaskChanged: SimpleChange): boolean {
        return landingTaskChanged && this.currentInstanceId === landingTaskChanged.currentValue;
    }

    private isPropertyChanged(changes: SimpleChanges): boolean {
        for (let property in changes) {
            if (changes.hasOwnProperty(property)) {
                if (changes[property] &&
                    (changes[property].currentValue !== changes[property].previousValue)) {
                    return true;
                }
            }
        }
        return false;
    }

    updatePagination(pagination: PaginationModel) {
        this.size = pagination.maxItems;
        this.skipCount = pagination.skipCount;
        this.pagination.next(pagination);
        this.reload();
    }

    onRowClick(item: DataRowEvent) {
        this.currentInstanceId = item.value.getValue('entry.id');
        this.rowClick.emit(this.currentInstanceId);
    }

    onRowSelect(event: CustomEvent) {
        this.selectedInstances = [...event.detail.selection];
        this.rowsSelected.emit(this.selectedInstances);
    }

    onRowUnselect(event: CustomEvent) {
        this.selectedInstances = [...event.detail.selection];
        this.rowsSelected.emit(this.selectedInstances);
    }

    onRowKeyUp(event: CustomEvent) {
        if (event.detail.keyboardEvent.key === 'Enter') {
            event.preventDefault();
            this.currentInstanceId = event.detail.row.getValue('entry.id');
            this.rowClick.emit(this.currentInstanceId);
        }
    }

    private createRequestNode(): ProcessQueryCloudRequestModel {
        let requestNode = {
            appName: this.applicationName,
            appVersion: this.appVersion,
            maxItems: this.size,
            skipCount: this.skipCount,
            initiator: this.initiator,
            id: this.id,
            name: this.name,
            processDefinitionId: this.processDefinitionId,
            processDefinitionKey: this.processDefinitionKey,
            serviceFullName: this.serviceFullName,
            serviceName: this.serviceName,
            serviceType: this.serviceType,
            serviceVersion: this.serviceVersion,
            status: this.status,
            businessKey: this.businessKey
        };
        return new ProcessQueryCloudRequestModel(requestNode);
    }

}