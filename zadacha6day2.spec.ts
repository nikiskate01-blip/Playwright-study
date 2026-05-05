import { test, expect } from '@playwright/test';

test('Задача 6: Public Single Choice тест с анонимно решаване', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `single.choice.${Date.now()}@example.com`;
    const password = 'Password123!';
    const testTitle = `Single Choice Test ${Date.now()}`;
    
    let accessToken: string | null = '';

    await test.step('Step 1-2: Register & Login', async () => {
        await request.post(`${baseUrl}/auth/register/`, {
            data: { email: userEmail, first_name: "Single", last_name: "Choice", password, password_confirm: password }
        });
        await page.goto(`${host}/login`);
        await page.locator('input[type="email"]').fill(userEmail);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/);
        accessToken = await page.evaluate(() => localStorage.getItem('access'));
    });

    await test.step('Step 3-6: Create Public Test (Max Attempts: 1)', async () => {
        await page.getByRole('link', { name: /Create.*test/i }).click();
        await page.locator('input[type="number"]').first().fill('1');
        await page.getByRole('combobox').selectOption({ value: 'public' });

        await page.locator('input[type="text"]').first().fill(testTitle);
        await page.getByRole('button', { name: 'Create & Add Questions' }).click();

        for (let i = 1; i <= 4; i++) {
            await page.getByRole('button', { name: '+ Add Question' }).click();
            await page.getByRole('combobox').selectOption({ value: 'multiple_choice' });
            await page.locator('textarea').fill(`Single Choice Question ${i}?`);
            await page.getByRole('textbox', { name: 'Answer 1' }).fill('Correct Answer');
            await page.getByRole('textbox', { name: 'Answer 2' }).fill('Wrong Answer');
            
            await page.locator('input[type="radio"]').first().check();
            await page.getByRole('button', { name: 'Save Question' }).click();
        }
    });

    await test.step('Step 7-9: Search and Anonymous Solve', async () => {
        await page.getByRole('link', { name: 'Explore' }).click();
        await page.getByPlaceholder(/Search by title/i).fill(testTitle);
        await page.waitForTimeout(1500); 

        await page.getByText(testTitle).first().click();
        
        await page.getByRole('button', { name: /Start Test/i }).click();

        const questions = page.locator('.v-card, .question-container');
        const count = await page.locator('input[type="radio"]').count();

        for (let i = 0; i < 4; i++) {
            await page.locator('input[type="radio"]').nth(i * 2).check();
        }
        await page.getByRole('button', { name: /Submit|Finish/i }).click();
    });

    await test.step('Step 10-11: Check Analytics', async () => {
        await page.goto(`${host}/dashboard`);
        await page.getByRole('link', { name:"Results"}).click();
        await page.getByRole('button', { name: 'Analytics' }).click();
        await expect(page.locator('body')).toContainText('1'); 
    });

    await test.step('Step 12-13: Delete Test & User', async () => {
        await page.goto(`${host}/dashboard`);
        await page.getByRole('button', { name: 'Delete' }).click();

        if (accessToken) {
            await request.delete(`${baseUrl}/auth/me/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
        }
    });
});
