import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage4';
import { ExamPage } from '../pages/ExamPage4';

test('Задача 4: Multiple Select Тест с парола (POM)', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `pass.tester.${Date.now()}@example.com`;
    const password = 'Password123!';
    const testPassword = 'TestPassword555';
    const testTitle = `Password Test ${Date.now()}`;
    
    let accessToken: string | null = '';
    let testLink: string = '';

    // Инициализация на Page Objects
    const registerPage = new RegisterPage(request, baseUrl);
    const loginPage = new LoginPage(page, host);
    const dashboardPage = new DashboardPage(page, host);
    const examPage = new ExamPage(page, request, baseUrl);

    await test.step('Step 1-2: Register & Login', async () => {
        const registerResponse = await registerPage.registerUser({ 
            email: userEmail, 
            first_name: "Pass", 
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

    await test.step('Step 3-6: Create Password Protected Test', async () => {
        await dashboardPage.navigate();
        await dashboardPage.createPasswordProtectedTest(testTitle, testPassword);

        for (let i = 1; i <= 2; i++) {
            const extractedLink = await dashboardPage.addMultiSelectQuestion(
                i, 
                `Multiple Choice Question ${i}?`, 
                'Correct 1', 
                'Correct 2'
            );
            if (extractedLink) {
                testLink = extractedLink;
            }
        }
    });

    await test.step('Step 7-8: Wrong Password Check', async () => {
        await examPage.openLink(testLink);
        await examPage.enterPasswordAndContinue('WrongPass123');
        
        const errorMsg = examPage.getErrorLocator();
        await expect(errorMsg).toBeVisible();
    });

    await test.step('Step 9-11: Take Test', async () => {
        await examPage.enterPasswordAndContinue(testPassword);
        await examPage.startExam('QA_Expert');
        
        // Първа страница с въпроси
        await examPage.checkAllVisibleCheckboxes();
        
        // Преминаване на следваща страница (ако има) и маркиране на чекбокси
        await examPage.clickNextIfVisible();
        await examPage.checkAllVisibleCheckboxes();

        await examPage.submitExam();
    });

    await test.step('Step 12: Delete Test', async () => {
        await dashboardPage.navigate();
        await dashboardPage.deleteFirstTest();
    });

    await test.step('Step 13: Delete User', async () => {
        if (!accessToken) return;
        const response = await examPage.deleteUserViaApi(accessToken);
        expect([200, 204]).toContain(response.status());
    });
});
