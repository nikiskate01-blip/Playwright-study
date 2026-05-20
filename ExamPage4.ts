import { Page, Locator, APIRequestContext, APIResponse } from '@playwright/test';

export class ExamPage {
    private passwordInput: Locator;
    private continueButton: Locator;
    private errorText: Locator;
    private nameInput: Locator;
    private startTestButton: Locator;
    private checkboxes: Locator;
    private nextButton: Locator;
    private submitButton: Locator;

    constructor(private page: Page, private request: APIRequestContext, private baseUrl: string) {
        this.passwordInput = page.locator('input[type="password"]');
        this.continueButton = page.getByRole('button', { name: /Continue/i });
        this.errorText = page.getByText(/incorrect|wrong|invalid/i);
        this.nameInput = page.getByRole('textbox', { name: /name/i });
        this.startTestButton = page.getByRole('button', { name: /Start Test/i });
        this.checkboxes = page.locator('input[type="checkbox"]');
        this.nextButton = page.getByRole('button', { name: /Next/i });
        this.submitButton = page.getByRole('button', { name: /Submit|Finish/i });
    }

    async openLink(link: string) {
        await this.page.goto(link);
    }

    async enterPasswordAndContinue(password: string) {
        await this.passwordInput.fill(password);
        await this.continueButton.click();
    }

    getErrorLocator(): Locator {
        return this.errorText;
    }

    async startExam(userName: string) {
        await this.nameInput.fill(userName);
        await this.startTestButton.click();
    }

    async checkAllVisibleCheckboxes() {
        await this.page.waitForSelector('input[type="checkbox"]');
        const count = await this.checkboxes.count();
        console.log(`Намерени чекбокси: ${count}`);
        for (let i = 0; i < count; i++) {
            await this.checkboxes.nth(i).check();
        }
    }

    async clickNextIfVisible() {
        if (await this.nextButton.isVisible()) {
            await this.nextButton.click();
            await this.page.waitForLoadState('networkidle');
        }
    }

    async submitExam() {
        await this.submitButton.click();
    }

    async deleteUserViaApi(token: string): Promise<APIResponse> {
        return await this.request.delete(`${this.baseUrl}/auth/me/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
}
