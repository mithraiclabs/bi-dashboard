import { useEffect, useState } from "react";
import { CanvasJSChart } from '../../utils/canvasjs-react-charts';
import { getAmountWithDecimal } from '../../utils/math';
import { request, gql } from 'graphql-request'
import { useDeriveMultipleSerumMarketAddresses } from "../../hooks/useDeriveMultipleSerumMarketAddresses ";

export const TotalVolumes = ({connection, optionMarkets}) => {
  const serumAddresses = useDeriveMultipleSerumMarketAddresses(optionMarkets);
  const [totalVolume24HRData, setTotalVolume24HRData] = useState({});


  async function get24HRTotalVolume() {
    const poolList = serumAddresses.map(key => '"' + key.toBase58() + '"');
    console.log(serumAddresses);
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
    console.log(query);
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

    setTotalVolume24HRData({
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
    get24HRTotalVolume();
  }, []);

  return (
      <div>
        <CanvasJSChart options = {totalVolume24HRData} />
      </div>
  );
};
