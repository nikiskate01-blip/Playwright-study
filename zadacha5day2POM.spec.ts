import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage5';
import { ExplorePage } from '../pages/ExplorePage5';

test('Задача 5: Public Test с Exact Answers и проверка на опити (POM)', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `public.tester.${Date.now()}@example.com`;
    const password = 'Password123!';
    const testTitle = `Public Search Test ${Date.now()}`;
    const userName = 'QA_Runner';
    
    let accessToken: string | null = '';

    // Инициализация на Page Objects
    const registerPage = new RegisterPage(request, baseUrl);
    const loginPage = new LoginPage(page, host);
    const dashboardPage = new DashboardPage(page, host);
    const explorePage = new ExplorePage(page, request, baseUrl);

    await test.step('Step 1-2: Register & Login', async () => {
        const registerResponse = await registerPage.registerUser({ 
            email: userEmail, 
            first_name: "Public", 
            last_name: "Tester", 
            password, 
            password_confirm: password 
        });
        expect(registerResponse.status()).toBe(201);

        await loginPage.navigate();
        await loginPage.login(userEmail, password);
        await page.waitForURL(/dashboard/);
        accessToken = await loginPage.extractAccessToken();
    });

    await test.step('Step 3-6: Create Public Test', async () => {
        await dashboardPage.navigate();
        await dashboardPage.createPublicTest(testTitle, '3');

        for (let i = 1; i <= 3; i++) {
            await dashboardPage.addExactAnswerQuestion(`Question Number ${i}?`, `Answer${i}`);
        }
    });

    await test.step('Solve Test - Attempt 1', async () => {
        await explorePage.navigateViaUi();
        await explorePage.searchForTest(testTitle);
        await explorePage.openTest(testTitle);
        await explorePage.solveAndSubmitTest(userName);
    });

    await test.step('Step 10-11: Check Attempts in Explore', async () => {
        await explorePage.navigateViaUi();
        await explorePage.searchForTest(testTitle);
        
        const testContainer = explorePage.getTestCardLocator(testTitle);
        
        // Отпечатване на съдържанието за дебъгване
        const content = await testContainer.innerText();
        console.log('Съдържание на картата:', content);

        await expect(testContainer).toContainText(/1x/i, { timeout: 15000 });
    });

    await test.step('Step 12-13: Second Attempt', async () => {
        await explorePage.openTest(testTitle);
        await explorePage.solveAndSubmitTest(userName);
    });

    await test.step('Step 14-15: Verify Analytics', async () => {
        await dashboardPage.navigate();
        await dashboardPage.openAnalytics();
        await expect(page.locator('body')).toContainText(/2/); 
    });

    await test.step('Step 16-17: Cleanup', async () => {
        await dashboardPage.navigate();
        await dashboardPage.deleteTest();

        if (accessToken) {
            const deleteUserResponse = await explorePage.deleteUserViaApi(accessToken);
            expect([200, 204]).toContain(deleteUserResponse.status());
        }
    });
});
