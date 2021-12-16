import { useEffect, useState } from "react";
import { CanvasJSChart } from '../../utils/canvasjs-react-charts';
import { request, gql } from 'graphql-request'

export const UniqueDailyTraders = ({serumAddresses}) => {
  const [uniqueTraders, setUniqueTraders] = useState({});

  useEffect(() => {
    const keys = Object.keys(serumAddresses);
    let addressList: string[] = [];
    
    (async () => {
      for await (const key of keys) {
        addressList = addressList.concat(serumAddresses[key].map(key => '"' + key.toBase58() + '"'));
      }

      const query = gql`
      {
        dailyStats( markets: [
          ${addressList}
        ] )
        {
          au {
            au
            interval
          }
        }
      }
      `
      const data = await request('https://api.serum.markets/', query);

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
    })();
  }, [serumAddresses]);

  return (
    <div id='uniqueTraders'>
      {Object.keys(uniqueTraders).length && <CanvasJSChart options = {uniqueTraders} />}
    </div>
  );
};
