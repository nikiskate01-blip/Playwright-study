import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    private createTestLink: Locator;
    private maxAttemptsInput: Locator;
    private visibilityDropdown: Locator;
    private titleInput: Locator;
    private createAndAddButton: Locator;
    private addQuestionButton: Locator;
    private questionTypeDropdown: Locator;
    private questionTextarea: Locator;
    private answer1Input: Locator;
    private answer2Input: Locator;
    private firstRadioOption: Locator;
    private saveQuestionButton: Locator;
    private resultsLink: Locator;
    private analyticsButton: Locator;
    private deleteButton: Locator;

    constructor(private page: Page, private host: string) {
        this.createTestLink = page.getByRole('link', { name: /Create.*test/i });
        this.maxAttemptsInput = page.locator('input[type="number"]').first();
        this.visibilityDropdown = page.getByRole('combobox');
        this.titleInput = page.locator('input[type="text"]').first();
        this.createAndAddButton = page.getByRole('button', { name: 'Create & Add Questions' });
        this.addQuestionButton = page.getByRole('button', { name: '+ Add Question' });
        this.questionTypeDropdown = page.getByRole('combobox');
        this.questionTextarea = page.locator('textarea');
        this.answer1Input = page.getByRole('textbox', { name: 'Answer 1' });
        this.answer2Input = page.getByRole('textbox', { name: 'Answer 2' });
        this.firstRadioOption = page.locator('input[type="radio"]').first();
        this.saveQuestionButton = page.getByRole('button', { name: 'Save Question' });
        this.resultsLink = page.getByRole('link', { name: "Results" });
        this.analyticsButton = page.getByRole('button', { name: 'Analytics' });
        this.deleteButton = page.getByRole('button', { name: 'Delete' });
    }

    async navigate() {
        await this.page.goto(`${this.host}/dashboard`);
    }

    async createPublicTestWithOneAttempt(title: string) {
        await this.createTestLink.click();
        await this.maxAttemptsInput.fill('1');
        await this.visibilityDropdown.selectOption({ value: 'public' });
        await this.titleInput.fill(title);
        await this.createAndAddButton.click();
    }

    async addMultipleChoiceQuestion(question: string, ans1: string, ans2: string) {
        await this.addQuestionButton.click();
        await this.questionTypeDropdown.selectOption({ value: 'multiple_choice' });
        await this.questionTextarea.fill(question);
        await this.answer1Input.fill(ans1);
        await this.answer2Input.fill(ans2);
        await this.firstRadioOption.check();
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
