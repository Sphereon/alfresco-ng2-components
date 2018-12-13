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

import { HyperlinksPipe } from './hyperlinks.pipe';

describe('HyperlinksPipe', () => {
    it('should format hyperlinks', () => {
        const pipe = new HyperlinksPipe();
        expect(pipe.transform('Foo')).toEqual('Foo');
        expect(pipe.transform(null)).toBeNull();

        expect(pipe.transform('[Bar|http://foo]')).toEqual('<a href="http://foo" target="_blank">Bar</a>');
        expect(pipe.transform('[Bar|http://foo][Bar|http://foo]')).toEqual('<a href="http://foo" target="_blank">Bar</a><a href="http://foo" target="_blank">Bar</a>');
        expect(pipe.transform(`Link 1: [Bar|http://foo]
Link 2: [Bar|http://foo]`
        )).toEqual(`Link 1: <a href="http://foo" target="_blank">Bar</a>
Link 2: <a href="http://foo" target="_blank">Bar</a>`);

        expect(pipe.transform(`Per file chain: [factom link:https://explorer.factom.com/chains/bc258163808e8ced4b76d87eaeeb322848f22d3dc456bb9b7bcf60e6ae49917a]
        [factoid link|https://explorer.factoid.org/data?type=chain&key=bc258163808e8ced4b76d87eaeeb322848f22d3dc456bb9b7bcf60e6ae49917a]`))
            .toEqual(`Per file chain: [factom link:https://explorer.factom.com/chains/bc258163808e8ced4b76d87eaeeb322848f22d3dc456bb9b7bcf60e6ae49917a]
<a href="https://explorer.factoid.org/data?type=chain&key=bc258163808e8ced4b76d87eaeeb322848f22d3dc456bb9b7bcf60e6ae49917a" target="_blank">factoid link</a>`);
    });
});
