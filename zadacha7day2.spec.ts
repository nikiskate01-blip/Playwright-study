import { test, expect } from '@playwright/test';

test('Задача 7: ГОЛЯМАТА МИСТЕРИЯ - Пълен цикъл', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `mystery.tester.${Date.now()}@example.com`;
    const password = 'Password123!';
    const testPassword = 'SecretPassword123';
    const testTitle = `Mystery Test ${Date.now()}`;
    
    let accessToken: string | null = '';
    let testLink: string = '';

    await test.step('Step 1-2: Register & Login', async () => {
        await request.post(`${baseUrl}/auth/register/`, {
            data: { email: userEmail, first_name: "Mystery", last_name: "Master", password, password_confirm: password }
        });
        await page.goto(`${host}/login`);
        await page.locator('input[type="email"]').fill(userEmail);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(/dashboard/);
        accessToken = await page.evaluate(() => localStorage.getItem('access'));
    });

    await test.step('Step 3-4: Create Test with 3 Question Types', async () => {
        await page.getByRole('link', { name: /Create.*test/i }).click();
        await page.getByRole('combobox').selectOption({ value: 'password_protected' });
        await page.locator('input[type="password"]').fill(testPassword);
        await page.locator('input[type="text"]').first().fill(testTitle);
        await page.getByRole('button', { name: 'Create & Add Questions' }).click();

        await page.getByRole('button', { name: '+ Add Question' }).click();
        await page.locator('textarea').fill('Single Choice Question?');
        await page.getByRole('textbox', { name: 'Answer 1' }).fill('Correct');
        await page.locator('input[type="radio"]').first().check();
        await page.getByRole('textbox', { name: 'Answer 2' }).fill('No');
        await page.getByRole('button', { name: 'Save Question' }).click();

        await page.getByRole('button', { name: '+ Add Question' }).click();
        await page.getByRole('combobox').selectOption({ value: 'multi_select' });
        await page.locator('textarea').fill('Multi Select Question?');
        await page.getByRole('textbox', { name: 'Answer 1' }).fill('Correct 1');
        await page.getByRole('textbox', { name: 'Answer 2' }).fill('Correct 2');
        await page.locator('input[type="checkbox"]').nth(0).check();
        await page.locator('input[type="checkbox"]').nth(1).check();
        await page.getByRole('button', { name: 'Save Question' }).click();

        await page.getByRole('button', { name: '+ Add Question' }).click();
        await page.getByRole('combobox').selectOption({ value: 'exact_answer' });
        await page.locator('textarea').fill('Exact Answer Question?');
        await page.getByRole('textbox', { name: 'Correct Answer' }).fill('Bingo');
        
        testLink = await page.locator('input[readonly], input[value^="http"]').inputValue();
        await page.getByRole('button', { name: 'Save Question' }).click();
    });

       await test.step('Step 5: Edit a Question', async () => {
        await page.goto(`${host}/dashboard`);
        
        await page.reload({ waitUntil: 'networkidle' });

        const testCard = page.locator('.v-card, .v-sheet, div').filter({ hasText: testTitle }).last();
        
        await testCard.waitFor({ state: 'visible', timeout: 20000 });

        const editBtn = testCard.locator('a[href*="edit"], button:has-text("Edit")').first();
        
        await editBtn.click();
        await page.waitForURL(/edit/);

        const qEditBtn = page.locator('button').filter({ hasText: /Edit/i }).first();
        await qEditBtn.click();
        
        await page.locator('textarea').fill('Edited Mystery Question?');
        await page.getByRole('button', { name: /Save|Update/i }).click();
        
        await page.waitForLoadState('networkidle');
        console.log('Редактирането приключи!');
    });

    await test.step('Step 6-8: Password Validation', async () => {
        await page.goto(testLink);
        
        await page.locator('input[type="password"]').fill('WrongPass123');
        await page.getByRole('button', { name: /Continue/i }).click();
        await expect(page.locator('body')).toContainText(/incorrect|wrong|invalid/i);

        await page.locator('input[type="password"]').fill(testPassword);
        await page.getByRole('button', { name: /Continue/i }).click();
    });

    await test.step('Step 9: Solve the Test', async () => {
        await page.getByRole('textbox', { name: /name/i }).fill('Mystery_Solver');
        await page.getByRole('button', { name: /Start Test/i }).click();

        await page.locator('input[type="radio"]').first().check();
        
        const checkboxes = page.locator('input[type="checkbox"]');
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();

        await page.getByRole('textbox', { name: /answer/i }).fill('Bingo');

        await page.getByRole('button', { name: /Submit|Finish/i }).click();

    });

    await test.step('Step 10-12: Analytics and Delete', async () => {
        await page.goto(`${host}/dashboard`);
        await page.getByRole('link', { name:"Results"}).click();
        await page.getByRole('button', { name: 'Analytics' }).click();
        
        await expect(page.locator('body')).toContainText('1'); // Проверка за 1 опит

        await page.goto(`${host}/dashboard`);
        await page.getByRole('button', { name: 'Delete' }).click();
        if (accessToken) {
            await request.delete(`${baseUrl}/auth/me/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
        }
    });
});
