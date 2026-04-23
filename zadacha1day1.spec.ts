import {test, expect, Locator} from "@playwright/test"

test("Provrka na zaglavie",async({page})=>{

    //step1   
    await page.goto("https://exampractices.com/");
    let title:string = await page.title();
    console.log("Titile:", title);
    //step2
    await expect(title).toContain("Exam");
})

test("Proverka dali ima vidim header",async ({page})=>{

    await page.goto("https://exampractices.com./");
    const header = page.getByRole('heading', { name: 'Test Creation Made Simple' })
    await expect(header).toBeVisible();
})
