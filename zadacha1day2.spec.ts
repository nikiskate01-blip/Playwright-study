import { test, expect } from '@playwright/test';

test('End-to-End Test Flow: Exam Practices', async ({ page, request }) => {
    const host = 'https://exampractices.com';
    const baseUrl = `${host}/api`;
    const userEmail = `thomas.fan.${Date.now()}@example.com`;
    const password = 'SecurePass123!';
    let accessToken: string | null = '';

    // СТЪПКА 1: Регистрация (чрез API за стабилност)
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

        // Изчакваме да зареди Dashboard
        await page.waitForURL(`${host}/dashboard`);

        // 1. Опит за вземане от LocalStorage (пробваме различни често срещани имена)
        accessToken = await page.evaluate(() => 
            localStorage.getItem('access') || 
            localStorage.getItem('token') || 
            localStorage.getItem('access_token') ||
            localStorage.getItem('jwt')
        );

        // 2. Ако все още е null, проверяваме Cookies (често се ползва при Django/Next.js)
        if (!accessToken) {
            const cookies = await page.context().cookies();
            const authCookie = cookies.find(c => c.name === 'access' || c.name === 'token' || c.name === 'sessionid');
            if (authCookie) {
                accessToken = authCookie.value;
            }
        }

        // Дебъг: Ако пак е null, виж в конзолата какво има в Storage
        if (!accessToken) {
            const keys = await page.evaluate(() => Object.keys(localStorage));
            console.log("Налични ключове в LocalStorage:", keys);
        }
        
        expect(accessToken, "Не бе намерен access токен в Storage или Cookies").not.toBeNull();
    });

    // СТЪПКА 3 & 4: Търсене и Филтриране
    await test.step('Step 3 & 4: Search Math and Filter by Popularity', async () => {
        await page.goto(`${host}/explore`);
        await page.waitForLoadState('networkidle');

        const searchBox = page.getByRole('textbox', { name: 'Search by title...' });
        await searchBox.waitFor({ state: 'visible' });
        await searchBox.fill('Math');
        await searchBox.press('Enter');
        
        await page.waitForLoadState('networkidle');

        const sortDropdown = page.getByRole('combobox');
        await sortDropdown.waitFor({ state: 'visible' });
        await sortDropdown.selectOption({ value: 'attempt_count' });
        
        await page.waitForLoadState('networkidle');
    });

    // СТЪПКА 5: Отваряне на теста
    await test.step('Step 5: Open test by author Tghomas', async () => {
        const testByTghomas = page.locator('div.px-6.py-4.text-gray-600', { hasText: 'Tghomas' })
            .locator('xpath=./ancestor::div[contains(@class, "card")] | ./ancestor::a')
            .first();

        if (await testByTghomas.count() === 0) {
            console.warn("Тестът не е намерен в списъка, използвам директен линк...");
            await page.goto(`${host}/t/math-0f8dc17e`);
        } else {
            const startLink = testByTghomas.locator('a[href="/t/math-0f8dc17e"]');
            await startLink.scrollIntoViewIfNeeded();
            await startLink.click();
        }
        await expect(page).toHaveURL(/.*math-0f8dc17e/);
    });

    // СТЪПКА 6: Стартиране
    await test.step('Step 6: Start the test', async () => {
        const startBtn = page.getByRole('button', { name: /Start|Старт/i });
        await startBtn.click();
    });

    // СТЪПКА 7: Решаване
    await test.step('Step 7: Solve and Submit', async () => {
        const option = page.locator('input[type="radio"], .answer-option').first();
        await option.click();
        await page.getByRole('button', { name: /Submit|Предай/i }).click();
    });

    // СТЪПКА 8: Изтриване на потребителя (API Cleanup)
    await test.step('Step 8: Delete user', async () => {
        // Увери се, че токенът е подаден правилно в хедърите
        const response = await request.delete(`${baseUrl}/auth/me/`, {
            headers: { 
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json' 
            }
        });
        expect(response.status()).toBe(204);
    });
});


