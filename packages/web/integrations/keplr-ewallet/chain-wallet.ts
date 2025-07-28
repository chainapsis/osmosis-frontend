import { AccountData, AminoSignResponse, StdSignDoc } from "@cosmjs/amino";
import { DirectSignResponse } from "@cosmjs/proto-signing";
import {
  ChainRecord,
  DirectSignDoc,
  SignOptions,
  State,
  Wallet,
} from "@cosmos-kit/core";
import { ChainWalletBase } from "@cosmos-kit/core";

import { KeplrEwalletWallet } from "./main-wallet";

export class ChainKeplrEwallet extends ChainWalletBase {
  mainWallet: KeplrEwalletWallet;
  private _accountData: AccountData | undefined;

  constructor(
    walletInfo: Wallet,
    chainInfo: ChainRecord,
    mainWallet: KeplrEwalletWallet
  ) {
    super(walletInfo, chainInfo);
    this.mainWallet = mainWallet;
  }

  get address() {
    return this._accountData?.address;
  }

  get username() {
    return undefined;
  }

  connect = async (_sync?: boolean) => {
    try {
      this.setState(State.Pending);

      await this.mainWallet.init();
      await this.mainWallet.connect();

      if (!this.mainWallet.cosmosEWallet) {
        throw new Error("Cosmos ewallet not available");
      }

      // Get account information for this chain
      const chainId = this.chainRecord.chain?.chain_id;
      if (!chainId) {
        throw new Error("Chain ID not available");
      }

      const account = await this.mainWallet.cosmosEWallet.getKey(chainId);

      this._accountData = {
        address: account.bech32Address,
        algo: account.algo as any,
        pubkey: account.pubKey,
      };

      this.setState(State.Done);
    } catch (error) {
      this.setState(State.Error);
      throw error;
    }
  };

  async getAccount() {
    if (!this._accountData) {
      await this.connect();
    }
    return this._accountData;
  }

  async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc,
    signOptions?: SignOptions
  ): Promise<AminoSignResponse> {
    if (!this.mainWallet.cosmosEWallet) {
      throw new Error("Cosmos ewallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }
    return (await this.mainWallet.cosmosEWallet.signAmino(
      chainId,
      signerAddress,
      signDoc,
      signOptions
    )) as AminoSignResponse;
  }

  async signDirect(
    signerAddress: string,
    signDoc: DirectSignDoc,
    signOptions?: SignOptions
  ): Promise<DirectSignResponse> {
    if (!this.mainWallet.cosmosEWallet) {
      throw new Error("Cosmos ewallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }
    return (await this.mainWallet.cosmosEWallet.signDirect(
      chainId,
      signerAddress,
      signDoc as any,
      signOptions
    )) as DirectSignResponse;
  }

  async signArbitrary(
    signerAddress: string,
    data: string | Uint8Array
  ): Promise<any> {
    if (!this.mainWallet.cosmosEWallet) {
      throw new Error("Cosmos ewallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }
    return (await this.mainWallet.cosmosEWallet.signArbitrary(
      chainId,
      signerAddress,
      data
    )) as any;
  }

  async verifyArbitrary(
    signerAddress: string,
    data: string | Uint8Array,
    signature: any
  ): Promise<boolean> {
    if (!this.mainWallet.cosmosEWallet) {
      throw new Error("Cosmos ewallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }
    return (await this.mainWallet.cosmosEWallet.verifyArbitrary(
      chainId,
      signerAddress,
      data,
      signature
    )) as boolean;
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
