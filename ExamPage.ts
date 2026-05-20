import { Page, Locator, APIRequestContext, APIResponse } from '@playwright/test';

export class ExamPage {
    private startButton: Locator;
    private firstOption: Locator;
    private submitButton: Locator;

    constructor(private page: Page, private request: APIRequestContext, private baseUrl: string) {
        this.startButton = page.getByRole('button', { name: /Start|Старт/i });
        this.firstOption = page.locator('input[type="radio"], .answer-option').first();
        this.submitButton = page.getByRole('button', { name: /Submit|Предай/i }).click; // Поправено дефиниране
        this.submitButton = page.getByRole('button', { name: /Submit|Предай/i });
    }

    async startExam() {
        await this.startButton.click();
    }

    async solveAndSubmit() {
        await this.firstOption.click();
        await this.submitButton.click();
    }

    async deleteUser(token: string): Promise<APIResponse> {
        return await this.request.delete(`${this.baseUrl}/auth/me/`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json' 
            }
        });
    }
}
