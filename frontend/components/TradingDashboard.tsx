import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {
  Box,
  Flex,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Container,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue
} from '@chakra-ui/react';

interface Opportunity {
  timestamp: string;
  base_coin?: string;
  correlated_coin?: string;
  correlation?: number;
  pair?: string;
  sell_exchange?: string;
  buy_exchange?: string;
  expected_profit?: number;
}

const TradingDashboard = () => {
  const [similarityData, setSimilarityData] = useState<Opportunity[]>([]);
  const [arbitrageData, setArbitrageData] = useState<Opportunity[]>([]);
  const [activeBot, setActiveBot] = useState<'similarity' | 'arbitrage'>('similarity');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchBotData = async () => {
    try {
      const simResponse = await fetch('http://localhost:8000/api/similarity/opportunities');
      const arbResponse = await fetch('http://localhost:8000/api/arbitrage/opportunities');
      
      const simData = await simResponse.json();
      const arbData = await arbResponse.json();
      
      setSimilarityData(simData);
      setArbitrageData(arbData);
    } catch (error) {
      console.error('Error fetching bot data:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchBotData, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculateStats = () => {
    const data = activeBot === 'similarity' ? similarityData : arbitrageData;
    const values = data.map(d => activeBot === 'similarity' ? d.correlation! : d.expected_profit!);
    
    return {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      min: Math.min(...values)
    };
  };

  const stats = calculateStats();

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold">CryptoSynth Dashboard</Text>
          <HStack spacing={4}>
            <Badge 
              colorScheme={activeBot === 'similarity' ? 'green' : 'gray'}
              cursor="pointer"
              onClick={() => setActiveBot('similarity')}
              p={2}
              borderRadius="md"
            >
              Similarity Bot
            </Badge>
            <Badge 
              colorScheme={activeBot === 'arbitrage' ? 'green' : 'gray'}
              cursor="pointer"
              onClick={() => setActiveBot('arbitrage')}
              p={2}
              borderRadius="md"
            >
              Arbitrage Bot
            </Badge>
          </HStack>
        </Flex>

        <Flex gap={6}>
          <Stat bg={bgColor} p={4} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
            <StatLabel>Average {activeBot === 'similarity' ? 'Correlation' : 'Profit'}</StatLabel>
            <StatNumber>{(stats.average * 100).toFixed(2)}%</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              Last 24h
            </StatHelpText>
          </Stat>
          <Stat bg={bgColor} p={4} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
            <StatLabel>Maximum {activeBot === 'similarity' ? 'Correlation' : 'Profit'}</StatLabel>
            <StatNumber>{(stats.max * 100).toFixed(2)}%</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              All-time
            </StatHelpText>
          </Stat>
        </Flex>

        <Box bg={bgColor} p={4} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" mb={4}>Performance Metrics</Text>
          <LineChart width={600} height={300} data={activeBot === 'similarity' ? similarityData : arbitrageData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={activeBot === 'similarity' ? 'correlation' : 'expected_profit'} 
              stroke="#8884d8" 
            />
          </LineChart>
        </Box>

        <Box bg={bgColor} borderRadius="lg" borderWidth={1} borderColor={borderColor}>
          <Text fontSize="lg" p={4} borderBottomWidth={1} borderColor={borderColor}>
            Trading Opportunities
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                {activeBot === 'similarity' ? (
                  <>
                    <Th>Base Coin</Th>
                    <Th>Correlated Coin</Th>
                    <Th>Correlation</Th>
                  </>
                ) : (
                  <>
                    <Th>Pair</Th>
                    <Th>Exchanges</Th>
                    <Th>Expected Profit</Th>
                  </>
                )}
              </Tr>
            </Thead>
            <Tbody>
              {(activeBot === 'similarity' ? similarityData : arbitrageData).map((opportunity, index) => (
                <Tr key={index}>
                  <Td>{new Date(opportunity.timestamp).toLocaleString()}</Td>
                  {activeBot === 'similarity' ? (
                    <>
                      <Td>{opportunity.base_coin}</Td>
                      <Td>{opportunity.correlated_coin}</Td>
                      <Td>{(opportunity.correlation! * 100).toFixed(2)}%</Td>
                    </>
                  ) : (
                    <>
                      <Td>{opportunity.pair}</Td>
                      <Td>{`${opportunity.sell_exchange} → ${opportunity.buy_exchange}`}</Td>
                      <Td>{(opportunity.expected_profit! * 100).toFixed(2)}%</Td>
                    </>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
};

export default TradingDashboard;