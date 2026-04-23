import {test, expect } from "@playwright/test"

test("proverka za nevalidni danni", async({page})=>{
 

    await page.goto("https://exampractices.com/login");
    await page.locator('input[type="email"]').fill('nstoyanasdasdv@sqa.bg');
    await page.locator('input[type="password"]').fill('123Abv123^');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page.getByText('No active account found with the given credentials')).toBeVisible();
    await expect(page.locator('.bg-red-50')).toContainText('No active account found');
});