import { DynamicContextProvider, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import Home from './Home';

const App = () => {
  return ( 
    <DynamicContextProvider 
      settings={{ 
        environmentId: 'YOUR_ENVIRONMENT_ID',
        walletConnectors: [ EthereumWalletConnectors ],
      }}> 
      <DynamicWidget />
      <Home />
    </DynamicContextProvider> 
  )
};

export default App;
