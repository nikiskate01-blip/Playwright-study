import {test, expect, Locator } from "@playwright/test"

const user = [
    { email: 'nstoya213ov@sqa.bg', password: '1232v123^'},
    { email: 'nstoyanov@sqa.bg', password: '123Abv123^'},
    { email: 'nstdsov@sqa.bg', password: '123asdAbv123^'}
];
test("Data driven vhod", async({page})=>{
 

    await page.goto("https://exampractices.com./login");
    for(let i=0; i<3;i++)
    {
        await page.locator('input[type="email"]').fill(user[i].email);
        await page.locator('input[type="password"]').fill(user[i].password);
        await page.getByRole('button', { name: 'Sign In' }).click();
        await page.waitForTimeout(5000);
        if( page.url() == 'https://exampractices.com./dashboard')
        {
            console.log("succesfully entered");
             page.getByRole('button', { name: 'Logout' }).click();
        }
        else
        {
            await expect(page.getByText('No active account found with the given credentials')).toBeVisible();
            await expect(page.locator('.bg-red-50')).toContainText('No active account found');
        }
        
    }
    
});