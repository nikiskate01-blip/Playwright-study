import{test, expect, Locator} from "@playwright/test"

// Browser -> Context-> pages

test("click and navigate", async({page})=>{
 

    await page.goto("https://exampractices.com/");

    
    
    await page.getByRole('link', { name: 'Login' }).click();
    expect(page).toHaveURL(/login/);


});