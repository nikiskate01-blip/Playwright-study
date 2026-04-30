import { test, expect } from '@playwright/test';

test('End-to-End Test Flow 2 : Exam Practices', async ({ page, request }) =>
{
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `thomas.fan.${Date.now()}@example.com`;
    const password = 'SecurePass123!';
   const testTitle = `Automation Test ${Date.now()}`;
     let accessToken: string | null = '';

    await test.step('Step 1: Register new user', async () => {
        const response = await request.post(`${baseUrl}/auth/register/`, {
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            data: {
                email: userEmail,
                first_name: "Thomas",
                last_name: "Fan",
                password: password,
                password_confirm: password
            }
        });
        
        if (response.status() !== 201) {
            console.error("Register Error:", await response.text());
        }
        expect(response.status()).toBe(201);
    });

        await test.step('Step 2: Login user via UI', async () => {
        await page.goto(`${host}/login`);

        await page.locator('input[type="email"]').fill(userEmail);
        await page.locator('input[type="password"]').fill(password);
        await page.getByRole('button', { name: /Sign In/i }).click();
        await page.waitForURL(`${host}/dashboard`);

        accessToken = await page.evaluate(() => 
            localStorage.getItem('access') || 
            localStorage.getItem('token') || 
            localStorage.getItem('access_token') ||
            localStorage.getItem('jwt')
        );

        if (!accessToken) {
            const cookies = await page.context().cookies();
            const authCookie = cookies.find(c => c.name === 'access' || c.name === 'token' || c.name === 'sessionid');
            if (authCookie) {
                accessToken = authCookie.value;
            }
        }

        if (!accessToken) {
            const keys = await page.evaluate(() => Object.keys(localStorage));
            console.log("Налични ключове в LocalStorage:", keys);
        }
        
        expect(accessToken, "Не бе намерен access токен в Storage или Cookies").not.toBeNull();
    });

  
    await test.step('Step 3-6: Create Test', async () => {
        await page.getByRole('main').getByRole('link', { name: 'Create Test' }).click();
        
        await page.getByRole('spinbutton').nth(1).fill('1');

        await page.getByRole('combobox').selectOption({value:'public'});
        await page.locator('input[type="text"]').fill(testTitle);
        await page.getByRole('button', { name: 'Create & Add Questions' }).click();

        await page.getByRole('main').getByRole('button', { name: '+ Add Question' }).click();
        await page.locator('textarea').fill('What is 2+2?');
        await page.getByRole('textbox', { name: 'Answer 1' }).fill('4');
        await page.getByRole('textbox', { name: 'Answer 2' }).fill('5');
        await page.getByRole('radio').first().check(); // Маркираме като верен

        await page.getByRole('button', { name: 'Save Question' }).click();
    });

    await test.step('Step 7: Search in Explore', async () => {
        await page.goto(`${host}/explore`);
        const searchBox = page.getByRole('textbox', { name: 'Search by title...' });
        await searchBox.fill(testTitle);
        await searchBox.press('Enter');
        await page.waitForLoadState('networkidle');
    });

    await test.step('Step 8-9: Take Test', async () => {
        await page.getByText(testTitle).click();
        await page.getByRole('textbox', { name: 'Your name (optional)' }).fill('QA_User');
        await page.getByRole('button', { name: 'Start Test' }).click();

        await page.getByRole('radio', { name: '4' }).first().click();
        await page.getByRole('button', { name: 'Submit Test' }).click();
        //await expect(page.locator('text=Score')).toBeVisible();
    });

    await test.step('Step 10-11: Check Attempts Count', async () => {
        await page.goto(`${host}/explore`);
        await page.getByRole('textbox', { name: 'Search by title...' }).fill(testTitle);
        await page.keyboard.press('Enter');

        const attemptsStatus = page.getByText('Taken 1x');
        await expect(attemptsStatus).toHaveText(/Taken 1x/i);
    });

    await test.step('Step 12-13: Verify Max Attempts Error', async () => {
        await page.getByText(testTitle).click();
        await page.getByRole('button', { name: /Start/i }).click();

        const errorMsg = page.getByText('Maximum attempts reached');
        await expect(errorMsg).toContainText('Maximum attempts reached');
    });

    await test.step('Step 14: Delete Test', async () => {
        await page.goto(`${host}/dashboard`);
        // Търсим опциите на конкретния тест
        //const testRow = page.locator('.test-row', { hasText: testTitle });
        await page.getByRole('button', { name: 'Delete' }).click();
        //page.on('dialog', dialog => dialog.accept());
        //await page.getByRole('button', { name: /Ok/i }).click();
    });

     await test.step('Step 8: Delete user', async () => {
        const response = await request.delete(`${baseUrl}/auth/me/`, {
            headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json' 
            }
        });
        expect(response.status()).toBe(204);
    });
});


