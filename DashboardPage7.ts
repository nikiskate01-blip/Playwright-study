import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    private createTestLink: Locator;
    private visibilityDropdown: Locator;
    private testPasswordInput: Locator;
    private titleInput: Locator;
    private createAndAddButton: Locator;
    private addQuestionButton: Locator;
    private questionTypeDropdown: Locator;
    private questionTextarea: Locator;
    private answer1Input: Locator;
    private answer2Input: Locator;
    private firstRadioOption: Locator;
    private checkboxes: Locator;
    private correctAnswerInput: Locator;
    private urlField: Locator;
    private saveQuestionButton: Locator;
    private firstQuestionEditButton: Locator;
    private saveOrUpdateGenericButton: Locator;
    private resultsLink: Locator;
    private analyticsButton: Locator;
    private deleteButton: Locator;

    constructor(private page: Page, private host: string) {
        this.createTestLink = page.getByRole('link', { name: /Create.*test/i });
        this.visibilityDropdown = page.getByRole('combobox');
        this.testPasswordInput = page.locator('input[type="password"]');
        this.titleInput = page.locator('input[type="text"]').first();
        this.createAndAddButton = page.getByRole('button', { name: 'Create & Add Questions' });
        this.addQuestionButton = page.getByRole('button', { name: '+ Add Question' });
        this.questionTypeDropdown = page.getByRole('combobox');
        this.questionTextarea = page.locator('textarea');
        this.answer1Input = page.getByRole('textbox', { name: 'Answer 1' });
        this.answer2Input = page.getByRole('textbox', { name: 'Answer 2' });
        this.firstRadioOption = page.locator('input[type="radio"]').first();
        this.checkboxes = page.locator('input[type="checkbox"]');
        this.correctAnswerInput = page.getByRole('textbox', { name: 'Correct Answer' });
        this.urlField = page.locator('input[readonly], input[value^="http"]');
        this.saveQuestionButton = page.getByRole('button', { name: 'Save Question' });
        this.firstQuestionEditButton = page.locator('button').filter({ hasText: /Edit/i }).first();
        this.saveOrUpdateGenericButton = page.getByRole('button', { name: /Save|Update/i });
        this.resultsLink = page.getByRole('link', { name: "Results" });
        this.analyticsButton = page.getByRole('button', { name: 'Analytics' });
        this.deleteButton = page.getByRole('button', { name: 'Delete' });
    }

    async navigate() {
        await this.page.goto(`${this.host}/dashboard`);
    }

    async createPasswordProtectedTest(title: string, password: string) {
        await this.createTestLink.click();
        await this.visibilityDropdown.selectOption({ value: 'password_protected' });
        await this.testPasswordInput.fill(password);
        await this.titleInput.fill(title);
        await this.createAndAddButton.click();
    }

    async addSingleChoiceQuestion(question: string, ans1: string, ans2: string) {
        await this.addQuestionButton.click();
        await this.questionTextarea.fill(question);
        await this.answer1Input.fill(ans1);
        await this.firstRadioOption.check();
        await this.answer2Input.fill(ans2);
        await this.saveQuestionButton.click();
    }

    async addMultiSelectQuestion(question: string, ans1: string, ans2: string) {
        await this.addQuestionButton.click();
        await this.questionTypeDropdown.selectOption({ value: 'multi_select' });
        await this.questionTextarea.fill(question);
        await this.answer1Input.fill(ans1);
        await this.answer2Input.fill(ans2);
        await this.checkboxes.nth(0).check();
        await this.checkboxes.nth(1).check();
        await this.saveQuestionButton.click();
    }

    async addExactAnswerQuestionAndGetLink(question: string, answer: string): Promise<string> {
        await this.addQuestionButton.click();
        await this.questionTypeDropdown.selectOption({ value: 'exact_answer' });
        await this.questionTextarea.fill(question);
        await this.correctAnswerInput.fill(answer);
        
        await this.urlField.waitFor({ state: 'visible' });
        const link = await this.urlField.inputValue();
        
        await this.saveQuestionButton.click();
        return link;
    }

    async openTestEditor(title: string) {
        await this.page.reload({ waitUntil: 'networkidle' });
        const testCard = this.page.locator('.v-card, .v-sheet, div').filter({ hasText: title }).last();
        await testCard.waitFor({ state: 'visible', timeout: 20000 });

        const editBtn = testCard.locator('a[href*="edit"], button:has-text("Edit")').first();
        await editBtn.click();
        await this.page.waitForURL(/edit/);
    }

    async editFirstQuestionText(newText: string) {
        await this.firstQuestionEditButton.click();
        await this.questionTextarea.fill(newText);
        await this.saveOrUpdateGenericButton.click();
        await this.page.waitForLoadState('networkidle');
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
