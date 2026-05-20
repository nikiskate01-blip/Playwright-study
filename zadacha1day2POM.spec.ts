import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';
import { ExplorePage } from '../pages/ExplorePage';
import { ExamPage } from '../pages/ExamPage';


test('End-to-End Test Flow: Exam Practices (POM)', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `thomas.fan.${Date.now()}@example.com`;
    const password = 'SecurePass123!';
    let accessToken: string | null = '';

    // Инициализация на POM класовете
    const registerPage = new RegisterPage(request, baseUrl);
    const loginPage = new LoginPage(page, host);
    const explorePage = new ExplorePage(page, host);
    const examPage = new ExamPage(page, request, baseUrl);

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
        expect(accessToken).not.toBeNull();
    });

    await test.step('Step 3 & 4: Search Math and Filter by Popularity', async () => {
        await explorePage.navigate();
        await explorePage.searchAndSort('Math', 'attempt_count');
    });

    await test.step('Step 5: Open test by author Tghomas', async () => {
        await explorePage.openTestByAuthor('Tghomas', '/t/math-0f8dc17e');
        await expect(page).toHaveURL(/.*math-0f8dc17e/);
    });

    await test.step('Step 6: Start the test', async () => {
        await examPage.startExam();
    });

    await test.step('Step 7: Solve and Submit', async () => {
        await examPage.solveAndSubmit();
    });

    await test.step('Step 8: Delete user', async () => {
        const response = await examPage.deleteUser(accessToken!);
        expect(response.status()).toBe(204);
    });
});
