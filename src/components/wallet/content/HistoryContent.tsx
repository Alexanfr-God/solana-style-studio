
import React from 'react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const HistoryContent = () => {
  const { walletStyle } = useWalletCustomizationStore();

  const transactions = [
    {
      id: 1,
      to: '3QLo...yJd2',
      service: 'pump.fun',
      amount: '-1.01117',
      token: 'SOL',
      status: 'Unknown',
      error: 'Insufficient funds',
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      to: '7xKL...mN9p',
      service: 'Uniswap',
      amount: '+2.5',
      token: 'ETH',
      status: 'Completed',
      error: null,
      timestamp: '1 day ago'
    }
  ];

  return (
    <div 
      className="h-full bg-gradient-to-b from-gray-900 to-gray-800 p-6 history-container"
      data-element-id="history-container"
      style={{ backgroundColor: walletStyle.backgroundColor || '#1a1a1a' }}
    >
      <h2 className="text-xl font-bold text-white mb-6">Transaction History</h2>
      
      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 history-transaction-item"
            data-element-id="history-transaction-item"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div 
                  className="font-medium text-white mb-1 history-transaction-to"
                  data-element-id="history-transaction-to"
                >
                  To {transaction.to}
                </div>
                <div 
                  className="text-sm text-gray-400 history-transaction-service"
                  data-element-id="history-transaction-service"
                >
                  {transaction.service}
                </div>
              </div>
              <div className="text-right">
                <div 
                  className={`font-semibold ${
                    transaction.amount.startsWith('-') ? 'text-red-400' : 'text-green-400'
                  } history-transaction-amount`}
                  data-element-id="history-transaction-amount"
                >
                  {transaction.amount}
                </div>
                <div 
                  className="text-sm text-gray-400 history-transaction-token"
                  data-element-id="history-transaction-token"
                >
                  {transaction.token}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <div 
                className={`text-sm px-2 py-1 rounded ${
                  transaction.status === 'Completed' 
                    ? 'bg-green-900 text-green-300' 
                    : transaction.status === 'Unknown'
                    ? 'bg-yellow-900 text-yellow-300'
                    : 'bg-red-900 text-red-300'
                } history-transaction-status`}
                data-element-id="history-transaction-status"
              >
                {transaction.status}
              </div>
              <div className="text-sm text-gray-500">{transaction.timestamp}</div>
            </div>
            
            {transaction.error && (
              <div 
                className="mt-2 text-sm text-red-400 history-transaction-error"
                data-element-id="history-transaction-error"
              >
                {transaction.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryContent;
