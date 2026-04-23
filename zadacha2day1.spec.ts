import {test, expect, Locator} from "@playwright/test"

test("namirane na element po tekst",async({page})=>{

    //step1   
    await page.goto("https://exampractices.com/");
    const turseneNaButon = page.getByRole('link', { name: 'Login' });
    await expect(turseneNaButon).toBeVisible();
    await expect(turseneNaButon).toBeEnabled();
})
