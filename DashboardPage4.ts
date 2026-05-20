import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    private createTestLink: Locator;
    private timeoutInput: Locator;
    private visibilityDropdown: Locator;
    private testPasswordInput: Locator;
    private titleInput: Locator;
    private createAndAddButton: Locator;
    private addQuestionButton: Locator;
    private questionTypeDropdown: Locator;
    private questionTextarea: Locator;
    private answer1Input: Locator;
    private answer2Input: Locator;
    private checkboxes: Locator;
    private urlField: Locator;
    private saveQuestionButton: Locator;
    private deleteButton: Locator;

    constructor(private page: Page, private host: string) {
        this.createTestLink = page.getByRole('link', { name: /Create.*test/i });
        this.timeoutInput = page.getByRole('spinbutton').first();
        this.visibilityDropdown = page.getByRole('combobox');
        this.testPasswordInput = page.locator('input[type="password"]');
        this.titleInput = page.locator('input[type="text"]').first();
        this.createAndAddButton = page.getByRole('button', { name: 'Create & Add Questions' });
        this.addQuestionButton = page.getByRole('button', { name: '+ Add Question' });
        this.questionTypeDropdown = page.getByRole('combobox');
        this.questionTextarea = page.locator('textarea');
        this.answer1Input = page.getByRole('textbox', { name: 'Answer 1' });
        this.answer2Input = page.getByRole('textbox', { name: 'Answer 2' });
        this.checkboxes = page.locator('input[type="checkbox"]');
        this.urlField = page.locator('input[readonly], input[value^="http"]');
        this.saveQuestionButton = page.getByRole('button', { name: 'Save Question' });
        this.deleteButton = page.getByRole('button', { name: 'Delete' });
    }

    async navigate() {
        await this.page.goto(`${this.host}/dashboard`);
    }

    async createPasswordProtectedTest(title: string, password: string) {
        await this.createTestLink.click();
        await this.timeoutInput.fill('5');
        await this.visibilityDropdown.selectOption({ value: 'password_protected' });
        await this.testPasswordInput.fill(password);
        await this.titleInput.fill(title);
        await this.createAndAddButton.click();
    }

    async addMultiSelectQuestion(index: number, question: string, ans1: string, ans2: string): Promise<string | null> {
        await this.addQuestionButton.click();
        await this.questionTypeDropdown.selectOption({ value: 'multi_select' });
        await this.questionTextarea.fill(question);
        await this.answer1Input.fill(ans1);
        await this.answer2Input.fill(ans2);

        await this.checkboxes.nth(0).check();
        await this.checkboxes.nth(1).check();

        let link: string | null = null;
        if (index === 1) {
            link = await this.urlField.inputValue();
        }

        await this.saveQuestionButton.click();
        return link;
    }

    async deleteFirstTest() {
        await this.deleteButton.click();
    }
}
