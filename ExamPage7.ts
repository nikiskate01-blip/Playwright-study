import { Page, Locator, APIRequestContext, APIResponse } from '@playwright/test';

export class ExamPage {
    private passwordInput: Locator;
    private continueButton: Locator;
    private nameInput: Locator;
    private startTestButton: Locator;
    private radioOptions: Locator;
    private checkboxes: Locator;
    private textAnswerInput: Locator;
    private submitButton: Locator;

    constructor(private page: Page, private request: APIRequestContext, private baseUrl: string) {
        this.passwordInput = page.locator('input[type="password"]');
        this.continueButton = page.getByRole('button', { name: /Continue/i });
        this.nameInput = page.getByRole('textbox', { name: /name/i });
        this.startTestButton = page.getByRole('button', { name: /Start Test/i });
        this.radioOptions = page.locator('input[type="radio"]');
        this.checkboxes = page.locator('input[type="checkbox"]');
        this.textAnswerInput = page.getByRole('textbox', { name: /answer/i });
        this.submitButton = page.getByRole('button', { name: /Submit|Finish/i });
    }

    async openLink(link: string) {
        await this.page.goto(link);
    }

    async enterPasswordAndContinue(password: string) {
        await this.passwordInput.fill(password);
        await this.continueButton.click();
    }

    async startExam(userName: string) {
        await this.nameInput.fill(userName);
        await this.startTestButton.click();
    }

    async solveMysteryQuestions(exactAnswer: string) {
        // 1. Избор на първия радио бутон
        await this.radioOptions.first().check();
        
        // 2. Избор на чекбоксите
        await this.checkboxes.nth(0).check();
        await this.checkboxes.nth(1).check();

        // 3. Въвеждане на текстовия отговор
        await this.textAnswerInput.fill(exactAnswer);
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
