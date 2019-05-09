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

import { CardViewItem, ObjectUtils } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { MinimalNodeEntryEntity } from 'alfresco-js-api';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CardViewGroup, OrganisedPropertyGroup } from '../interfaces/content-metadata.interfaces';
import { BasicPropertiesService } from './basic-properties.service';
import { ContentMetadataConfigFactory } from './config/content-metadata-config.factory';
import { PropertyDescriptorsService } from './property-descriptors.service';
import { PropertyGroupTranslatorService } from './property-groups-translator.service';

@Injectable()
export class ContentMetadataService {

    constructor(private basicPropertiesService: BasicPropertiesService,
                private contentMetadataConfigFactory: ContentMetadataConfigFactory,
                private propertyGroupTranslatorService: PropertyGroupTranslatorService,
                private propertyDescriptorsService: PropertyDescriptorsService) {
    }

    getBasicProperties(node: MinimalNodeEntryEntity): Observable<CardViewItem[]> {
        return of(this.basicPropertiesService.getProperties(node));
    }

    getGroupedProperties(node: MinimalNodeEntryEntity, presetName: string = 'default'): Observable<CardViewGroup[]> {
        const config = this.contentMetadataConfigFactory.get(presetName);
        if (node.aspectNames) {
            // const groupNames = ['basic']
            // .concat(node.nodeType)
            const groupNames = []
                .concat(node.aspectNames)
                .filter((groupName) => config.isGroupAllowed(groupName));

            if (groupNames.length > 0) {
                const propertyValues = this.mergeBasicProperties(node);
                return this.propertyDescriptorsService.load(groupNames)
                    .pipe(
                        map((groups) => config.reorganiseByConfig(groups)),
                        // map((groups) => this.setTitleToNameIfNotSet(groups)),
                        map((groups) => this.propertyGroupTranslatorService.translateToCardViewGroups(groups, propertyValues))
                    );
            }
        }

        return of([]);
    }

    private mergeBasicProperties(node: MinimalNodeEntryEntity) {
        const basicProperties = {
            'cm:name': node.name,
            'cm:creator': node.createdByUser,
            'cm:created': node.createdAt,
            'cm:modifier': node.modifiedByUser,
            'cm:modified': node.modifiedAt
        };

        let contentProperties = {};
        if (node.content != null) {
            contentProperties = {
                'cm:content.size': node.content.sizeInBytes,
                'cm:content.mimetype': node.content.mimeType,
                'cm:content.encoding': node.content.encoding
            };
        }

        return ObjectUtils.merge(basicProperties, contentProperties, node.properties);
    }

    setTitleToNameIfNotSet(propertyGroups: OrganisedPropertyGroup[]): OrganisedPropertyGroup[] {
        propertyGroups.map((propertyGroup) => {
            propertyGroup.title = propertyGroup.title || propertyGroup.name;
        });
        return propertyGroups;
    }
}
