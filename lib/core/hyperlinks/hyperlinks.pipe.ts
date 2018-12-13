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

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'hyperlinks'
})
export class HyperlinksPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        if (value === null || (typeof value !== 'string' && typeof value !== 'object')) {
            return value;
        }

        const exp = /[[]([^[|\]]*)[|]([^\]]+)[\]]/ig;
        return ('' + value).replace(exp, '<a href="$2" target="_blank">$1</a>');
    }
}
