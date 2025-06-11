import chalk from 'chalk';
import { ethers } from 'ethers';

/**
 * Test Utilities and Helpers
 */

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
  data?: any;
}

export class TestLogger {
  private testCount = 0;
  private passedCount = 0;
  private failedCount = 0;

  log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = `[${timestamp}]`;
    
    switch (type) {
      case 'success':
        console.log(chalk.green(`${prefix} ✅ ${message}`));
        break;
      case 'error':
        console.log(chalk.red(`${prefix} ❌ ${message}`));
        break;
      case 'warning':
        console.log(chalk.yellow(`${prefix} ⚠️  ${message}`));
        break;
      default:
        console.log(chalk.blue(`${prefix} ℹ️  ${message}`));
    }
  }

  async runTest(name: string, testFn: () => Promise<any>): Promise<TestResult> {
    this.testCount++;
    const startTime = Date.now();
    
    try {
      this.log(`Running test: ${name}`, 'info');
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.passedCount++;
      this.log(`PASSED: ${name} (${duration}ms)`, 'success');
      
      return {
        name,
        passed: true,
        duration,
        data: result
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.failedCount++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.log(`FAILED: ${name} - ${errorMessage} (${duration}ms)`, 'error');
      
      return {
        name,
        passed: false,
        error: errorMessage,
        duration
      };
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log(chalk.bold('TEST SUMMARY'));
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.testCount}`);
    console.log(chalk.green(`Passed: ${this.passedCount}`));
    console.log(chalk.red(`Failed: ${this.failedCount}`));
    console.log(`Success Rate: ${((this.passedCount / this.testCount) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
  }
}

export class TestAssertions {
  static assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  static assertEqual(actual: any, expected: any, message?: string): void {
    if (actual !== expected) {
      throw new Error(
        `Assertion failed: ${message || 'Values not equal'}\nExpected: ${expected}\nActual: ${actual}`
      );
    }
  }

  static assertNotNull(value: any, message?: string): void {
    if (value === null || value === undefined) {
      throw new Error(`Assertion failed: ${message || 'Value is null or undefined'}`);
    }
  }

  static assertType(value: any, expectedType: string, message?: string): void {
    if (typeof value !== expectedType) {
      throw new Error(
        `Assertion failed: ${message || 'Type mismatch'}\nExpected: ${expectedType}\nActual: ${typeof value}`
      );
    }
  }

  static assertGreaterThan(actual: number, expected: number, message?: string): void {
    if (actual <= expected) {
      throw new Error(
        `Assertion failed: ${message || 'Value not greater than expected'}\nExpected > ${expected}\nActual: ${actual}`
      );
    }
  }

  static assertContains(array: any[], item: any, message?: string): void {
    if (!array.includes(item)) {
      throw new Error(
        `Assertion failed: ${message || 'Array does not contain item'}\nArray: ${JSON.stringify(array)}\nItem: ${item}`
      );
    }
  }

  static assertValidAddress(address: string, message?: string): void {
    if (!ethers.isAddress(address)) {
      throw new Error(
        `Assertion failed: ${message || 'Invalid Ethereum address'}\nAddress: ${address}`
      );
    }
  }

  static assertValidBigNumber(value: string, message?: string): void {
    try {
      ethers.getBigInt(value);
    } catch (error) {
      throw new Error(
        `Assertion failed: ${message || 'Invalid BigNumber'}\nValue: ${value}`
      );
    }
  }
}

export class WalletTestHelper {
  static generateTestWallet(): ethers.HDNodeWallet {
    return ethers.Wallet.createRandom();
  }

  static async getWalletBalance(
    provider: ethers.Provider,
    address: string,
    tokenAddress?: string
  ): Promise<bigint> {
    if (!tokenAddress) {
      // Get native token balance
      return await provider.getBalance(address);
    } else {
      // Get ERC20 token balance
      const erc20Abi = [
        'function balanceOf(address owner) view returns (uint256)'
      ];
      const contract = new ethers.Contract(tokenAddress, erc20Abi, provider);
      return await contract.balanceOf(address);
    }
  }

  static formatBalance(balance: bigint, decimals: number = 18): string {
    return ethers.formatUnits(balance, decimals);
  }

  static parseAmount(amount: string, decimals: number = 18): bigint {
    return ethers.parseUnits(amount, decimals);
  }
}

export class APITestHelper {
  static async testEndpoint(
    url: string,
    expectedStatus: number = 200,
    timeout: number = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DEX-Interface-Test/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (response.status !== expectedStatus) {
        throw new Error(
          `HTTP ${response.status}: Expected ${expectedStatus} for ${url}`
        );
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms for ${url}`);
      }
      throw error;
    }
  }

  static async testJSONResponse(url: string, requiredFields: string[] = []): Promise<any> {
    const response = await this.testEndpoint(url);
    const data = await response.json();

    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field '${field}' in response from ${url}`);
      }
    }

    return data;
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatTestData(data: any): string {
  return JSON.stringify(data, null, 2);
} 