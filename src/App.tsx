import './App.less';
import { OptionMarket } from './components/OptionMarket';
import { ConnectionProvider } from '@solana/wallet-adapter-react';

function App() {
  
  return (
    <ConnectionProvider endpoint="http://127.0.0.1:8899">
    <div className="App">
      <OptionMarket/>
    </div>
    </ConnectionProvider>

  );
}

export default App;
