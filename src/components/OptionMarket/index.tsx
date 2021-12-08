import { Provider, Program } from "@project-serum/anchor";
import { PsyAmericanIdl } from "@mithraic-labs/psy-american";
import { Connection, PublicKey } from "@solana/web3.js";
import { useEffect } from "react";
import { useWallet } from "../../utils/wallet";
import { getAllOptionAccounts } from "../../package/OptionMarket";
import { Button, Popover } from "antd";
import { PoolAccounts } from "../pool/view";
import { AccountInfo } from "../accountInfo";
import { Settings } from "../settings";
import { SettingOutlined } from "@ant-design/icons";

export const OptionMarket = () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const { connected, wallet } = useWallet();


  async function getOptions() {
    // Load all the PsyOptions option markets
    const anchorProvider = new Provider(connection, wallet, {});
    const program = new Program(PsyAmericanIdl, new PublicKey('R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs'), anchorProvider);
    const optionMarkets = await getAllOptionAccounts(program);

    console.log(optionMarkets);
  }

  useEffect(() => {
    if (connected) {
      getOptions();
    }
  });

  return (
    <>
      <div>
       <div className="App-Bar-right">
        <AccountInfo />
        {connected && (
          <Popover
            placement="bottomRight"
            content={<PoolAccounts />}
            trigger="click"
          >
            <Button type="text">My Pools</Button>
          </Popover>
        )}
        <div>
          {!connected && (
            <Button
              type="text"
              size="large"
              onClick={connected ? wallet.disconnect : wallet.connect}
              style={{ color: "#2abdd2" }}
            >
              Connect
            </Button>
          )}
          {connected && (
            <Popover
              placement="bottomRight"
              title="Wallet public key"
              trigger="click"
            ></Popover>
          )}
        </div>
        {
          <Popover
            placement="topRight"
            title="Settings"
            content={<Settings />}
            trigger="click"
          >
            <Button
              shape="circle"
              size="large"
              type="text"
              icon={<SettingOutlined />}
            />
          </Popover>
        }
        </div>
      </div>
    </>
  );
};
