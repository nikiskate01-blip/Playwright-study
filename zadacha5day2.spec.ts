import { test, expect } from '@playwright/test';

test('Задача 5: Public Test с Exact Answers и проверка на опити', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `public.tester.${Date.now()}@example.com`;
    const password = 'Password123!';
    const testTitle = `Public Search Test ${Date.now()}`;
    const userName = 'QA_Runner';
    
    let accessToken: string | null = '';

    await test.step('Step 1-2: Register & Login', async () => {
        await request.post(`${baseUrl}/auth/register/`, {
            data: { email: userEmail, first_name: "Public", last_name: "Tester", password, password_confirm: password }
        });
        await page.goto(`${host}/login`);
        await page.locator('input[type="email"]').fill(userEmail);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/);
        accessToken = await page.evaluate(() => localStorage.getItem('access'));
    });

    await test.step('Step 3-6: Create Public Test', async () => {
        await page.getByRole('link', { name: /Create.*test/i }).click();

        await page.locator('label:has-text("Max Attempts") + input, input[type="number"]').nth(1).fill('3');
        await page.getByRole('combobox').selectOption({ value: 'public' });

        await page.locator('input[type="text"]').first().fill(testTitle);
        await page.getByRole('button', { name: 'Create & Add Questions' }).click();

        for (let i = 1; i <= 3; i++) {
            await page.getByRole('button', { name: '+ Add Question' }).click();
            await page.getByRole('combobox').selectOption({ value: 'exact_answer' });
            await page.locator('textarea').fill(`Question Number ${i}?`);
            await page.getByRole('textbox', { name: 'Correct Answer' }).fill(`Answer${i}`);
            await page.getByRole('button', { name: 'Save Question' }).click();
            await page.waitForTimeout(500); 
        }
    });

    await test.step('Solve Test', async () => {
        await page.getByRole('link', { name: 'Explore' }).click();
        await page.getByPlaceholder(/Search by title/i).fill(testTitle);
        await page.waitForTimeout(1000); 
        
        await page.getByText(testTitle).first().click();
        await page.getByRole('textbox', { name: /name/i }).fill(userName);
        await page.getByRole('button', { name: 'Start Test' }).click();

        const inputs = page.getByRole('textbox', { name: 'Type your answer' });
        
        await inputs.first().waitFor({ state: 'visible' });

        const count = await inputs.count(); 
        for (let i = 0; i < count; i++) {
            await inputs.nth(i).fill(`Answer${i + 1}`);
        }

        await page.getByRole('button', { name: /Submit|Finish/i }).click();
    });

    await test.step('Step 10-11: Check Attempts in Explore', async () => {
        await page.getByRole('link', { name: 'Explore' }).click();
        
        const searchField = page.getByPlaceholder(/Search by title/i);
        await searchField.click();
        await searchField.fill(testTitle);
        
        await page.waitForResponse(response => response.url().includes('/tests') && response.status() === 200).catch(() => {});
        await page.waitForTimeout(2000); 

        const testContainer = page.locator('div').filter({ hasText: testTitle }).last();
        
        const content = await testContainer.innerText();
        console.log('Съдържание на намерената карта:', content);

        await expect(testContainer).toContainText(/1x/i, { timeout: 15000 });
    });

    await test.step('Step 12-13: Second Attempt', async () => {
        await page.getByText(testTitle).first().click();
        await page.getByRole('textbox', { name: /name/i }).fill(userName);
        await page.getByRole('button', { name: 'Start Test' }).click();

        const inputs = page.getByRole('textbox', { name: 'Type your answer' });
        
        await inputs.first().waitFor({ state: 'visible' });

        const count = await inputs.count(); 
        for (let i = 0; i < count; i++) {
            await inputs.nth(i).fill(`Answer${i + 1}`);
        }

        await page.getByRole('button', { name: /Submit|Finish/i }).click();
    });

    await test.step('Step 14-15: Verify Analytics', async () => {
        await page.goto(`${host}/dashboard`);
        await page.getByRole('link', { name:"Results"}).click();
        await page.getByRole('button', { name: 'Analytics' }).click();
        await expect(page.locator('body')).toContainText(/2/); 
    });

    await test.step('Step 16-17: Cleanup', async () => {
        await page.goto(`${host}/dashboard`);
        await page.getByRole('button', { name: 'Delete' }).click();

        if (accessToken) {
            await request.delete(`${baseUrl}/auth/me/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
        }
    });
});
