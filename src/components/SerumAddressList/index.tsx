import { useDeriveMultipleSerumMarketAddresses } from "../../hooks/useDeriveMultipleSerumMarketAddresses ";
import { TotalVolumes } from "../TotalVolumes";
import { UniqueDailyTraders } from "../UniqueDailyTraders";

export const SerumAddressList = ({optionMarkets}) => {
  const serumAddresses = useDeriveMultipleSerumMarketAddresses(optionMarkets);

  return (
    <div>
      <div>
        <TotalVolumes serumAddresses = {serumAddresses} />
      </div>
      <div>
        <UniqueDailyTraders serumAddresses = {serumAddresses} />
      </div>
    </div>
  );
};
