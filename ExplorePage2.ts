import { Page, Locator, APIRequestContext, APIResponse } from '@playwright/test';

export class ExplorePage {
    private searchBox: Locator;
    private nameInput: Locator;
    private startTestButton: Locator;
    private answer4Radio: Locator;
    private submitTestButton: Locator;
    private startGeneralButton: Locator;

    constructor(private page: Page, private request: APIRequestContext, private host: string, private baseUrl: string) {
        this.searchBox = page.getByRole('textbox', { name: 'Search by title...' });
        this.nameInput = page.getByRole('textbox', { name: 'Your name (optional)' });
        this.startTestButton = page.getByRole('button', { name: 'Start Test' });
        this.answer4Radio = page.getByRole('radio', { name: '4' }).first();
        this.submitTestButton = page.getByRole('button', { name: 'Submit Test' });
        this.startGeneralButton = page.getByRole('button', { name: /Start/i });
    }

    async navigate() {
        await this.page.goto(`${this.host}/explore`);
    }

    async searchForTest(title: string) {
        await this.searchBox.fill(title);
        await this.searchBox.press('Enter');
        await this.page.waitForLoadState('networkidle');
    }

    async openTest(title: string) {
        await this.page.getByText(title).click();
    }

    async takeAndSubmitTest(userName: string) {
        await this.nameInput.fill(userName);
        await this.startTestButton.click();
        await this.answer4Radio.click();
        await this.submitTestButton.click();
    }

    async tryToStartExam() {
        await this.startGeneralButton.click();
    }

    getAttemptsLocator() {
        return this.page.getByText('Taken 1x');
    }

    getMaxAttemptsErrorLocator() {
        return this.page.getByText('Maximum attempts reached');
    }

    async deleteUserViaApi(token: string): Promise<APIResponse> {
        return await this.request.delete(`${this.baseUrl}/auth/me/`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json' 
            }
        });
    }
}
