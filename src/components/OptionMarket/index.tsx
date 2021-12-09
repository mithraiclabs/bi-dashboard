import "./trade.less";
import { Provider, Program } from "@project-serum/anchor";
import { getAllOptionAccounts, PsyAmericanIdl } from "@mithraic-labs/psy-american";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";
import { getMultipleAccountInfo, getMultipleMintInfo } from "../../utils/accounts";
import { getPriceWithTokenAddress } from "../../utils/price";
import { CanvasJSChart } from '../../utils/canvasjs-react-charts';
import { MintInfo } from "@solana/spl-token";
import { TokenAccount } from "../../models/account";

interface poolByMint {
  [id: string]: PublicKey[]
}

interface amountByMint {
  [id: string]: number
}

export const OptionMarket = () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const [marketList, setMarketList] = useState<{
    underlying_asset_pool: string;
    underlying_asset_mint: string;
    quote_asset_pool: string;
    quote_asset_mint: string;
  }[]>([]);

  const [underlyingPoolsOption, setUnderlyingPoolsOption] = useState({});
  const [quotePoolsOption, setQuotePoolsOption] = useState({});

  const [underlyingPoolList, setUnderlyingPoolList] = useState<poolByMint>({});
  const [quotePoolList, setQuotePoolList] = useState<poolByMint>({});

  const [priceOfMint, setPriceOfMint] = useState<{mint:string,price:number}[]>([]);
  const [mintList, setMintList] = useState<({key: string, data: MintInfo}| null)[]>([]);
  const [accountList, setAccountList] = useState<TokenAccount[]>([]);


  async function getOptions() {
    // Load all the PsyOptions option markets
    const anchorProvider = new Provider(connection, new NodeWallet(new Keypair()), {});
    const program = new Program(PsyAmericanIdl, new PublicKey('R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs'), anchorProvider);
    const optionMarkets = await getAllOptionAccounts(program);

    let underlyingPoolList: poolByMint = {};
    let quotePoolList: poolByMint = {};

    const keys: string[] = [];
    const poolList: PublicKey[] = [];


    optionMarkets.forEach(market => {
      if (!underlyingPoolList[market.underlyingAssetMint.toBase58()]) {
        underlyingPoolList[market.underlyingAssetMint.toBase58()] = [];
      }
      if (!underlyingPoolList[market.quoteAssetMint.toBase58()]) {
        underlyingPoolList[market.quoteAssetMint.toBase58()] = [];
      }
      if (!quotePoolList[market.underlyingAssetMint.toBase58()]) {
        quotePoolList[market.underlyingAssetMint.toBase58()] = [];
      }
      if (!quotePoolList[market.quoteAssetMint.toBase58()]) {
        quotePoolList[market.quoteAssetMint.toBase58()] = [];
      }

      if (underlyingPoolList[market.underlyingAssetMint.toBase58()]) {
        underlyingPoolList[market.underlyingAssetMint.toBase58()].push(market.underlyingAssetPool);
        poolList.push(market.underlyingAssetPool);
      }

      if (quotePoolList[market.quoteAssetMint.toBase58()]) {
        quotePoolList[market.quoteAssetMint.toBase58()].push(market.quoteAssetPool);
        poolList.push(market.quoteAssetPool);
      }

      if (keys.indexOf(market.underlyingAssetMint.toBase58()) < 0)
        keys.push(market.underlyingAssetMint.toBase58());
      if (keys.indexOf(market.quoteAssetMint.toBase58()) < 0)
        keys.push(market.underlyingAssetMint.toBase58());
    });

    setMarketList(marketList);
    setUnderlyingPoolList(underlyingPoolList);
    setQuotePoolList(quotePoolList);

    const priceOfMint = await getPriceWithTokenAddress(keys);
    setPriceOfMint(priceOfMint);

    const mints = await getMultipleMintInfo(connection, keys.map(key => new PublicKey(key)));
    setMintList(mints);

    const accountList = await getMultipleAccountInfo(connection, poolList);
    setAccountList(accountList);

    drawUnderlyingPool();
    drawQuotePool();
  }

  async function drawUnderlyingPool() {
    const keys = Object.keys(underlyingPoolList);
    const underlyingAssetAmounts : amountByMint = {};

    // const mints = await getMultipleMintInfo(connection, keys.map(key => new PublicKey(key)));

    for await (const key of keys) {
      underlyingAssetAmounts[key] = 0;
      accountList.forEach(accInfo => {
        if (underlyingPoolList[key].indexOf(accInfo.pubkey) >= 0) {
          const mint = mintList.find((mint) => mint && mint.key === key);
          const pMint = priceOfMint.find((mint: { mint: string; }) => mint.mint === key);
          const price = pMint ? pMint.price : 0;
          if (mint) {
            let decimal = mint.data.decimals;
            let amount = accInfo.info.amount.toNumber();
            while (decimal > 0) {
              amount /= 10;
              decimal--;
            }

            underlyingAssetAmounts[key] += amount * price;
          }
        }
      });
    };
    
    let dataPoints: { label: string; y: number; }[] = [];

    keys.forEach(key => {
      dataPoints.push( {label: key, y: underlyingAssetAmounts[key]});
    })

    setUnderlyingPoolsOption({
      title: {
        text: "TVL of Underlying Asset Pools"
      },
      data: [
      {
        type: "column",
        indexLabel: "{y}",
        dataPoints: dataPoints
      }
      ]
    });
  }

  async function drawQuotePool() {
    const keys = Object.keys(quotePoolList);
    const quoteAssetAmounts : amountByMint = {};

    for await (const key of keys) {
      quoteAssetAmounts[key] = 0;
      accountList.forEach(accInfo => {
        if (quotePoolList[key].indexOf(accInfo.pubkey) >= 0) {
          const mint = mintList.find((mint) => mint && mint.key === key);
          const pMint = priceOfMint.find((mint: { mint: string; }) => mint.mint === key);
          const price = pMint ? pMint.price : 0;
          if (mint) {
            let decimal = mint.data.decimals;
            let amount = accInfo.info.amount.toNumber();
            while (decimal > 0) {
              amount /= 10;
              decimal--;
            }

            quoteAssetAmounts[key] += amount * price;
          }
        }
      });
    };
    

    let dataPoints: { label: string; y: number; }[] = [];

    keys.forEach(key => {
      dataPoints.push( {label: key, y: quoteAssetAmounts[key]});
    });

    setQuotePoolsOption({
      title: {
        text: "TVL of Quote Asset Pools"
      },
      data: [
      {
        type: "column",
        indexLabel: "{y}",
        dataPoints: dataPoints
      }
      ]
    });
  }

  useEffect(() => {
    getOptions();
  }, []);

  return (
    <>
      <div>
        <div>
        <CanvasJSChart options = {underlyingPoolsOption} />
        </div>
        <div>
        <CanvasJSChart options = {quotePoolsOption} />
        </div>
      </div>
    </>
  );
};
