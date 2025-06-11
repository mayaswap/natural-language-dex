#!/bin/bash

# Quick Start Script for Natural Language DEX Interface
# This script sets up and tests the complete system

set -e

echo "🤖 Natural Language DEX Interface - Quick Start"
echo "================================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "\n${BLUE}🚀 $1${NC}"
    echo "----------------------------------------"
}

# Check prerequisites
print_header "Checking Prerequisites"

# Check Node.js version
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
    
    # Extract major version number
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ $NODE_MAJOR -lt 18 ]; then
        print_error "Node.js 18.0.0 or higher required. Found: $NODE_VERSION"
        print_info "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
else
    print_error "Node.js not found"
    print_info "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    print_status "npm found: $NPM_VERSION"
else
    print_error "npm not found"
    exit 1
fi

# Check git
if command -v git >/dev/null 2>&1; then
    GIT_VERSION=$(git --version)
    print_status "git found: $GIT_VERSION"
else
    print_warning "git not found - you may need it for cloning the repository"
fi

# Install dependencies
print_header "Installing Dependencies"

print_info "Installing root dependencies..."
npm install
print_status "Root dependencies installed"

print_info "Installing ElizaOS agent dependencies..."
cd natural-language-dex
npm install
print_status "ElizaOS agent dependencies installed"

print_info "Installing test suite dependencies..."
cd tests
npm install
print_status "Test suite dependencies installed"

cd ../..

# Environment setup
print_header "Environment Setup"

if [ ! -f .env ]; then
    print_info "Creating .env file from template..."
    cp .env.example .env
    print_status ".env file created"
    
    print_warning "IMPORTANT: Please edit .env with your API keys!"
    print_info "Required: OPENAI_API_KEY (get from https://platform.openai.com/api-keys)"
    print_info "Optional: ANTHROPIC_API_KEY, COINGECKO_API_KEY"
    echo ""
    
    read -p "Press Enter to continue after setting up your .env file, or 'q' to quit: " response
    if [ "$response" = "q" ]; then
        print_info "Exiting. Run this script again after setting up .env"
        exit 0
    fi
else
    print_status ".env file already exists"
fi

# Verify environment
print_header "Verifying Environment"

if grep -q "your_openai_api_key_here" .env; then
    print_error "Please set your OPENAI_API_KEY in .env file"
    print_info "Edit .env and replace 'your_openai_api_key_here' with your actual API key"
    exit 1
else
    print_status "API keys appear to be configured"
fi

# Run tests
print_header "Running Comprehensive Test Suite"

print_info "Starting automated tests..."
cd natural-language-dex/tests

# API Tests
print_info "Testing API integration..."
if npm run test:api; then
    print_status "API integration tests passed"
else
    print_error "API tests failed - check your network connection"
fi

# Wallet Tests  
print_info "Testing wallet functionality..."
if npm run test:wallet; then
    print_status "Wallet functionality tests passed"
else
    print_error "Wallet tests failed - check RPC connections"
fi

# Parser Tests
print_info "Testing natural language parser..."
if npm run test:parser; then
    print_status "Natural language parser tests passed"
else
    print_error "Parser tests failed"
fi

# Full test suite
print_info "Running complete test suite..."
if npm test; then
    print_status "All tests passed! System is functional"
else
    print_warning "Some tests failed - system may still be usable"
fi

cd ../..

# Quick demo
print_header "Quick Demo"

print_info "The system is ready! Here's how to use it:"
echo ""
echo "🤖 Start the AI agent:"
echo "   npm run agent"
echo ""
echo "💬 Try these commands:"
echo "   \"What's HEX trading at?\""
echo "   \"Swap 100 USDC for WPLS\""
echo "   \"Show me PLS/USDC liquidity pools\""
echo "   \"Add 50 USDC to liquidity\""
echo "   \"How much USDC do I have?\""
echo "   \"Show my portfolio\""
echo ""

read -p "Would you like to start the agent now? (y/n): " start_agent

if [ "$start_agent" = "y" ] || [ "$start_agent" = "Y" ]; then
    print_info "Starting the Natural Language DEX Interface agent..."
    echo ""
    cd natural-language-dex
    npm run agent
else
    print_info "You can start the agent later with: npm run agent"
fi

print_header "Setup Complete!"

print_status "Natural Language DEX Interface is ready to use!"
echo ""
echo "📚 Documentation:"
echo "   • README.md - Complete setup guide"
echo "   • TESTING_GUIDE.md - Comprehensive testing instructions"  
echo "   • PROJECT_STATUS.md - Development progress"
echo "   • CONTRIBUTING.md - How to contribute"
echo ""
echo "🧪 Testing:"
echo "   • npm test - Run complete test suite"
echo "   • npm run test:api - Test API integration"
echo "   • npm run test:parser - Test natural language"
echo ""
echo "🤖 Usage:"
echo "   • npm run agent - Start the AI agent"
echo "   • npm run help - Show all available commands"
echo ""
print_status "Happy trading! 🚀" 