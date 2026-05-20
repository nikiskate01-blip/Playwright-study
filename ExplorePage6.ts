import { Page, Locator, APIRequestContext, APIResponse } from '@playwright/test';

export class ExplorePage {
    private exploreLink: Locator;
    private searchBox: Locator;
    private startTestButton: Locator;
    private radioOptions: Locator;
    private submitButton: Locator;

    constructor(private page: Page, private request: APIRequestContext, private baseUrl: string) {
        this.exploreLink = page.getByRole('link', { name: 'Explore' });
        this.searchBox = page.getByPlaceholder(/Search by title/i);
        this.startTestButton = page.getByRole('button', { name: /Start Test/i });
        this.radioOptions = page.locator('input[type="radio"]');
        this.submitButton = page.getByRole('button', { name: /Submit|Finish/i });
    }

    async navigateViaUi() {
        await this.exploreLink.click();
    }

    async searchForTest(title: string) {
        await this.searchBox.fill(title);
        // Заменяме бавния waitForTimeout с чакане на мрежовия отговор
        await this.page.waitForResponse(
            response => response.url().includes('/tests') && response.status() === 200,
            { timeout: 5000 }
        ).catch(() => {});
    }

    async openTest(title: string) {
        await this.page.getByText(title).first().click();
    }

    async startAnonymousTest() {
        await this.startTestButton.click();
    }

    async answerRadioQuestions(totalQuestions: number) {
        await this.radioOptions.first().waitFor({ state: 'visible' });
        for (let i = 0; i < totalQuestions; i++) {
            // Маркираме първия радио бутон за всеки въпрос (прескачаме по 2 опции на ход)
            await this.radioOptions.nth(i * 2).check();
        }
    }

    async submitTest() {
        await this.submitButton.click();
    }

    async deleteUserViaApi(token: string): Promise<APIResponse> {
        return await this.request.delete(`${this.baseUrl}/auth/me/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
}
