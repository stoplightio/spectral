import { HTMLElement, parse } from 'node-html-parser';
import { html } from '../html';

const mixedErrors = require('./__fixtures__/mixed-errors.json');

describe('HTML formatter', () => {
  test('should display proper severity levels', () => {
    const result = parse(html(mixedErrors)) as HTMLElement;
    const table = result.querySelector('table tbody');
    expect(table.innerHTML.trim()).toEqual(`<tr class="bg-error" data-group="f-0">
    <th colspan="4">
        [+] /home/Stoplight/spectral/src/__tests__/__fixtures__/petstore.oas3.json
        <span>6 problems (1 error, 1 warning, 3 infos, 1 hint)</span>
    </th>
</tr>
<tr style="display:none" class="f-0">
    <td>3:10</td>
    <td class="severity clr-hint">hint</td>
    <td>Info object should contain \`contact\` object.</td>
</tr>

<tr style="display:none" class="f-0">
    <td>3:10</td>
    <td class="severity clr-warning">warning</td>
    <td>OpenAPI object info \`description\` must be present and non-empty string.</td>
</tr>

<tr style="display:none" class="f-0">
    <td>5:14</td>
    <td class="severity clr-error">error</td>
    <td>Info must contain Stoplight</td>
</tr>

<tr style="display:none" class="f-0">
    <td>17:13</td>
    <td class="severity clr-information">information</td>
    <td>Operation \`description\` must be present and non-empty string.</td>
</tr>

<tr style="display:none" class="f-0">
    <td>64:14</td>
    <td class="severity clr-information">information</td>
    <td>Operation \`description\` must be present and non-empty string.</td>
</tr>

<tr style="display:none" class="f-0">
    <td>86:13</td>
    <td class="severity clr-information">information</td>
    <td>Operation \`description\` must be present and non-empty string.</td>
</tr>`);
  });
});
