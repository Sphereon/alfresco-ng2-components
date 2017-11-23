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

import { ContentService, ThumbnailService } from '@alfresco/adf-core';
import { Component, EventEmitter, Input, NgZone, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ProcessContentService } from '@alfresco/adf-core';

@Component({
    selector: 'adf-process-attachment-list',
    styleUrls: ['./process-attachment-list.component.scss'],
    templateUrl: './process-attachment-list.component.html'
})
export class ProcessAttachmentListComponent implements OnChanges {

    @Input()
    processInstanceId: string;

    @Input()
    disabled: boolean = false;

    @Output()
    attachmentClick = new EventEmitter();

    @Output()
    success = new EventEmitter();

    @Output()
    error: EventEmitter<any> = new EventEmitter<any>();

    @Input()
    emptyListImageUrl: string = './assets/images/empty_doc_lib.svg';

    attachments: any[] = [];
    isLoading: boolean = true;

    constructor(private activitiContentService: ProcessContentService,
                private contentService: ContentService,
                private thumbnailService: ThumbnailService,
                private ngZone: NgZone) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['processInstanceId'] && changes['processInstanceId'].currentValue) {
            this.loadAttachmentsByProcessInstanceId(changes['processInstanceId'].currentValue);
        }
    }

    reset() {
        this.attachments = [];
    }

    reload(): void {
        this.ngZone.run(() => {
            this.loadAttachmentsByProcessInstanceId(this.processInstanceId);
        });
    }

    add(content: any): void {
        this.ngZone.run(() => {
            this.attachments.push({
                id: content.id,
                name: content.name,
                created: content.created,
                createdBy: content.createdBy.firstName + ' ' + content.createdBy.lastName,
                icon: this.thumbnailService.getMimeTypeIcon(content.mimeType)
            });
        });
    }

    private loadAttachmentsByProcessInstanceId(processInstanceId: string) {
        if (processInstanceId) {
            this.reset();
            this.isLoading = true;
            this.activitiContentService.getProcessRelatedContent(processInstanceId).subscribe(
                (res: any) => {
                    res.data.forEach(content => {
                        this.attachments.push({
                            id: content.id,
                            name: content.name,
                            created: content.created,
                            createdBy: content.createdBy.firstName + ' ' + content.createdBy.lastName,
                            icon: this.thumbnailService.getMimeTypeIcon(content.mimeType)
                        });
                    });
                    this.success.emit(this.attachments);
                    this.isLoading = false;
                },
                (err) => {
                    this.error.emit(err);
                    this.isLoading = false;
                });
        }
    }

    private deleteAttachmentById(contentId: number) {
        if (contentId) {
            this.activitiContentService.deleteRelatedContent(contentId).subscribe(
                (res: any) => {
                    this.attachments = this.attachments.filter(content => {
                        return content.id !== contentId;
                    });
                },
                (err) => {
                    this.error.emit(err);
                });
        }
    }

    isEmpty(): boolean {
        return this.attachments && this.attachments.length === 0;
    }

    onShowRowActionsMenu(event: any) {
        let viewAction = {
            title: 'ADF_PROCESS_LIST.MENU_ACTIONS.VIEW_CONTENT',
            name: 'view'
        };

        let removeAction = {
            title: 'ADF_PROCESS_LIST.MENU_ACTIONS.REMOVE_CONTENT',
            name: 'remove'
        };

        let downloadAction = {
            title: 'ADF_PROCESS_LIST.MENU_ACTIONS.DOWNLOAD_CONTENT',
            name: 'download'
        };

        event.value.actions = [
            viewAction,
            downloadAction
        ];

        if (!this.disabled) {
            event.value.actions.splice(1, 0, removeAction);
        }
    }

    onExecuteRowAction(event: any) {
        let args = event.value;
        let action = args.action;
        if (action.name === 'view') {
            this.emitDocumentContent(args.row.obj);
        } else if (action.name === 'remove') {
            this.deleteAttachmentById(args.row.obj.id);
        } else if (action.name === 'download') {
            this.downloadContent(args.row.obj);
        }
    }

    openContent(event: any): void {
        let content = event.value.obj;
        this.emitDocumentContent(content);
    }

    emitDocumentContent(content: any) {
        this.activitiContentService.getFileRawContent(content.id).subscribe(
            (blob: Blob) => {
                content.contentBlob = blob;
                this.attachmentClick.emit(content);
            },
            (err) => {
                this.error.emit(err);
            }
        );
    }

    downloadContent(content: any): void {
        this.activitiContentService.getFileRawContent(content.id).subscribe(
            (blob: Blob) => this.contentService.downloadBlob(blob, content.name),
            (err) => {
                this.error.emit(err);
            }
        );
    }

    isDisabled(): boolean {
        return this.disabled;
    }
}