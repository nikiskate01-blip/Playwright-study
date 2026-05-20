import { Page, Locator, APIRequestContext } from '@playwright/test';

export class DashboardPage {
    private createTestLink: Locator;
    private maxAttemptsInput: Locator;
    private visibilityDropdown: Locator;
    private titleInput: Locator;
    private createAndAddButton: Locator;
    private addQuestionButton: Locator;
    private questionTypeDropdown: Locator;
    private questionTextarea: Locator;
    private correctAnswerInput: Locator;
    private saveQuestionButton: Locator;
    private resultsLink: Locator;
    private analyticsButton: Locator;
    private deleteButton: Locator;

    constructor(private page: Page, private host: string) {
        this.createTestLink = page.getByRole('link', { name: /Create.*test/i });
        this.maxAttemptsInput = page.locator('label:has-text("Max Attempts") + input, input[type="number"]').nth(1);
        this.visibilityDropdown = page.getByRole('combobox');
        this.titleInput = page.locator('input[type="text"]').first();
        this.createAndAddButton = page.getByRole('button', { name: 'Create & Add Questions' });
        this.addQuestionButton = page.getByRole('button', { name: '+ Add Question' });
        this.questionTypeDropdown = page.getByRole('combobox');
        this.questionTextarea = page.locator('textarea');
        this.correctAnswerInput = page.getByRole('textbox', { name: 'Correct Answer' });
        this.saveQuestionButton = page.getByRole('button', { name: 'Save Question' });
        this.resultsLink = page.getByRole('link', { name: "Results" });
        this.analyticsButton = page.getByRole('button', { name: 'Analytics' });
        this.deleteButton = page.getByRole('button', { name: 'Delete' });
    }

    async navigate() {
        await this.page.goto(`${this.host}/dashboard`);
    }

    async createPublicTest(title: string, maxAttempts: string) {
        await this.createTestLink.click();
        await this.maxAttemptsInput.fill(maxAttempts);
        await this.visibilityDropdown.selectOption({ value: 'public' });
        await this.titleInput.fill(title);
        await this.createAndAddButton.click();
    }

    async addExactAnswerQuestion(question: string, answer: string) {
        await this.addQuestionButton.click();
        await this.questionTypeDropdown.selectOption({ value: 'exact_answer' });
        await this.questionTextarea.fill(question);
        await this.correctAnswerInput.fill(answer);
        await this.saveQuestionButton.click();
    }

    async openAnalytics() {
        await this.resultsLink.click();
        await this.analyticsButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async deleteTest() {
        await this.deleteButton.click();
    }
}
