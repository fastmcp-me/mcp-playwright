/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { z } from 'zod';
import { defineTabTool } from './tool.js';
import { callOnPageNoTrace } from './utils.js';

const playwrightCode = defineTabTool({
    capability: 'core',
    schema: {
        name: 'browser_playwright_code',
        title: 'Execute Playwright Code',
        description: 'Execute arbitrary Playwright code directly. This allows for advanced automation tasks that are not covered by other tools. The code should be wrapped in an async function. Example: (async () => { await page.goto("https://example.com"); await page.fill("input[name="search"]", "test"); await page.click("button[type="submit"]"); })()',
        inputSchema: z.object({
            code: z.string().describe('Playwright code to execute. The code should be a valid JavaScript function that takes a page object as parameter.'),
        }),
        type: 'destructive',
    },
    handle: async (tab, params, response) => {
        response.setIncludeSnapshot();
        response.addCode(`// Executing custom Playwright code`);
        response.addCode(params.code);
        
        try {
            // Create a function from the provided code string
            const executeFunction = new Function('page', params.code);
            
            // Execute the function with the page object
            const result = await callOnPageNoTrace(tab.page, async (page) => {
                return await executeFunction(page);
            });
            
            response.addResult(JSON.stringify(result, null, 2) || 'undefined');
        } catch (error) {
            response.addError(`Error: ${error.message}`);
        }
    },
});

export default [
    playwrightCode,
];