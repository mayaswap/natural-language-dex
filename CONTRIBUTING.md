# Contributing to Natural Language DEX Interface

> Thank you for your interest in contributing to the Natural Language DEX Interface project! 

## 🌟 Welcome Contributors

We're building the future of conversational DeFi trading, and we'd love your help! Whether you're fixing bugs, adding features, improving documentation, or helping with testing, every contribution matters.

## 🚀 Quick Start for Contributors

### 1. Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/your-username/natural-language-dex.git
cd natural-language-dex
```

### 2. Setup Development Environment

```bash
# Install all dependencies
npm run setup

# Create environment file
npm run setup:env

# Edit .env with your API keys
cp .env.example .env
nano .env
```

### 3. Verify Everything Works

```bash
# Run the complete test suite
npm test

# Start the agent to test interactively
npm run agent
```

## 🧪 Testing Your Changes

### Required Tests Before Submitting

```bash
# 1. Run all automated tests
npm run test:all

# 2. Check code quality
npm run lint

# 3. Verify TypeScript types
npm run type-check

# 4. Test the agent interactively
npm run agent
```

### Testing New Features

If you're adding new functionality:

1. **Add automated tests** in `natural-language-dex/tests/`
2. **Test natural language variations** with the parser
3. **Verify error handling** works properly
4. **Check cross-chain compatibility** if applicable
5. **Update documentation** with examples

## 📝 Development Guidelines

### Code Style

- **TypeScript**: All code should be strongly typed
- **ESLint**: Follow the existing linting rules
- **Formatting**: Use Prettier-compatible formatting
- **Comments**: Add JSDoc comments for public APIs

### Natural Language Processing

When working on the parser or commands:

- **Test multiple variations** of the same intent
- **Maintain >90% accuracy** on the test suite
- **Add new test cases** for edge cases you discover
- **Consider international variations** (e.g., "colour" vs "color")

### ElizaOS Integration

For new actions or features:

- **Follow ElizaOS patterns** from existing actions
- **Include proper error handling** with user-friendly messages
- **Add conversational responses** with appropriate emojis
- **Test with the character personality** to ensure consistency

## 🛠️ Project Structure

```
natural-language-dex/
├── src/
│   ├── actions/           # ElizaOS actions (ADD NEW FEATURES HERE)
│   ├── utils/             # Core utilities and services
│   ├── config/            # Configuration files
│   └── types/             # TypeScript type definitions
├── tests/                 # Comprehensive test suite
├── characters/            # ElizaOS character configuration
└── docs/                  # Documentation
```

### Adding New Features

1. **Actions** (`src/actions/`): ElizaOS-compatible actions for new commands
2. **Utils** (`src/utils/`): Core business logic and API clients  
3. **Types** (`src/types/`): TypeScript interfaces and types
4. **Tests** (`tests/`): Automated tests for your functionality
5. **Docs**: Update relevant documentation

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Run the test suite** to confirm the bug
3. **Test with latest code** from the main branch

### Bug Report Template

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Run command: `npm run agent`
2. Type: "What's HEX trading at?"
3. Expected: Price information
4. Actual: Error message

## Environment
- Node.js version: 18.17.0
- OS: macOS 13.4
- Branch: main (commit abc123)

## Test Results
```bash
npm test
# Include relevant test output
```

## Additional Context
Any other relevant information
```

## ✨ Feature Requests

### Feature Request Template

```markdown
## Feature Description
What feature would you like to see added?

## Use Case
Why would this feature be valuable?

## Natural Language Examples
How would users interact with this feature?
- "Add 100 USDC to the safest liquidity pool"
- "Show me yield farming opportunities"

## Technical Considerations
Any technical constraints or requirements?

## Acceptance Criteria
What defines this feature as "complete"?
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] **Tests pass**: `npm run test:all`
- [ ] **Code quality**: `npm run lint`
- [ ] **Types check**: `npm run type-check`
- [ ] **Agent works**: `npm run agent` (manual test)
- [ ] **Documentation updated**: If adding new features
- [ ] **Changelog entry**: Add to CHANGELOG.md if significant

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] All automated tests pass
- [ ] Added new tests for new functionality
- [ ] Manually tested with agent
- [ ] Parser accuracy maintained >90%

## Natural Language Examples
If adding new commands, provide examples:
- "New command example 1"
- "New command example 2"

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Code is commented (particularly complex areas)
- [ ] Documentation updated
- [ ] No console.log statements left in code
```

## 🏗️ Development Areas

### High-Priority Contributions Needed

1. **Web Interface Development**
   - React/Next.js frontend
   - Real-time trading interface
   - Portfolio dashboard
   - Mobile responsive design

2. **Advanced Analytics**
   - Portfolio performance metrics
   - Risk assessment algorithms
   - Market analysis features
   - Historical data tracking

3. **Cross-Chain Features**
   - Bridge integrations
   - Multi-chain routing
   - Gas optimization
   - Chain-specific optimizations

4. **User Experience**
   - Onboarding tutorials
   - Error message improvements
   - Natural language pattern expansion
   - Accessibility features

### Technical Skills Welcome

- **Frontend**: React, Next.js, TypeScript, Web3 integration
- **Backend**: Node.js, API development, Database design
- **Blockchain**: Ethereum/EVM, DeFi protocols, Smart contracts
- **AI/ML**: Natural language processing, Intent recognition
- **DevOps**: GitHub Actions, Docker, Deployment automation
- **Testing**: Unit testing, Integration testing, E2E testing

## 📚 Resources

### Learning Resources

- **ElizaOS Documentation**: [ElizaOS Core](https://github.com/elizaOS/eliza)
- **DeFi Concepts**: Understanding DEX protocols and liquidity
- **Natural Language Processing**: Intent recognition and parsing
- **Ethereum Development**: ethers.js, viem, Web3 libraries

### Project Resources

- **[Testing Guide](./TESTING_GUIDE.md)**: Complete testing procedures
- **[Project Status](./PROJECT_STATUS.md)**: Current development status
- **[How It Works](./HOW_IT_WORKS_TUTORIAL.md)**: Technical implementation
- **[Liquidity Plan](./natural-language-dex/LIQUIDITY_MANAGEMENT_PLAN.md)**: V3 liquidity features

## 🤝 Community Guidelines

### Code of Conduct

- **Be respectful** and inclusive to all contributors
- **Provide constructive feedback** in code reviews
- **Help newcomers** get started and learn
- **Focus on the code**, not the person
- **Celebrate successes** and learn from failures

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Reviews**: Code-specific feedback
- **Documentation**: Keep it clear and up-to-date

## 🎉 Recognition

### Contributors Wall

We recognize all contributors! Your GitHub profile will be featured:

- **Code Contributors**: Features, bug fixes, optimizations
- **Documentation Contributors**: Guides, tutorials, examples
- **Testing Contributors**: Test cases, bug reports, validation
- **Community Contributors**: Reviews, discussions, support

### Contribution Levels

- **🌟 First Contribution**: Welcome to the community!
- **⚡ Regular Contributor**: Multiple merged PRs
- **🏆 Core Contributor**: Significant features or leadership
- **👑 Maintainer**: Ongoing project stewardship

## 📊 Contribution Metrics

We track and celebrate:

- **Parser Accuracy Improvements**: Every percentage point matters
- **Test Coverage Increases**: Better reliability
- **Performance Optimizations**: Faster response times
- **New Feature Additions**: Expanded functionality
- **Documentation Quality**: Better user experience

## 🛡️ Security

### Reporting Security Issues

**DO NOT** report security vulnerabilities in public issues.

Instead:
1. **Email**: security@yourproject.com
2. **GitHub Security**: Use GitHub's private vulnerability reporting
3. **Encrypted**: Use GPG key if sensitive

### Security Guidelines

- **No private keys** in code or docs
- **Environment variables** for all secrets
- **Input validation** for all user inputs
- **Rate limiting** for API endpoints
- **Audit dependencies** regularly

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible

### Release Checklist

- [ ] All tests pass on main branch
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version numbers bumped
- [ ] Release notes prepared
- [ ] GitHub release created

---

## 🎯 Getting Started

Ready to contribute? Here's your next steps:

1. **🍴 Fork the repository**
2. **📥 Clone your fork**
3. **🔧 Run `npm run setup`**
4. **🧪 Run `npm test` to verify everything works**
5. **🚀 Start the agent with `npm run agent`**
6. **💡 Pick an issue or propose a feature**
7. **✨ Make your changes**
8. **📝 Submit a pull request**

**Thank you for contributing to the future of conversational DeFi trading! 🤖💱** 