
import React from 'react';
import { MoreVertical, ArrowUp, ArrowRight, ArrowLeftRight, X } from 'lucide-react';
import { useWalletCustomizationStore } from '@/stores/walletCustomizationStore';

const HistoryContent = () => {
  const { 
    getStyleForComponent
  } = useWalletCustomizationStore();

  // Get component-specific styles
  const panelStyle = getStyleForComponent('panels');
  const containerStyle = getStyleForComponent('containers');
  const buttonStyle = getStyleForComponent('buttons');
  const globalStyle = getStyleForComponent('global');

  const handleTransactionClick = (transactionType: string) => {
    console.log(`Transaction ${transactionType} clicked`);
  };

  const transactions = [
    {
      date: 'Apr 11, 2025',
      items: [
        {
          type: 'sent',
          icon: ArrowRight,
          title: 'To 3QLo...yJd2',
          amount: '-5.34M THECOIN',
          avatar: '/lovable-uploads/60caa821-2df9-4d5e-81f1-0e723c7b7193.png',
          isNegative: true
        }
      ]
    },
    {
      date: 'Mar 20, 2025',
      items: [
        {
          type: 'swapped',
          icon: ArrowLeftRight,
          title: 'pump.fun',
          amount: '+5.34M THECOIN',
          subtitle: '-1.01117 SOL',
          avatar: '/lovable-uploads/a2d78101-8353-4107-915f-b3ee8481a1f7.png',
          isNegative: false
        }
      ]
    },
    {
      date: 'Mar 19, 2025',
      items: [
        {
          type: 'failed',
          icon: X,
          title: 'Unknown',
          amount: 'Transaction failed',
          subtitle: 'Insufficient funds',
          isNegative: false,
          isFailed: true
        }
      ]
    }
  ];

  return (
    <div className="flex-1 flex flex-col px-4 py-3 overflow-y-auto history-content" data-element-id="history-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 history-header" data-element-id="history-header">
        <h2 
          className="text-lg font-semibold text-white history-title"
          data-element-id="history-title"
          style={{
            color: globalStyle.textColor || '#FFFFFF',
            fontFamily: globalStyle.fontFamily
          }}
        >
          Recent Activity
        </h2>
        <button 
          className="p-2 rounded-full hover:bg-white/10 transition-colors history-menu"
          data-element-id="history-menu"
          style={{
            borderRadius: '50%',
            transition: buttonStyle.transition
          }}
        >
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Transaction Groups by Date */}
      <div className="space-y-4 history-transactions" data-element-id="history-transactions">
        {transactions.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Date Header */}
            <div 
              className="text-xs text-gray-400 mb-3 font-medium history-date"
              data-element-id="history-date"
              style={{ fontFamily: globalStyle.fontFamily }}
            >
              {group.date}
            </div>
            
            {/* Transactions for this date */}
            <div className="space-y-3">
              {group.items.map((transaction, itemIndex) => (
                <div
                  key={itemIndex}
                  className="p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer history-transaction-item"
                  data-element-id="history-transaction-item"
                  onClick={() => handleTransactionClick(transaction.type)}
                  style={{
                    backgroundColor: panelStyle.backgroundColor || 'rgba(255, 255, 255, 0.03)',
                    borderRadius: panelStyle.borderRadius || '12px',
                    border: panelStyle.border,
                    backdropFilter: panelStyle.backdropFilter,
                    transition: panelStyle.transition
                  }}
                >
                  <div className="flex items-center space-x-3">
                    {/* Transaction Icon/Avatar */}
                    <div className="relative">
                      {transaction.avatar ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={transaction.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.isFailed
                              ? 'bg-red-500/20 border border-red-500/30'
                              : 'bg-gray-600/50'
                          }`}
                          style={{
                            borderRadius: '50%'
                          }}
                        >
                          <transaction.icon
                            className={`w-5 h-5 ${
                              transaction.isFailed ? 'text-red-400' : 'text-gray-300'
                            }`}
                          />
                        </div>
                      )}
                      
                      {/* Status Icon Overlay */}
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                          transaction.type === 'sent'
                            ? 'bg-blue-500'
                            : transaction.type === 'swapped'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                        style={{
                          borderRadius: '50%',
                          background: transaction.type === 'sent' 
                            ? buttonStyle.backgroundColor || '#3B82F6'
                            : transaction.type === 'swapped'
                            ? '#10B981'
                            : '#EF4444'
                        }}
                      >
                        <transaction.icon className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1">
                      <div 
                        className="text-white text-sm font-medium"
                        style={{
                          color: globalStyle.textColor || '#FFFFFF',
                          fontFamily: globalStyle.fontFamily
                        }}
                      >
                        {transaction.title}
                      </div>
                      {transaction.subtitle && (
                        <div 
                          className="text-gray-400 text-xs"
                          style={{ fontFamily: globalStyle.fontFamily }}
                        >
                          {transaction.subtitle}
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <div
                        className={`text-sm font-medium ${
                          transaction.isFailed
                            ? 'text-red-400'
                            : transaction.isNegative
                            ? 'text-white'
                            : 'text-green-400'
                        }`}
                        style={{
                          fontFamily: globalStyle.fontFamily,
                          color: transaction.isFailed
                            ? '#F87171'
                            : transaction.isNegative
                            ? globalStyle.textColor
                            : '#34D399'
                        }}
                      >
                        {transaction.amount}
                      </div>
                      {transaction.subtitle && transaction.type === 'swapped' && (
                        <div 
                          className="text-gray-400 text-xs"
                          style={{ fontFamily: globalStyle.fontFamily }}
                        >
                          {transaction.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="mt-6 flex justify-center">
        <button
          className="px-4 py-2 text-sm transition-colors hover:scale-105 history-load-more"
          data-element-id="history-load-more"
          onClick={() => handleTransactionClick('load-more')}
          style={{
            color: buttonStyle.backgroundColor || '#9945FF',
            fontFamily: globalStyle.fontFamily,
            transition: buttonStyle.transition
          }}
        >
          Load more transactions
        </button>
      </div>
    </div>
  );
};

export default HistoryContent;
