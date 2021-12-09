import { Connection, PublicKey } from "@solana/web3.js";
import { TokenAccount } from "../models/account";
import { AccountLayout, u64, MintInfo, MintLayout } from "@solana/spl-token";

export const getAccountInfo = async (connection: Connection, pubKey: PublicKey) => {
  const info = await connection.getAccountInfo(pubKey);
  if (info === null) {
    throw new Error("Failed to find mint account");
  }

  const buffer = Buffer.from(info.data);

  const data = deserializeAccount(buffer);

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: data,
  } as TokenAccount;

  return details;
};

export const getMultipleAccountInfo = async (connection: Connection, pubKeys: PublicKey[]) => {
  const info = await connection.getMultipleAccountsInfo(pubKeys);
  if (info === null) {
    throw new Error("Failed to find mint account");
  }

  let array: TokenAccount[] = [];
  
  info.forEach(buf => {
    if (buf != null) {
      const buffer = Buffer.from(buf.data);

      const data = deserializeAccount(buffer);
    
      const details = {
        pubkey: pubKeys[info.indexOf(buf)],
        account: {
          ...buf,
        },
        info: data,
      } as TokenAccount;

      array.push(details);
    }
  });

  return array;
};


// TODO: expose in spl package
const deserializeAccount = (data: Buffer) => {
  const accountInfo = AccountLayout.decode(data);
  accountInfo.mint = new PublicKey(accountInfo.mint);
  accountInfo.owner = new PublicKey(accountInfo.owner);
  accountInfo.amount = u64.fromBuffer(accountInfo.amount);

  if (accountInfo.delegateOption === 0) {
    accountInfo.delegate = null;
    accountInfo.delegatedAmount = new u64(0);
  } else {
    accountInfo.delegate = new PublicKey(accountInfo.delegate);
    accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount);
  }

  accountInfo.isInitialized = accountInfo.state !== 0;
  accountInfo.isFrozen = accountInfo.state === 2;

  if (accountInfo.isNativeOption === 1) {
    accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative);
    accountInfo.isNative = true;
  } else {
    accountInfo.rentExemptReserve = null;
    accountInfo.isNative = false;
  }

  if (accountInfo.closeAuthorityOption === 0) {
    accountInfo.closeAuthority = null;
  } else {
    accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority);
  }

  return accountInfo;
};


export const getMintInfo = async (connection: Connection, pubKey: PublicKey) => {
  const info = await connection.getAccountInfo(pubKey);
  if (info === null) {
    throw new Error("Failed to find mint account");
  }

  const data = Buffer.from(info.data);

  return deserializeMint(data);
};

export const getMultipleMintInfo = async (connection: Connection, pubKeys: PublicKey[]) => {
  const info = await connection.getMultipleAccountsInfo(pubKeys);
  if (info === null) {
    throw new Error("Failed to find mint account");
  }

  return info.map(v => {
    if (v != null) {
      const data = Buffer.from(v.data);
      return deserializeMint(data);  
    } 
    return null;
  })
};


// TODO: expose in spl package
const deserializeMint = (data: Buffer) => {
  if (data.length !== MintLayout.span) {
    throw new Error("Not a valid Mint");
  }

  const mintInfo = MintLayout.decode(data);

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null;
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
  }

  mintInfo.supply = u64.fromBuffer(mintInfo.supply);
  mintInfo.isInitialized = mintInfo.isInitialized !== 0;

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null;
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
  }

  return mintInfo as MintInfo;
};
