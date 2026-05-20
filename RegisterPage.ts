import { APIRequestContext, APIResponse } from '@playwright/test';

export class RegisterPage {
    constructor(private request: APIRequestContext, private baseUrl: string) {}

    async registerUser(userData: object): Promise<APIResponse> {
        return await this.request.post(`${this.baseUrl}/auth/register/`, {
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            data: userData
        });
    }
}
