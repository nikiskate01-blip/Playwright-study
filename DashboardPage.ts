import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    private createTestLink: Locator;
    private maxAttemptsInput: Locator;
    private visibilityDropdown: Locator;
    private titleInput: Locator;
    private createAndAddButton: Locator;
    private addQuestionButton: Locator;
    private questionTextarea: Locator;
    private answer1Input: Locator;
    private answer2Input: Locator;
    private firstRadioOption: Locator;
    private saveQuestionButton: Locator;
    private deleteButton: Locator;

    constructor(private page: Page, private host: string) {
        this.createTestLink = page.getByRole('main').getByRole('link', { name: 'Create Test' });
        this.maxAttemptsInput = page.getByRole('spinbutton').nth(1);
        this.visibilityDropdown = page.getByRole('combobox');
        this.titleInput = page.locator('input[type="text"]');
        this.createAndAddButton = page.getByRole('button', { name: 'Create & Add Questions' });
        this.addQuestionButton = page.getByRole('main').getByRole('button', { name: '+ Add Question' });
        this.questionTextarea = page.locator('textarea');
        this.answer1Input = page.getByRole('textbox', { name: 'Answer 1' });
        this.answer2Input = page.getByRole('textbox', { name: 'Answer 2' });
        this.firstRadioOption = page.getByRole('radio').first();
        this.saveQuestionButton = page.getByRole('button', { name: 'Save Question' });
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

    async addRadioQuestion(question: string, ans1: string, ans2: string) {
        await this.addQuestionButton.click();
        await this.questionTextarea.fill(question);
        await this.answer1Input.fill(ans1);
        await this.answer2Input.fill(ans2);
        await this.firstRadioOption.check();
        await this.saveQuestionButton.click();
    }

    async deleteFirstTestWithConfirm() {
        // Слушател за автоматично потвърждаване на изскачащия диалог
        this.page.once('dialog', dialog => dialog.accept());
        await this.deleteButton.click();
    }
}
