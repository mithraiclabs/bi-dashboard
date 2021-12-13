import './App.less';
import { OptionMarket } from './components/OptionMarket';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { RecoilRoot } from 'recoil';
import Store from './context/store'

function App() {
  
  return (
    <RecoilRoot>
      {/* <ConnectionProvider endpoint="http://127.0.0.1:8899"> */}
        <Store>
          <div className="App">
            <OptionMarket/>
          </div>
        </Store>
      {/* </ConnectionProvider> */}
    </RecoilRoot>

  );
}

export default App;
