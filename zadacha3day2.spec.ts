import { test, expect } from '@playwright/test';

test('Задача 3: Тест с таймаут и Link Only - Финална версия', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `tester.${Date.now()}@example.com`;
    const password = 'Password123!';
    const testTitle = `Timeout Test ${Date.now()}`;
    
    let accessToken: string | null = '';
    let testLink: string = '';
    await test.step('Step 1: Register', async () => {
        const response = await request.post(`${baseUrl}/auth/register/`, {
            data: {
                email: userEmail,
                first_name: "Timeout",
                last_name: "Tester",
                password: password,
                password_confirm: password
            }
        });
        expect(response.status()).toBe(201);
    });
    await test.step('Step 2: Login', async () => {
        await page.goto(`${host}/login`);
        await page.locator('input[type="email"]').fill(userEmail);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/);

        accessToken = await page.evaluate(() => localStorage.getItem('access'));
    });

    await test.step('Step 3-6: Create Test', async () => {
        await page.getByRole('link', { name: 'Create Test' }).click();
        
        await page.getByRole('spinbutton').first().fill('1'); 

        await page.getByRole('combobox').selectOption({ value: 'link_only' });
        await page.locator('input[type="text"]').fill(testTitle);
        await page.getByRole('button', { name: 'Create & Add Questions' }).click();

        await page.getByRole('button', { name: '+ Add Question' }).click();
        await page.locator('textarea').fill('Auto-generated question?');
        await page.getByRole('textbox', { name: 'Answer 1' }).fill('Yes');
        await page.getByRole('textbox', { name: 'Answer 2' }).fill('No');
        await page.getByRole('radio').first().check();

        const urlField = page.locator('input[readonly], input[value^="http"]');
        await expect(urlField).not.toBeEmpty();
        testLink = await urlField.inputValue();
        console.log('Копиран линк за теста:', testLink);

        await page.getByRole('button', { name: 'Save Question' }).click();
    });

    await test.step('Step 7-8: Wait for Timeout', async () => {
        await page.goto(testLink);
        await page.getByRole('textbox', { name: 'Your name (optional)' }).fill('Auto_User');
        await page.getByRole('button', { name: 'Start Test' }).click();

        console.log('Изчакване на 62 секунди...');
        await page.waitForTimeout(62000); 

        await expect(async () => {
            const bodyText = await page.innerText('body');
            expect(bodyText.includes('Time') || page.url().includes('results') || page.url().includes('dashboard')).toBeTruthy();
        }).toPass({ timeout: 10000 });
    });

    await test.step('Step 9-10: Check Results', async () => {
        await page.goto(`${host}/dashboard`);
        
        const testRow = page.locator('.v-card', { hasText: testTitle }).last();
        await page.getByRole('link', { name:"Results"}).click();
        await page.getByRole('button', { name: 'Analytics' }).click();
        await page.waitForLoadState('networkidle');

        const resultsContent = page.locator('main, .v-container');
        
        await expect(resultsContent).toContainText(/0/);
        const noDataMessage = page.getByText(/No attempts|No data|0 answered/i);
        
        console.log('Текущ URL на резултатите:', page.url());
        await expect(page.locator('body')).toContainText('0');
    });

    await test.step('Step 11: Delete Test', async () => {
        await page.goto(`${host}/dashboard`);
        const testRow = page.locator('.v-card, .test-row', { hasText: testTitle }).last();
        await page.getByRole('button', { name: 'Delete' }).click();
        
        const confirmBtn = page.getByRole('button', { name: /Confirm|OK/i });
        if (await confirmBtn.isVisible()) await confirmBtn.click();
    });

    await test.step('Step 12: Delete User', async () => {
        if (!accessToken) return;

        const response = await request.delete(`${baseUrl}/auth/me/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        expect([200, 204]).toContain(response.status());
    });
});
