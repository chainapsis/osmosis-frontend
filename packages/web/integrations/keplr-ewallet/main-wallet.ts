import { StdSignDoc } from "@cosmjs/amino";
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

    // Set mainWallet reference after construction
    this.setMainWalletReferences();
  }

  private setMainWalletReferences() {
    // Override getChainWallet to set mainWallet reference
    const originalGetChainWallet = this.getChainWallet;
    this.getChainWallet = (chainName: string) => {
      const chainWallet = originalGetChainWallet.call(this, chainName) as any;
      if (chainWallet && !chainWallet.mainWallet) {
        chainWallet.mainWallet = this;
      }
      return chainWallet;
    };
  }

  async initClient() {
    try {
      this.initingClient();
      await this.init();

      // Set this as the client - required by cosmos-kit
      this.initClientDone(this as any);
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
      const result = await initKeplrEwalletCore({
        customerId: "afb0afd1-d66d-4531-981c-cbf3fb1507b9",
      });

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

  connect = async (
    syncOrChainIds?: boolean | string | string[],
    options?: any
  ) => {
    // Ensure client is initialized first
    if (this.state === "Init") {
      await this.initClient();
    }

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

  async getSimpleAccount(chainId: string) {
    if (!this.cosmosEWallet) {
      await this.init();
      if (!this.cosmosEWallet) {
        throw new Error("Cosmos ewallet not available");
      }
    }

    const account = await this.cosmosEWallet.getKey(chainId);
    return {
      namespace: "cosmos",
      chainId,
      address: account.bech32Address,
      username: account.name,
    };
  }

  getOfflineSigner(chainId: string) {
    if (!this.cosmosEWallet) {
      throw new Error("Cosmos ewallet not available");
    }

    const cosmosEWallet = this.cosmosEWallet;
    return {
      getAccounts: async () => {
        const account = await cosmosEWallet.getKey(chainId);
        return [
          {
            address: account.bech32Address,
            algo: account.algo as any,
            pubkey: account.pubKey,
          },
        ];
      },
      signAmino: async (signerAddress: string, signDoc: StdSignDoc) => {
        return await cosmosEWallet.signAmino(chainId, signerAddress, signDoc);
      },
      signDirect: async (signerAddress: string, signDoc: any) => {
        return await cosmosEWallet.signDirect(chainId, signerAddress, signDoc);
      },
    };
  }

  getOfflineSignerAmino(chainId: string) {
    return this.getOfflineSigner(chainId);
  }

  getOfflineSignerDirect(chainId: string) {
    return this.getOfflineSigner(chainId);
  }
}
