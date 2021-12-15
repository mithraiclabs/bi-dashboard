import { useEffect, useState } from "react";
import { CanvasJSChart } from '../../utils/canvasjs-react-charts';
import { getAmountWithDecimal } from '../../utils/math';
import { request, gql } from 'graphql-request'
import { useDeriveMultipleSerumMarketAddresses, publicKeyByMints } from "../../hooks/useDeriveMultipleSerumMarketAddresses ";
import { TOKENSBASE } from "../../models/token";

export const TotalVolumes = ({connection, optionMarkets}) => {
  const serumAddresses = useDeriveMultipleSerumMarketAddresses(optionMarkets);
  const [totalVolume24HRData, setTotalVolume24HRData] = useState({});
  const [totalVolume7DData, setTotalVolume7DData] = useState({});


  const getTotalVolume = async () => {
    const keys = Object.keys(serumAddresses);
    let _24HRtotal = 0;
    let _24HRdataPoints: { label: string; y: number; }[] = [];
    let _7Dtotal = 0;
    let _7DdataPoints: { label: string; y: number; }[] = [];

    for await (const key of keys) {
      const poolList = serumAddresses[key].map(key => '"' + key.toBase58() + '"');
      const query = gql`
      {
        dailyStats( markets: [
          ${poolList}
        ] )
          {
          stats {
            au1h
            vol1hUsd
            au24h
            vol24hUsd
            au7d
            vol7dUsd
          }
        }
      }
      `
      console.log(poolList);
      const data = await request('https://api.serum.markets/', query);
      console.log(data);
  
      const tokenKeys = Object.keys(TOKENSBASE);
      let symbol = '';
      let decimals = 0;
      tokenKeys.forEach(tkey => {
        if (TOKENSBASE[tkey].mintAddress === key) {
          symbol = TOKENSBASE[tkey].symbol;
          decimals = TOKENSBASE[tkey].decimals;
        }
      });
      let _24HRamount = getAmountWithDecimal(Number.parseInt(data.dailyStats.stats.vol24hUsd), decimals);
      _24HRtotal += _24HRamount;
      _24HRdataPoints.push( {label: symbol, y: Math.round(_24HRamount)});

      let _7Damount = getAmountWithDecimal(Number.parseInt(data.dailyStats.stats.vol7dUsd), decimals);
      _7Dtotal += _7Damount;
      _7DdataPoints.push( {label: symbol, y: Math.round(_7Damount)});
    };

    setTotalVolume24HRData({
      title: {
        text: "24H Total Volume"
      },
      subtitles: [{
				text: "Total: $" + Math.round(_24HRtotal).toLocaleString(),
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
        dataPoints: _24HRdataPoints
      }
      ]
    });

    setTotalVolume7DData({
      title: {
        text: "7D Total Volume"
      },
      subtitles: [{
				text: "Total: $" + Math.round(_7Dtotal).toLocaleString(),
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
        dataPoints: _7DdataPoints
      }
      ]
    });
  }

  useEffect(() => {
    getTotalVolume();
  }, [serumAddresses]);

  return (
    <div>
      <div>
        <span></span>
        <CanvasJSChart options = {totalVolume24HRData} />
      </div>
      <div>
        <span></span>
        <CanvasJSChart options = {totalVolume7DData} />
      </div>
    </div>
  );
};
