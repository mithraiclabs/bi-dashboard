import { Provider, Program } from "@project-serum/anchor";
import { getAllOptionAccounts, OptionMarketWithKey, PsyAmericanIdl } from "@mithraic-labs/psy-american";
import { clusterApiUrl, Connection, Keypair, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";
import { TVL } from "../TVL";
import { SerumAddressList } from "../SerumAddressList";

export const OptionMarket = () => {
  const [optionMarkets, setOptionMarkets] = useState<OptionMarketWithKey[]>([]);

  useEffect(() => {
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    const anchorProvider = new Provider(connection, new NodeWallet(new Keypair()), {});
    const program = new Program(PsyAmericanIdl, new PublicKey(process.env.REACT_APP_MAINNET_PROGRAM_ID || ''), anchorProvider);

    (async() => {
      setOptionMarkets(await getAllOptionAccounts(program));
    })();
  }, []);

  return (
    <>
      {optionMarkets.length &&
        <div>
          <TVL optionMarkets={optionMarkets} /> 
          <SerumAddressList optionMarkets={optionMarkets} />
        </div>}
    </>
  );
};
