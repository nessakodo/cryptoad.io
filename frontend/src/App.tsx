import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import TradingDashboard from './components/TradingDashboard';

function App() {
  return (
    <ChakraProvider>
      <TradingDashboard />
    </ChakraProvider>
  );
}

export default App;
