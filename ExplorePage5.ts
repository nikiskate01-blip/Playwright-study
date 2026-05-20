import { Page, Locator, APIRequestContext, APIResponse } from '@playwright/test';

export class ExplorePage {
    private exploreLink: Locator;
    private searchBox: Locator;
    private nameInput: Locator;
    private startTestButton: Locator;
    private answerInputs: Locator;
    private submitButton: Locator;

    constructor(private page: Page, private request: APIRequestContext, private baseUrl: string) {
        this.exploreLink = page.getByRole('link', { name: 'Explore' });
        this.searchBox = page.getByPlaceholder(/Search by title/i);
        this.nameInput = page.getByRole('textbox', { name: /name/i });
        this.startTestButton = page.getByRole('button', { name: 'Start Test' });
        this.answerInputs = page.getByRole('textbox', { name: 'Type your answer' });
        this.submitButton = page.getByRole('button', { name: /Submit|Finish/i });
    }

    async navigateViaUi() {
        await this.exploreLink.click();
    }

    async searchForTest(title: string) {
        await this.searchBox.click();
        await this.searchBox.fill(title);
        
        // Вместо твърдо изчакване (waitForTimeout), чакаме API отговора от базата данни
        await this.page.waitForResponse(
            response => response.url().includes('/tests') && response.status() === 200,
            { timeout: 5000 }
        ).catch(() => {});
    }

    async openTest(title: string) {
        await this.page.getByText(title).first().click();
    }

    async solveAndSubmitTest(userName: string) {
        await this.nameInput.fill(userName);
        await this.startTestButton.click();

        await this.answerInputs.first().waitFor({ state: 'visible' });
        const count = await this.answerInputs.count(); 
        for (let i = 0; i < count; i++) {
            await this.answerInputs.nth(i).fill(`Answer${i + 1}`);
        }

        await this.submitButton.click();
    }

    getTestCardLocator(title: string): Locator {
        return this.page.locator('div').filter({ hasText: title }).last();
    }

    async deleteUserViaApi(token: string): Promise<APIResponse> {
        return await this.request.delete(`${this.baseUrl}/auth/me/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
}
