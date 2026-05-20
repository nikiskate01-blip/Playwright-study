import { Page, Locator, APIRequestContext, APIResponse } from '@playwright/test';

export class ExamPage {
    private nameInput: Locator;
    private startTestButton: Locator;

    constructor(private page: Page, private request: APIRequestContext, private baseUrl: string) {
        this.nameInput = page.getByRole('textbox', { name: 'Your name (optional)' });
        this.startTestButton = page.getByRole('button', { name: 'Start Test' });
    }

    async startExam(link: string, userName: string) {
        await this.page.goto(link);
        await this.nameInput.fill(userName);
        await this.startTestButton.click();
    }

    async waitForTimeoutRedirect(seconds: number) {
        console.log(`Изчакване на ${seconds} секунди...`);
        await this.page.waitForTimeout(seconds * 1000);
    }

    async deleteUserViaApi(token: string): Promise<APIResponse> {
        return await this.request.delete(`${this.baseUrl}/auth/me/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }
}
