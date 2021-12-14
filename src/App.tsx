import './App.less';
import { OptionMarket } from './components/OptionMarket';
import { RecoilRoot } from 'recoil';
import Store from './context/store'

function App() {
  
  return (
    <RecoilRoot>
      <Store>
        <div className="App">
          <OptionMarket/>
        </div>
      </Store>
    </RecoilRoot>

  );
}

export default App;
