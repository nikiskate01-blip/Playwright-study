import { Page, Locator } from '@playwright/test';

export class ExplorePage {
    private searchBox: Locator;
    private sortDropdown: Locator;

    constructor(private page: Page, private host: string) {
        this.searchBox = page.getByRole('textbox', { name: 'Search by title...' });
        this.sortDropdown = page.getByRole('combobox');
    }

    async navigate() {
        await this.page.goto(`${this.host}/explore`);
        await this.page.waitForLoadState('networkidle');
    }

    async searchAndSort(query: string, sortValue: string) {
        await this.searchBox.waitFor({ state: 'visible' });
        await this.searchBox.fill(query);
        await this.searchBox.press('Enter');
        await this.page.waitForLoadState('networkidle');

        await this.sortDropdown.waitFor({ state: 'visible' });
        await this.sortDropdown.selectOption({ value: sortValue });
        await this.page.waitForLoadState('networkidle');
    }

    async openTestByAuthor(authorName: string, fallbackUrl: string) {
        const testCard = this.page.locator('div.px-6.py-4.text-gray-600', { hasText: authorName })
            .locator('xpath=./ancestor::div[contains(@class, "card")] | ./ancestor::a')
            .first();

        if (await testCard.count() === 0) {
            await this.page.goto(`${this.host}${fallbackUrl}`);
        } else {
            const startLink = testCard.locator(`a[href="${fallbackUrl}"]`);
            await startLink.scrollIntoViewIfNeeded();
            await startLink.click();
        }
    }
}
