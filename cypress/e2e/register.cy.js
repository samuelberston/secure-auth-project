// cypress/e2e/register.cy.js

describe('User Registration and Login', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should register a new user and login', () => {
        const username = `user_${Date.now()}`;
        const password = 'UserPass123!';

        // Enter username and password
        cy.get('#register-username').type(username);
        cy.get('#register-password').type(password);
        cy.get('#register-button').click();

        cy.get('#register-response').should('contain', 'User registered successfully.');

        // Login with the same username and password
        cy.get('#login-username').type(username);
        cy.get('#login-password').type(password);
        cy.get('#login-button').click();

        // Verify protected content is visible
        cy.get('#protected-content').should('be.visible');
    });

    // TODO: Add tests for login failure
    // TODO: Add tests for logout
    // TODO: Add tests for accessing protected endpoint
});