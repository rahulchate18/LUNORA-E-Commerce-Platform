# Contributing to LUNORA

Thank you for your interest in contributing to LUNORA Premium E-Commerce! We welcome contributions to improve performance, add documentation, or fix bugs.

## Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs
* Use the GitHub issue tracker to report bugs.
* Include a clear description of the problem, steps to reproduce it, and the environment (Node.js version, OS, browser).

### Feature Requests
* Open an issue with the tag `enhancement`.
* Explain the proposed feature and why it would be beneficial to LUNORA.

### Submitting Pull Requests
1. Fork the repository.
2. Create a topic branch: `git checkout -b feature/your-feature-name`.
3. Implement your changes. Ensure code conforms to TypeScript type checks and linting rules.
4. Run tests:
   - Backend: `npm run build --prefix server`
   - Frontend: `npm run build`
5. Commit your changes: `git commit -m "feat: add support for XYZ"`.
6. Push to your branch and open a Pull Request against `main`.

## Coding Standards
* We follow strict TypeScript standards (no `any` type, proper interface declarations).
* Decouple database actions using the Service Layer architecture.
* Extract all secrets to environment variables. Never commit `.env` files.
