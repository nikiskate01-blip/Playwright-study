import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage3';
import { ExamPage } from '../pages/ExamPage3';

test('Задача 3: Тест с таймаут и Link Only (POM)', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `tester.${Date.now()}@example.com`;
    const password = 'Password123!';
    const testTitle = `Timeout Test ${Date.now()}`;
    
    let accessToken: string | null = '';
    let testLink: string = '';

    // Инициализиране на Page Objects
    const registerPage = new RegisterPage(request, baseUrl);
    const loginPage = new LoginPage(page, host);
    const dashboardPage = new DashboardPage(page, host);
    const examPage = new ExamPage(page, request, baseUrl);

    await test.step('Step 1: Register', async () => {
        const response = await registerPage.registerUser({
            email: userEmail,
            first_name: "Timeout",
            last_name: "Tester",
            password: password,
            password_confirm: password
        });
        expect(response.status()).toBe(201);
    });

    await test.step('Step 2: Login', async () => {
        await loginPage.navigate();
        await loginPage.login(userEmail, password);
        await page.waitForURL(/dashboard/);

        accessToken = await loginPage.extractAccessToken();
    });

    await test.step('Step 3-6: Create Test', async () => {
        await dashboardPage.createLinkOnlyTestWithOneMinuteTimeout(testTitle);
        testLink = await dashboardPage.addQuestionAndGetLink('Auto-generated question?', 'Yes', 'No');
        console.log('Копиран линк за теста:', testLink);
    });

    await test.step('Step 7-8: Wait for Timeout', async () => {
        await examPage.startExam(testLink, 'Auto_User');
        await examPage.waitForTimeoutRedirect(62); 

        // Проверка дали страницата е пренасочила автоматично след изтичане на времето
        await expect(async () => {
            const bodyText = await page.innerText('body');
            const isRedirected = bodyText.includes('Time') || page.url().includes('results') || page.url().includes('dashboard');
            expect(isRedirected).toBeTruthy();
        }).toPass({ timeout: 10000 });
    });

    await test.step('Step 9-10: Check Results', async () => {
        await dashboardPage.navigate();
        await dashboardPage.openAnalyticsForTest(testTitle);

        // Проверка, че резултатите съдържат 0 (заради изтеклия таймаут)
        await expect(page.locator('body')).toContainText('0');
    });

    await test.step('Step 11: Delete Test', async () => {
        await dashboardPage.navigate();
        await dashboardPage.deleteTest(testTitle);
    });

    await test.step('Step 12: Delete User', async () => {
        if (!accessToken) return;

        const response = await examPage.deleteUserViaApi(accessToken);
        expect([200, 204]).toContain(response.status());
    });
});
