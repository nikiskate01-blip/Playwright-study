import { test, expect } from '@playwright/test';

test('Задача 4: Multiple Select Тест с парола', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `pass.tester.${Date.now()}@example.com`;
    const password = 'Password123!';
    const testPassword = 'TestPassword555';
    const testTitle = `Password Test ${Date.now()}`;
    
    let accessToken: string | null = '';
    let testLink: string = '';

    await test.step('Step 1-2: Register & Login', async () => {
        await request.post(`${baseUrl}/auth/register/`, {
            data: { email: userEmail, first_name: "Pass", last_name: "Tester", password, password_confirm: password }
        });
        await page.goto(`${host}/login`);
        await page.locator('input[type="email"]').fill(userEmail);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/);
        accessToken = await page.evaluate(() => localStorage.getItem('access'));
    });

    await test.step('Step 3-6: Create Password Protected Test', async () => {
        await page.getByRole('link', { name: /Create.*test/i }).click();
        
        await page.getByRole('spinbutton').first().fill('5'); 
        await page.getByRole('combobox').selectOption({ value: 'password_protected' });

        await page.locator('input[type="password"]').fill(testPassword);
        await page.locator('input[type="text"]').first().fill(testTitle);
        await page.getByRole('button', { name: 'Create & Add Questions' }).click();

        for (let i = 1; i <= 2; i++) {
            await page.getByRole('button', { name: '+ Add Question' }).click();
            await page.getByRole('combobox').selectOption({ value: 'multi_select' });
            await page.locator('textarea').fill(`Multiple Choice Question ${i}?`);
            await page.getByRole('textbox', { name: 'Answer 1' }).fill('Correct 1');
            await page.getByRole('textbox', { name: 'Answer 2' }).fill('Correct 2');

            const checkboxes = page.locator('input[type="checkbox"]');
            await checkboxes.nth(0).check();
            await checkboxes.nth(1).check();

            if (i === 1) {
                testLink = await page.locator('input[readonly], input[value^="http"]').inputValue();
            }
            await page.getByRole('button', { name: 'Save Question' }).click();
        }
    });

    await test.step('Step 7-8: Wrong Password Check', async () => {
        await page.goto(testLink);
        await page.locator('input[type="password"]').fill('WrongPass123');
        await page.getByRole('button', { name: 'Continue' }).click();
        
        const errorMsg = page.getByText(/incorrect|wrong|invalid/i);
        await expect(errorMsg).toBeVisible();
    });

    await test.step('Step 9-11: Take Test', async () => {
        await page.locator('input[type="password"]').fill(testPassword);
        await page.getByRole('button', { name: /Continue/i }).click();
        
        await page.getByRole('textbox', { name: /name/i }).fill('QA_Expert');
        await page.getByRole('button', { name: /Start Test/i }).click();
        await page.waitForSelector('input[type="checkbox"]');
        const allCheckboxes = page.locator('input[type="checkbox"]');
        const count = await allCheckboxes.count();
        console.log(`Намерени чекбокси: ${count}`);
        for (let i = 0; i < count; i++) {
            await allCheckboxes.nth(i).check();
        }

        const nextBtn = page.getByRole('button', { name: /Next/i });
        if (await nextBtn.isVisible()) {
            await nextBtn.click();
            const remainingCheckboxes = page.locator('input[type="checkbox"]');
            if (await remainingCheckboxes.first().isVisible()) {
                 const count2 = await remainingCheckboxes.count();
                 for (let i = 0; i < count2; i++) {
                    await remainingCheckboxes.nth(i).check();
                }
            }
        }

        const submitBtn = page.getByRole('button', { name: /Submit|Finish/i });
        await submitBtn.click();
    });

    await test.step('Step 12: Delete Test', async () => {
        await page.goto(`${host}/dashboard`);
        await page.getByRole('button', { name: 'Delete' }).click();
    });

    await test.step('Step 13: Delete User', async () => {
        if (!accessToken) return;
        const response = await request.delete(`${baseUrl}/auth/me/`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        expect([200, 204]).toContain(response.status());
    });
});
