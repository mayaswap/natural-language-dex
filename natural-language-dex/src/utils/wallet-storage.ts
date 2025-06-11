import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Wallet storage interface
interface StoredWallet {
    address: string;
    privateKey: string;
    createdAt: number;
    userId: string;
}

interface WalletStore {
    wallets: Record<string, StoredWallet>;
    version: string;
}

export class WalletStorage {
    private static instance: WalletStorage;
    private storageDir: string;
    private storageFile: string;
    private walletStore: WalletStore;

    private constructor() {
        // Default storage location: ~/.natural-language-dex/wallets/
        this.storageDir = path.join(os.homedir(), '.natural-language-dex', 'wallets');
        this.storageFile = path.join(this.storageDir, 'wallet-store.json');
        
        // Create directory if it doesn't exist
        this.ensureStorageDir();
        
        // Load existing wallets
        this.walletStore = this.loadWallets();
        
        console.log(`💾 Wallet storage initialized at: ${this.storageDir}`);
    }

    static getInstance(): WalletStorage {
        if (!WalletStorage.instance) {
            WalletStorage.instance = new WalletStorage();
        }
        return WalletStorage.instance;
    }

    private ensureStorageDir(): void {
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
            console.log(`📁 Created wallet storage directory: ${this.storageDir}`);
        }
    }

    private loadWallets(): WalletStore {
        try {
            if (fs.existsSync(this.storageFile)) {
                const data = fs.readFileSync(this.storageFile, 'utf-8');
                const store = JSON.parse(data) as WalletStore;
                console.log(`✅ Loaded ${Object.keys(store.wallets).length} wallets from storage`);
                return store;
            }
        } catch (error) {
            console.error('Error loading wallets:', error);
        }
        
        // Return empty store if file doesn't exist or error occurred
        return {
            wallets: {},
            version: '1.0.0'
        };
    }

    private saveWallets(): void {
        try {
            const data = JSON.stringify(this.walletStore, null, 2);
            fs.writeFileSync(this.storageFile, data, 'utf-8');
            
            // Also create a backup
            const backupFile = path.join(this.storageDir, `wallet-store-backup-${Date.now()}.json`);
            fs.writeFileSync(backupFile, data, 'utf-8');
            
            // Keep only last 5 backups
            this.cleanupOldBackups();
            
            console.log(`💾 Wallets saved to: ${this.storageFile}`);
        } catch (error) {
            console.error('Error saving wallets:', error);
        }
    }

    private cleanupOldBackups(): void {
        try {
            const files = fs.readdirSync(this.storageDir);
            const backupFiles = files
                .filter(f => f.startsWith('wallet-store-backup-'))
                .sort()
                .reverse();
            
            // Remove old backups, keep only 5 most recent
            for (let i = 5; i < backupFiles.length; i++) {
                fs.unlinkSync(path.join(this.storageDir, backupFiles[i]));
            }
        } catch (error) {
            console.error('Error cleaning up backups:', error);
        }
    }

    saveWallet(userId: string, wallet: { address: string; privateKey: string }): void {
        this.walletStore.wallets[userId] = {
            address: wallet.address,
            privateKey: wallet.privateKey,
            createdAt: Date.now(),
            userId
        };
        
        this.saveWallets();
        
        // Also create a separate file for this user's wallet (extra safety)
        const userWalletFile = path.join(this.storageDir, `wallet-${userId}-${wallet.address}.json`);
        fs.writeFileSync(userWalletFile, JSON.stringify({
            ...wallet,
            createdAt: new Date().toISOString(),
            userId,
            warning: "KEEP THIS FILE SAFE! This contains your private key. Never share it with anyone!"
        }, null, 2), 'utf-8');
        
        console.log(`✅ Wallet saved for user ${userId}: ${wallet.address}`);
        console.log(`📍 Individual wallet file: ${userWalletFile}`);
    }

    getWallet(userId: string): StoredWallet | null {
        return this.walletStore.wallets[userId] || null;
    }

    getAllWallets(): Record<string, StoredWallet> {
        return this.walletStore.wallets;
    }

    getStorageLocation(): string {
        return this.storageDir;
    }

    getStorageInfo(): {
        location: string;
        mainFile: string;
        walletCount: number;
        wallets: Array<{ userId: string; address: string; created: Date }>;
    } {
        const wallets = Object.entries(this.walletStore.wallets).map(([userId, wallet]) => ({
            userId,
            address: wallet.address,
            created: new Date(wallet.createdAt)
        }));

        return {
            location: this.storageDir,
            mainFile: this.storageFile,
            walletCount: wallets.length,
            wallets
        };
    }
} 