import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    private createTestLink: Locator;
    private timeoutInput: Locator;
    private visibilityDropdown: Locator;
    private titleInput: Locator;
    private createAndAddButton: Locator;
    private addQuestionButton: Locator;
    private questionTextarea: Locator;
    private answer1Input: Locator;
    private answer2Input: Locator;
    private firstRadioOption: Locator;
    private urlField: Locator;
    private saveQuestionButton: Locator;
    private resultsLink: Locator;
    private analyticsButton: Locator;
    private deleteButton: Locator;
    private confirmButton: Locator;

    constructor(private page: Page, private host: string) {
        this.createTestLink = page.getByRole('link', { name: 'Create Test' });
        this.timeoutInput = page.getByRole('spinbutton').first();
        this.visibilityDropdown = page.getByRole('combobox');
        this.titleInput = page.locator('input[type="text"]');
        this.createAndAddButton = page.getByRole('button', { name: 'Create & Add Questions' });
        this.addQuestionButton = page.getByRole('button', { name: '+ Add Question' });
        this.questionTextarea = page.locator('textarea');
        this.answer1Input = page.getByRole('textbox', { name: 'Answer 1' });
        this.answer2Input = page.getByRole('textbox', { name: 'Answer 2' });
        this.firstRadioOption = page.getByRole('radio').first();
        this.urlField = page.locator('input[readonly], input[value^="http"]');
        this.saveQuestionButton = page.getByRole('button', { name: 'Save Question' });
        this.resultsLink = page.getByRole('link', { name: "Results" });
        this.analyticsButton = page.getByRole('button', { name: 'Analytics' });
        this.deleteButton = page.getByRole('button', { name: 'Delete' });
        this.confirmButton = page.getByRole('button', { name: /Confirm|OK/i });
    }

    async navigate() {
        await this.page.goto(`${this.host}/dashboard`);
    }

    async createLinkOnlyTestWithOneMinuteTimeout(title: string) {
        await this.createTestLink.click();
        await this.timeoutInput.fill('1'); 
        await this.visibilityDropdown.selectOption({ value: 'link_only' });
        await this.titleInput.fill(title);
        await this.createAndAddButton.click();
    }

    async addQuestionAndGetLink(question: string, ans1: string, ans2: string): Promise<string> {
        await this.addQuestionButton.click();
        await this.questionTextarea.fill(question);
        await this.answer1Input.fill(ans1);
        await this.answer2Input.fill(ans2);
        await this.firstRadioOption.check();

        await this.urlField.waitFor({ state: 'visible' });
        const link = await this.urlField.inputValue();

        await this.saveQuestionButton.click();
        return link;
    }

    async openAnalyticsForTest(title: string) {
        const testRow = this.page.locator('.v-card, .test-row', { hasText: title }).last();
        await this.resultsLink.click();
        await this.analyticsButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async deleteTest(title: string) {
        const testRow = this.page.locator('.v-card, .test-row', { hasText: title }).last();
        await this.deleteButton.click();
        if (await this.confirmButton.isVisible()) {
            await this.confirmButton.click();
        }
    }
}
