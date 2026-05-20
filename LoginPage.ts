import { Page, Locator } from '@playwright/test';

export class LoginPage {
    private emailInput: Locator;
    private passwordInput: Locator;
    private signInButton: Locator;

    constructor(private page: Page, private host: string) {
        this.emailInput = page.locator('input[type="email"]');
        this.passwordInput = page.locator('input[type="password"]');
        this.signInButton = page.getByRole('button', { name: /Sign In/i });
    }

    async navigate() {
        await this.page.goto(`${this.host}/login`);
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.signInButton.click();
    }

    async extractAccessToken(): Promise<string | null> {
        let token = await this.page.evaluate(() => 
            localStorage.getItem('access') || 
            localStorage.getItem('token') || 
            localStorage.getItem('access_token') ||
            localStorage.getItem('jwt')
        );

        if (!token) {
            const cookies = await this.page.context().cookies();
            const authCookie = cookies.find(c => ['access', 'token', 'sessionid'].includes(c.name));
            if (authCookie) token = authCookie.value;
        }
        return token;
    }
}
