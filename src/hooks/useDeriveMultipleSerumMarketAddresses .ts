import { activeNetwork } from '../recoil';
import { serumUtils, OptionMarketWithKey } from '@mithraic-labs/psy-american';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useAmericanPsyOptionsProgram } from './useAmericanPsyOptionsProgram';
import { getSupportedMarketsByNetwork } from '../utils/networkInfo';
import { publicKeyByMints, marketByMint } from '../models/groupInterfaces';


export const useDeriveMultipleSerumMarketAddresses = (
  options: OptionMarketWithKey[]
): [publicKeyByMints, publicKeyByMints] => {
  const network: any = useRecoilValue(activeNetwork);
  const [serumMarketKeysPuts, setSerumMarketKeysPuts] = useState<publicKeyByMints>({});
  const [serumMarketKeysCalls, setSerumMarketKeysCalls] = useState<publicKeyByMints>({});
  const program = useAmericanPsyOptionsProgram();

  useEffect(() => {
    if (!program) {
      return;
    }
    const marketMetaOptions = getSupportedMarketsByNetwork(network.name);
    let serumMarketKeysPuts : publicKeyByMints = {};
    let serumMarketKeysCalls : publicKeyByMints = {};

    (async () => {
      let marketListByQuote: marketByMint = {};
      let marketListByUnderlying: marketByMint = {};

      const keys: string[] = [];
      options.forEach(market => {
        if (!marketListByQuote[market.underlyingAssetMint.toBase58()]) {
          marketListByQuote[market.underlyingAssetMint.toBase58()] = [];
        }
        if (!marketListByQuote[market.quoteAssetMint.toBase58()]) {
          marketListByQuote[market.quoteAssetMint.toBase58()] = [];
        }
        if (!marketListByUnderlying[market.underlyingAssetMint.toBase58()]) {
          marketListByUnderlying[market.underlyingAssetMint.toBase58()] = [];
        }
        if (!marketListByUnderlying[market.quoteAssetMint.toBase58()]) {
          marketListByUnderlying[market.quoteAssetMint.toBase58()] = [];
        }
  
        if (marketListByQuote[market.underlyingAssetMint.toBase58()]) {
          marketListByQuote[market.underlyingAssetMint.toBase58()].push(market);
        }
  
        if (marketListByUnderlying[market.quoteAssetMint.toBase58()]) {
          marketListByUnderlying[market.quoteAssetMint.toBase58()].push(market);
        }
  
        if (keys.indexOf(market.underlyingAssetMint.toBase58()) < 0)
          keys.push(market.underlyingAssetMint.toBase58());
        if (keys.indexOf(market.quoteAssetMint.toBase58()) < 0)
          keys.push(market.underlyingAssetMint.toBase58());
      });

      for await (const key of keys) {
        serumMarketKeysCalls[key] = await Promise.all(marketListByUnderlying[key].map(async (option) => {
          // Check if the option exists in the market meta package first. This is for backwards
          // compatibility and could eventually be removed when the market meta package is no
          // longer needed.
          const serumMarketAddress = marketMetaOptions.find(
            (optionMarketWithKey) =>
              optionMarketWithKey.optionMarketAddress === option.key.toString(),
          )?.serumMarketAddress;
          if (serumMarketAddress) {
            return new PublicKey(serumMarketAddress);
          }
          const [address] = await serumUtils.deriveSerumMarketAddress(
            program,
            option.key,
            new PublicKey(key),
          );
          return address;
        }));

        serumMarketKeysPuts[key] = await Promise.all(marketListByQuote[key].map(async (option) => {
          // Check if the option exists in the market meta package first. This is for backwards
          // compatibility and could eventually be removed when the market meta package is no
          // longer needed.
          const serumMarketAddress = marketMetaOptions.find(
            (optionMarketWithKey) =>
              optionMarketWithKey.optionMarketAddress === option.key.toString(),
          )?.serumMarketAddress;
          if (serumMarketAddress) {
            return new PublicKey(serumMarketAddress);
          }
          const [address] = await serumUtils.deriveSerumMarketAddress(
            program,
            option.key,
            new PublicKey(key),
          );
          return address;
        }));
      };

      setSerumMarketKeysPuts(serumMarketKeysPuts);
      setSerumMarketKeysCalls(serumMarketKeysCalls);
    })();
  }, [options, program, network]);

  return [serumMarketKeysPuts, serumMarketKeysCalls];
};