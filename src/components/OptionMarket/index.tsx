import { Provider, Program } from "@project-serum/anchor";
import { getAllOptionAccounts, OptionMarketWithKey, PsyAmericanIdl } from "@mithraic-labs/psy-american";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";
import { TVL } from "../TVL";
import { TotalVolumes } from "../TotalVolumes";

export const OptionMarket = () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");

  const [optionMarkets, setOptionMarkets] = useState<OptionMarketWithKey[]>([]);

  const anchorProvider = new Provider(connection, new NodeWallet(new Keypair()), {});
  const program = new Program(PsyAmericanIdl, new PublicKey('R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs'), anchorProvider);

  async function getOptions() {
    const optionMarkets = await getAllOptionAccounts(program);
    setOptionMarkets(optionMarkets);
  };

  useEffect(() => {
    getOptions();
  }, []);

  return (
    <>
      <div>
        {optionMarkets.length > 0 ? <TVL connection={connection} optionMarkets={optionMarkets} /> : ""}
        {optionMarkets.length > 0 ? <TotalVolumes connection={connection} optionMarkets={optionMarkets} /> : ""}
        
      </div>
    </>
  );
};
