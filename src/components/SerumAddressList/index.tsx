import { useDeriveMultipleSerumMarketAddresses } from "../../hooks/useDeriveMultipleSerumMarketAddresses ";
import { TotalVolumes } from "../TotalVolumes";
import { UniqueDailyTraders } from "../UniqueDailyTraders";

export const SerumAddressList = ({optionMarkets}) => {
  const [serumAddressesPuts, serumAddressesCalls] = useDeriveMultipleSerumMarketAddresses(optionMarkets);

  return (
    <div>
      <div>
        <TotalVolumes serumAddressesPuts={serumAddressesPuts} serumAddressesCalls={serumAddressesCalls} />
      </div>
      <div>
        <UniqueDailyTraders serumAddressesPuts={serumAddressesPuts} serumAddressesCalls={serumAddressesCalls}  />
      </div>
    </div>
  );
};
