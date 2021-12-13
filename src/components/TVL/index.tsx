import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { getMultipleAccountInfo, getMultipleMintInfo } from "../../utils/accounts";
import { getPriceWithTokenAddress } from "../../utils/price";
import { CanvasJSChart } from '../../utils/canvasjs-react-charts';
import { getAmountWithDecimal } from '../../utils/math';
import { TOKENSBASE } from "../../models/token";

interface poolByMint {
  [id: string]: PublicKey[]
}

interface amountByMint {
  [id: string]: number
}

export const TVL = ({connection, optionMarkets}) => {
  const [tvlAssetPoolsOption, setTVLAssetPoolsOption] = useState({});


  async function getOptions() {
    // Load all the PsyOptions option markets

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

  useEffect(() => {
    getOptions();
  }, []);

  return (
    <>
      <div>
        <div>
          <CanvasJSChart options = {tvlAssetPoolsOption} />
        </div>
      </div>
    </>
  );
};
