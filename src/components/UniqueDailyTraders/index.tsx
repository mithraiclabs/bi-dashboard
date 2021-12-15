import { useEffect, useState } from "react";
import { CanvasJSChart } from '../../utils/canvasjs-react-charts';
import { getAmountWithDecimal } from '../../utils/math';
import { request, gql } from 'graphql-request'
import { useDeriveMultipleSerumMarketAddresses } from "../../hooks/useDeriveMultipleSerumMarketAddresses ";
import { TOKENSBASE } from "../../models/token";

export const UniqueDailyTraders = ({optionMarkets}) => {
  const serumAddresses = useDeriveMultipleSerumMarketAddresses(optionMarkets);
  const [uniqueTraders, setUniqueTraders] = useState({});


  async function getUniqueTraders() {
    const keys = Object.keys(serumAddresses);
    let _24HRtotal = 0;
    let _24HRdataPoints: { label: string; y: number; }[] = [];
    let _7Dtotal = 0;
    let _7DdataPoints: { label: string; y: number; }[] = [];
    let poolList: string[] = [];
    
    for await (const key of keys) {
      poolList = poolList.concat(serumAddresses[key].map(key => '"' + key.toBase58() + '"'));
    }

    const query = gql`
    {
      dailyStats( markets: [
        ${poolList}
      ] )
      {
        au {
          au
          interval
        }
      }
    }
    `
    console.log(poolList);
    const data = await request('https://api.serum.markets/', query);
    console.log(data);

    let startDate = new Date();
    startDate.setDate(startDate.getDate()-30);
    let _30DayTraders: { label: string; y: number; }[] = [];
    
    for (let i = 0; i <= 30; i++) {
      _30DayTraders.push({label:startDate.toISOString().substring(0, 10) , y: 0});
      startDate.setDate(startDate.getDate() + 1);
    }
    data.dailyStats.au.forEach(val => {
      const dateString = val.interval.substring(0, 10);
      _30DayTraders.forEach(traders => {
        if (traders.label === dateString)
          traders.y = val.au;
      })
    });

    setUniqueTraders({
			title: {
				text: "Unique Daily Traders lasts 30 Days"
			},
			data: [
			{
				type: "column",
				dataPoints: _30DayTraders,
        color: 'rgb(0,185,197)',
        indexLabel: "{y}",
			}
			]
		});
  }

  useEffect(() => {
    getUniqueTraders();
  }, [serumAddresses]);

  return (
    <div>
      <div>
        <CanvasJSChart options = {uniqueTraders} />
      </div>
    </div>
  );
};
