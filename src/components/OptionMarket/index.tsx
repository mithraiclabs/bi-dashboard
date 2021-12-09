import "./trade.less";
import { Provider, Program } from "@project-serum/anchor";
import { getAllOptionAccounts, PsyAmericanIdl } from "@mithraic-labs/psy-american";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { NodeWallet } from "@project-serum/anchor/dist/cjs/provider";
import { Table } from "antd";
import { getMultipleAccountInfo, getMultipleMintInfo } from "../../utils/accounts";
import { getPriceWithTokenAddress } from "../../utils/price";
import { CanvasJSChart } from '../../utils/canvasjs-react-charts';

const columns = [
  {
    title: "Underlying Asset Pool",
    key: "underlying_asset_pool",
    dataIndex: "underlying_asset_pool",
  },
  {
    title: "Underlying Asset Mint",
    key: "underlying_asset_mint",
    dataIndex: "underlying_asset_mint",
  },
  {
    title: "Quote Asset Pool",
    key: "quote_asset_pool",
    dataIndex: "quote_asset_pool",
  },
  {
    title: "Quote Asset Mint",
    key: "quote_asset_mint",
    dataIndex: "quote_asset_mint",
  },
]

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

  const [assetPoolsOption, setAssetPoolsOption] = useState({});

  async function getOptions() {
    // Load all the PsyOptions option markets
    const anchorProvider = new Provider(connection, new NodeWallet(new Keypair()), {});
    const program = new Program(PsyAmericanIdl, new PublicKey('R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs'), anchorProvider);
    const optionMarkets = await getAllOptionAccounts(program);

    let assetPoolList: poolByMint = {};
    let quotePoolList: poolByMint = {};

    optionMarkets.forEach(market => {
      if (assetPoolList[market.underlyingAssetMint.toBase58()]) {
        assetPoolList[market.underlyingAssetMint.toBase58()].push(market.underlyingAssetPool);
      } else {
        assetPoolList[market.underlyingAssetMint.toBase58()] = [market.underlyingAssetPool];
      }

      if (quotePoolList[market.quoteAssetMint.toBase58()]) {
        quotePoolList[market.quoteAssetMint.toBase58()].push(market.quoteAssetPool);
      } else {
        quotePoolList[market.quoteAssetMint.toBase58()] = [market.quoteAssetPool];
      }
    });

    
    // setAssetPoolList(assetPoolList);
    // setQuotePoolList(quotePoolList);

    let marketList = optionMarkets.map(market => {
      return {
        "underlying_asset_pool": market.underlyingAssetPool.toBase58(),
        "underlying_asset_mint": market.underlyingAssetMint.toBase58(),
        "quote_asset_pool": market.quoteAssetPool.toBase58(),
        "quote_asset_mint": market.quoteAssetMint.toBase58(),
      }
    })

    setMarketList(marketList);

    const keys = Object.keys(assetPoolList);
    const assetAmounts : amountByMint = {};

    const priceOfMint = await getPriceWithTokenAddress(keys);
    console.log(priceOfMint);

    const mints = await getMultipleMintInfo(connection, keys.map(key => new PublicKey(key)));
    console.log(mints);

    for await (const key of keys) {
      assetAmounts[key] = 0;
      const accList = await getMultipleAccountInfo(connection, assetPoolList[key]);
      accList.forEach(accInfo => {
        const mint = mints[keys.indexOf(key)];
        const pMint = priceOfMint.find((mint: { mint: string; }) => mint.mint === key);
        const price = pMint.price;
        if (mint) {
          let decimal = mint.decimals;
          let amount = accInfo.info.amount.toNumber();
          while (decimal > 0) {
            amount /= 10;
            decimal--;
          }

          assetAmounts[key] += amount * price;
        }
      });
      console.log(accList);
    };
    
    console.log(assetAmounts);

    let dataPoints: { label: string; y: number; }[] = [];

    keys.forEach(key => {
      dataPoints.push( {label: key, y: assetAmounts[key]});
    })

    let assetPoolsOption = {
      title: {
        text: "TVL of Asset Pools"
      },
      data: [
      {
        // Change type to "doughnut", "line", "splineArea", etc.
        type: "column",
        dataPoints: dataPoints
      }
      ]
    }

    setAssetPoolsOption(assetPoolsOption);
  }

  useEffect(() => {
    getOptions();
  }, []);

  

  return (
    <>
      <div>
        <Table columns={columns} dataSource={marketList} loading={false} />

        <CanvasJSChart options = {assetPoolsOption} />
      </div>
    </>
  );
};
