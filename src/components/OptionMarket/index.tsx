import "./trade.less";
import { Provider, Program } from "@project-serum/anchor";
import { getAllOptionAccounts, PsyAmericanIdl } from "@mithraic-labs/psy-american";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";
import { getMultipleAccountInfo, getMultipleMintInfo } from "../../utils/accounts";
import { getPriceWithTokenAddress } from "../../utils/price";
import { CanvasJSChart } from '../../utils/canvasjs-react-charts';
import { getAmountWithDecimal } from '../../utils/math';
import { TOKENSBASE } from "../../models/token";
import { request, gql } from 'graphql-request'


interface poolByMint {
  [id: string]: PublicKey[]
}

interface amountByMint {
  [id: string]: number
}

export const OptionMarket = () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");

  const [tvlAssetPoolsOption, setTVLAssetPoolsOption] = useState({});
  const [tvl24HAssetPoolsOption, setTVL24HAssetPoolsOption] = useState({});


  async function getOptions() {
    // Load all the PsyOptions option markets
    const anchorProvider = new Provider(connection, new NodeWallet(new Keypair()), {});
    const program = new Program(PsyAmericanIdl, new PublicKey('R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs'), anchorProvider);
    const optionMarkets = await getAllOptionAccounts(program);

    let assetPoolList: poolByMint = {};

    const keys: string[] = [];
    const poolList: PublicKey[] = [];


    optionMarkets.forEach(market => {
      if (!assetPoolList[market.underlyingAssetMint.toBase58()]) {
        assetPoolList[market.underlyingAssetMint.toBase58()] = [];
      }
      if (!assetPoolList[market.quoteAssetMint.toBase58()]) {
        assetPoolList[market.quoteAssetMint.toBase58()] = [];
      }

      if (assetPoolList[market.underlyingAssetMint.toBase58()]) {
        assetPoolList[market.underlyingAssetMint.toBase58()].push(market.underlyingAssetPool);
        poolList.push(market.underlyingAssetPool);
      }

      if (assetPoolList[market.quoteAssetMint.toBase58()]) {
        assetPoolList[market.quoteAssetMint.toBase58()].push(market.quoteAssetPool);
        poolList.push(market.quoteAssetPool);
      }

      if (keys.indexOf(market.underlyingAssetMint.toBase58()) < 0)
        keys.push(market.underlyingAssetMint.toBase58());
      if (keys.indexOf(market.quoteAssetMint.toBase58()) < 0)
        keys.push(market.underlyingAssetMint.toBase58());
    });


    console.log(optionMarkets);

    const priceOfMint = await getPriceWithTokenAddress(keys);

    const mints = await getMultipleMintInfo(connection, keys.map(key => new PublicKey(key)));

    const accountList = await getMultipleAccountInfo(connection, poolList);

    get24HRTotalVolume(assetPoolList);
    drawUnderlyingPool(accountList, assetPoolList, priceOfMint, mints);
  }

  async function drawUnderlyingPool(accountList: any[], assetPoolList: poolByMint, priceOfMint: any[], mintList: any[]) {
    const keys = Object.keys(assetPoolList);
    const assetAmounts : amountByMint = {};

    for await (const key of keys) {
      assetAmounts[key] = 0;
      accountList.forEach(accInfo => {
        if (assetPoolList[key].indexOf(accInfo.pubkey) >= 0) {
          const mint = mintList.find((mint) => mint && mint.key === key);
          const pMint = priceOfMint.find((mint: { mint: string; }) => mint.mint === key);
          const price = pMint ? pMint.price : 0;
          if (mint) {
            let decimal = mint.data.decimals;
            let amount = accInfo.info.amount.toNumber();
            assetAmounts[key] += getAmountWithDecimal(amount, decimal) * price;
          }
        }
      });
    };
    
    let dataPoints: { label: string; y: number; }[] = [];

    let total = 0;
    keys.forEach(key => {
      const tokenKeys = Object.keys(TOKENSBASE);
      let symbol = '';
      tokenKeys.forEach(tkey => {
        if (TOKENSBASE[tkey].mintAddress === key)
          symbol = TOKENSBASE[tkey].symbol;
      });

      dataPoints.push( {label: symbol, y: Math.round(assetAmounts[key])});
      total += assetAmounts[key];
    })

    setTVLAssetPoolsOption({
      title: {
        text: "TVL of Asset Pools"
      },
      subtitles: [{
				text: "Total: $" + Math.round(total).toLocaleString(),
				verticalAlign: "center",
				fontSize: 16,
				dockInsidePlotArea: true
			}],
      data: [
      {
        type: "doughnut",
        showInLegend: "true",
				toolTipContent: "{label}: <strong>'$'{y}</strong>",
				legendText: "{label}",
        indexLabel: "'$'{y}",
        dataPoints: dataPoints
      }
      ]
    });
  }

  async function get24HRTotalVolume(assetPoolList: poolByMint) {
    const keys = Object.keys(assetPoolList);
    const poolList = keys.map(key => '"' + key + '"');
    
    const query = gql`
      {
        tokensStats(addresses: [
         ${poolList}
       ]) {
         info {
           address
           symbol
           decimals
         }
         priceUsd
         vol24hUsd
         vol7dUsd
         tvlUsd
         supply
         marketCapUsd
       }
       }
    `
    const data = await request('https://api.serum.markets/', query);
    console.log(data);

    let total = 0;
    let dataPoints: { label: string; y: number; }[] = [];

    data.tokensStats.forEach((token: { info: { decimals: any; symbol: any; }; vol24hUsd: any; }) => {
      const decimal = token.info.decimals;
      const amount = getAmountWithDecimal(Number(token.vol24hUsd), decimal);
      dataPoints.push( {label: token.info.symbol, y: Math.round(amount)});
      total += amount;
    })

    setTVL24HAssetPoolsOption({
      title: {
        text: "24H Total Volume"
      },
      subtitles: [{
				text: "Total: $" + Math.round(total).toLocaleString(),
				verticalAlign: "center",
				fontSize: 16,
				dockInsidePlotArea: true
			}],
      data: [
      {
        type: "doughnut",
        showInLegend: "true",
				toolTipContent: "{label}: <strong>'$'{y}</strong>",
				legendText: "{label}",
        indexLabel: "'$'{y}",
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
          <CanvasJSChart options = {tvlAssetPoolsOption} />
        </div>

        <div>
          <CanvasJSChart options = {tvl24HAssetPoolsOption} />
        </div>
      </div>
    </>
  );
};
