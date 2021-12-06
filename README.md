# bi-dashboard

The Business Inteligence Dashboard is designed to give anyone a broad overview of how the
PsyOptions ecosystem is doing. It is an analytics dashboard that will be opened to the 
public.

Basic project requirements can be found [here](https://complex-sphere-9b0.notion.site/PsyOptions-Intelligence-Dashboard-62cf2e81f8184171b3d33e8fc746495d).

Currently this project is scope out to be just a front end leveraging the few 
[Data Sources](#data-sources) listed below. If it is required, maybe there is a need for a custom
data source that is indexing other data. E.g. if it was desired to store TVL over time, then there
might be a need for a new data store. 

## Data Sources
* Aleph GraphQL API ([GraphiQL Instance](https://api.serum.markets/))
    * Aleph indexes Serum order book and trade data. Market based information can be gathered 
    from this API.
* Solana on-chain data
    * Some at the moment data, like TVL, can be read from the Solana block chain
    * [Solana web3 TS library](https://solana-labs.github.io/solana-web3.js/) | [PsyOptions TS Client](https://docs.psyoptions.io/javascript-api/)

### Contributing
V1 is under active development. You can find the project and relevant tasks 
[here](https://github.com/mithraiclabs/bi-dashboard/projects/1). 

#### If you wish to tackle a task
1. Assign it to yourself, so it is clear someone is working on it
2. 
