import { getSolflareWallet, getSolletWallet } from '@solana/wallet-adapter-wallets';
import { getPhantomWallet, getSlopeWallet } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';
import './App.less';
import { OptionMarket } from './components/OptionMarket';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';

function App() {
  // const network = useRecoilValue(atomNetwork);

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getSlopeWallet(),
      getSolletWallet(),
    ], []
  );
  
  return (
    <ConnectionProvider endpoint="http://127.0.0.1:8899">
    <WalletProvider autoConnect wallets={wallets}>

    <div className="App">
      <OptionMarket/>
    </div>
    </WalletProvider>
    </ConnectionProvider>

  );
}

export default App;
