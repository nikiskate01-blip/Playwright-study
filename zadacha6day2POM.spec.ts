import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage6';
import { ExplorePage } from '../pages/ExplorePage6';

test('Задача 6: Public Single Choice тест с анонимно решаване (POM)', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `single.choice.${Date.now()}@example.com`;
    const password = 'Password123!';
    const testTitle = `Single Choice Test ${Date.now()}`;
    
    let accessToken: string | null = '';

    // Инициализация на Page Objects
    const registerPage = new RegisterPage(request, baseUrl);
    const loginPage = new LoginPage(page, host);
    const dashboardPage = new DashboardPage(page, host);
    const explorePage = new ExplorePage(page, request, baseUrl);

    await test.step('Step 1-2: Register & Login', async () => {
        const registerResponse = await registerPage.registerUser({ 
            email: userEmail, 
            first_name: "Single", 
            last_name: "Choice", 
            password, 
            password_confirm: password 
        });
        expect(registerResponse.status()).toBe(201);

        await loginPage.navigate();
        await loginPage.login(userEmail, password);
        await page.waitForURL(/dashboard/);
        accessToken = await loginPage.extractAccessToken();
    });

    await test.step('Step 3-6: Create Public Test (Max Attempts: 1)', async () => {
        await dashboardPage.navigate();
        await dashboardPage.createPublicTestWithOneAttempt(testTitle);

        for (let i = 1; i <= 4; i++) {
            await dashboardPage.addMultipleChoiceQuestion(
                `Single Choice Question ${i}?`, 
                'Correct Answer', 
                'Wrong Answer'
            );
        }
    });

    await test.step('Step 7-9: Search and Anonymous Solve', async () => {
        await explorePage.navigateViaUi();
        await explorePage.searchForTest(testTitle);
        await explorePage.openTest(testTitle);
        
        await explorePage.startAnonymousTest();
        await explorePage.answerRadioQuestions(4);
        await explorePage.submitTest();
    });

    await test.step('Step 10-11: Check Analytics', async () => {
        await dashboardPage.navigate();
        await dashboardPage.openAnalytics();
        await expect(page.locator('body')).toContainText('1'); 
    });

    await test.step('Step 12-13: Delete Test & User', async () => {
        await dashboardPage.navigate();
        await dashboardPage.deleteTest();

         if (accessToken) {
            const deleteUserResponse = await explorePage.deleteUserViaApi(accessToken);
            expect(deleteUserResponse.status()).toBe(204);
        }
    });
});
