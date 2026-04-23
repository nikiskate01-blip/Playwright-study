import{test, expect, Locator} from "@playwright/test"

// Browser -> Context-> pages

test("fill formite i natiskane na butona za vhod", async({page})=>{
 

    await page.goto("https://exampractices.com/login");
    await page.locator('input[type="email"]').fill('nstoyanov@sqa.bg');
    await page.locator('input[type="password"]').fill('123Abv123^');
    await page.getByRole('button', { name: 'Sign In' }).click();

});