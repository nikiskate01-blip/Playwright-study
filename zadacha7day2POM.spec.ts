import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage7';
import { ExamPage } from '../pages/ExamPage7';

test('Задача 7: ГОЛЯМАТА МИСТЕРИЯ - Пълен цикъл (POM)', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `mystery.tester.${Date.now()}@example.com`;
    const password = 'Password123!';
    const testPassword = 'SecretPassword123';
    const testTitle = `Mystery Test ${Date.now()}`;
    
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
            first_name: "Mystery", 
            last_name: "Master", 
            password, 
            password_confirm: password 
        });
        expect(registerResponse.status()).toBe(201);

        await loginPage.navigate();
        await loginPage.login(userEmail, password);
        await page.waitForURL(/dashboard/);
        accessToken = await loginPage.extractAccessToken();
    });

    await test.step('Step 3-4: Create Test with 3 Question Types', async () => {
        await dashboardPage.navigate();
        await dashboardPage.createPasswordProtectedTest(testTitle, testPassword);

        await dashboardPage.addSingleChoiceQuestion('Single Choice Question?', 'Correct', 'No');
        await dashboardPage.addMultiSelectQuestion('Multi Select Question?', 'Correct 1', 'Correct 2');
        testLink = await dashboardPage.addExactAnswerQuestionAndGetLink('Exact Answer Question?', 'Bingo');
    });

    await test.step('Step 5: Edit a Question', async () => {
        await dashboardPage.navigate();
        await dashboardPage.openTestEditor(testTitle);
        await dashboardPage.editFirstQuestionText('Edited Mystery Question?');
        console.log('Редактирането приключи!');
    });

    await test.step('Step 6-8: Password Validation', async () => {
        await examPage.openLink(testLink);
        
        await examPage.enterPasswordAndContinue('WrongPass123');
        await expect(page.locator('body')).toContainText(/incorrect|wrong|invalid/i);

        await examPage.enterPasswordAndContinue(testPassword);
    });

    await test.step('Step 9: Solve the Test', async () => {
        await examPage.startExam('Mystery_Solver');
        await examPage.solveMysteryQuestions('Bingo');
        await examPage.submitExam();
    });

    await test.step('Step 10-12: Analytics and Delete', async () => {
        await dashboardPage.navigate();
        await dashboardPage.openAnalytics();
        await expect(page.locator('body')).toContainText('1'); // Проверка за 1 опит

        await dashboardPage.navigate();
        await dashboardPage.deleteTest();
        
        if (accessToken) {
            const deleteUserResponse = await examPage.deleteUserViaApi(accessToken);
            // ПОПРАВЕНО: Предаваме статуса вътре в скобите на expect()
            expect(deleteUserResponse.status()).toBe(204);
        }
    });
});
