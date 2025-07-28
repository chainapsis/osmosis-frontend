import { ChainRecord, Wallet } from "@cosmos-kit/core";
import { MainWalletBase } from "@cosmos-kit/core";
import type { KeplrEWallet } from "@keplr-ewallet/ewallet-sdk-core";
import type { CosmosEWallet } from "@keplr-ewallet/ewallet-sdk-cosmos";

import { ChainKeplrEwallet } from "./chain-wallet";

export class KeplrEwalletWallet extends MainWalletBase {
  eWallet: KeplrEWallet | null = null;
  cosmosEWallet: CosmosEWallet | null = null;

  constructor(walletInfo: Wallet) {
    const ChainWalletConstructor = class extends ChainKeplrEwallet {
      constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
        super(walletInfo, chainInfo, null as any);
      }
    };

    super(walletInfo, ChainWalletConstructor as any);

    // Set mainWallet reference for chain wallets
    const originalGetChainWallet = this.getChainWallet;
    this.getChainWallet = (chainName: string) => {
      const chainWallet = originalGetChainWallet.call(this, chainName);
      if (chainWallet && (chainWallet as any).mainWallet === null) {
        (chainWallet as any).mainWallet = this;
      }
      return chainWallet;
    };
  }

  async initClient() {
    try {
      this.initingClient();
      await this.init();
      this.initClientDone(undefined);
    } catch (error) {
      this.initClientError(
        error instanceof Error ? error : new Error("Unknown error")
      );
      throw error;
    }
  }

  async init() {
    if (!this.eWallet) {
      const { initKeplrEwalletCore } = await import(
        "@keplr-ewallet/ewallet-sdk-core"
      );
      const result = await initKeplrEwalletCore({});

      if (result && result.success) {
        this.eWallet = result.data;
      } else {
        throw new Error(result?.err || "Unknown initialization error");
      }
    }

    if (!this.cosmosEWallet && this.eWallet) {
      const { initCosmosEWallet } = await import(
        "@keplr-ewallet/ewallet-sdk-cosmos"
      );
      this.cosmosEWallet = await initCosmosEWallet({ eWallet: this.eWallet });
    }
  }

  connect = async (_sync?: boolean) => {
    await this.init();

    if (!this.eWallet) {
      throw new Error("Ewallet not initialized");
    }

    await this.eWallet.signIn("google");
  };

  disconnect = async () => {
    if (this.eWallet) {
      await this.eWallet.signOut();
    }
    this.chainWalletMap.clear();
  };

  getChainWallet = (chainName: string) => {
    return this.chainWalletMap.get(chainName);
  };

  get walletName() {
    return this.walletInfo.name;
  }

  get walletPrettyName() {
    return this.walletInfo.prettyName;
  }

  get walletLogo() {
    return this.walletInfo.logo;
  }

  get mode() {
    return this.walletInfo.mode;
  }

  get clientInfo() {
    return undefined;
  }

  get connectOptions() {
    return undefined;
  }

  get mobileDisabled() {
    return this.walletInfo.mobileDisabled;
  }

  get rejectMessage() {
    return this.walletInfo.rejectMessage;
  }

  get rejectCode() {
    return this.walletInfo.rejectCode || 0;
  }

  async addChain(_chainInfo: ChainRecord) {
    // Ewallet handles chain management automatically
    return;
  }

  on() {
    // Event handling placeholder
  }

  off() {
    // Event handling placeholder
  }

  removeAllListeners() {
    // Event handling placeholder
  }
}
