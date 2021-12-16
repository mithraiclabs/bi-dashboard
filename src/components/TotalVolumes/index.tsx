import { useEffect, useState } from "react";
import { CanvasJSChart } from '../../utils/canvasjs-react-charts';
import { getAmountWithDecimal } from '../../utils/math';
import { request, gql } from 'graphql-request'
import { TOKENSBASE } from "../../models/token";

export const TotalVolumes = ({serumAddresses}) => {
  const [totalVolume24HRData, setTotalVolume24HRData] = useState({});
  const [totalVolume7DData, setTotalVolume7DData] = useState({});

  useEffect(() => {
    const keys = Object.keys(serumAddresses);
    let total24HR = 0;
    let dataPoints24HR: { label: string; y: number; }[] = [];
    let Total7D = 0;
    let dataPoints7D: { label: string; y: number; }[] = [];

    (async () => {
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
        const serumData = await request('https://api.serum.markets/', query);
    
        const tokenKeys = Object.keys(TOKENSBASE);
        let symbol = '';
        let decimals = 0;
        tokenKeys.forEach(tkey => {
          if (TOKENSBASE[tkey].mintAddress === key) {
            symbol = TOKENSBASE[tkey].symbol;
            decimals = TOKENSBASE[tkey].decimals;
          }
        });
        let _24HRamount = getAmountWithDecimal(Number.parseInt(serumData.dailyStats.stats.vol24hUsd), decimals);
        total24HR += _24HRamount;
        dataPoints24HR.push( {label: symbol, y: Math.round(_24HRamount)});

        let _7Damount = getAmountWithDecimal(Number.parseInt(serumData.dailyStats.stats.vol7dUsd), decimals);
        Total7D += _7Damount;
        dataPoints7D.push( {label: symbol, y: Math.round(_7Damount)});
      };

      setTotalVolume24HRData({
        title: {
          text: "24H Total Volume"
        },
        subtitles: [{
          text: "Total: $" + Math.round(total24HR).toLocaleString(),
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
          dataPoints: dataPoints24HR
        }
        ]
      });

      setTotalVolume7DData({
        title: {
          text: "7D Total Volume"
        },
        subtitles: [{
          text: "Total: $" + Math.round(Total7D).toLocaleString(),
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
          dataPoints: dataPoints7D
        }
        ]
      });
    })();
  }, [serumAddresses]);

  return (
    <div>
      <div>
        {Object.keys(totalVolume24HRData).length && <CanvasJSChart options={totalVolume24HRData} />}
      </div>
      <div>
        {Object.keys(totalVolume7DData).length && <CanvasJSChart options={totalVolume7DData} />}
      </div>
    </div>
  );
};

