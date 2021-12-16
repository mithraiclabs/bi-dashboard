import { PublicKey } from "@solana/web3.js";
import { OptionMarketWithKey } from '@mithraic-labs/psy-american';

export interface poolByMint {
  [id: string]: PublicKey[]
}

export interface amountByMint {
  [id: string]: number
}

export interface marketByMint {
  [id: string]: OptionMarketWithKey[]
}

export interface publicKeyByMints {
  [id: string]: PublicKey[]
}
