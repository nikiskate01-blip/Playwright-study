import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ExplorePage } from '../pages/ExplorePage2';

test('End-to-End Test Flow 2: Exam Practices (POM)', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `thomas.fan.${Date.now()}@example.com`;
    const password = 'SecurePass123!';
    const testTitle = `Automation Test ${Date.now()}`;
    let accessToken: string | null = '';

    // Инициализиране на Page Objects
    const registerPage = new RegisterPage(request, baseUrl);
    const loginPage = new LoginPage(page, host);
    const dashboardPage = new DashboardPage(page, host);
    const explorePage = new ExplorePage(page, request, host, baseUrl);

    await test.step('Step 1: Register new user', async () => {
        const response = await registerPage.registerUser({
            email: userEmail,
            first_name: "Thomas",
            last_name: "Fan",
            password: password,
            password_confirm: password
        });
        expect(response.status()).toBe(201);
    });

    await test.step('Step 2: Login user via UI', async () => {
        await loginPage.navigate();
        await loginPage.login(userEmail, password);
        await page.waitForURL(`${host}/dashboard`);

        accessToken = await loginPage.extractAccessToken();
        expect(accessToken, "Не бе намерен access токен").not.toBeNull();
    });

    await test.step('Step 3-6: Create Test', async () => {
        await dashboardPage.createPublicTestWithOneAttempt(testTitle);
        await dashboardPage.addRadioQuestion('What is 2+2?', '4', '5');
    });

    await test.step('Step 7: Search in Explore', async () => {
        await explorePage.navigate();
        await explorePage.searchForTest(testTitle);
    });

    await test.step('Step 8-9: Take Test', async () => {
        await explorePage.openTest(testTitle);
        await explorePage.takeAndSubmitTest('QA_User');
    });

    await test.step('Step 10-11: Check Attempts Count', async () => {
        await explorePage.navigate();
        await explorePage.searchForTest(testTitle);
        
        const attemptsStatus = explorePage.getAttemptsLocator();
        await expect(attemptsStatus).toHaveText(/Taken 1x/i);
    });

    await test.step('Step 12-13: Verify Max Attempts Error', async () => {
        await explorePage.openTest(testTitle);
        await explorePage.tryToStartExam();

        const errorMsg = explorePage.getMaxAttemptsErrorLocator();
        await expect(errorMsg).toContainText('Maximum attempts reached');
    });

    await test.step('Step 14: Delete Test', async () => {
        await dashboardPage.navigate();
        await dashboardPage.deleteFirstTestWithConfirm();
    });

    await test.step('Step 15: Delete user', async () => {
        const response = await explorePage.deleteUserViaApi(accessToken!);
        expect(response.status()).toBe(204);
    });
});
