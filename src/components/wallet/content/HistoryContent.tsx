
import React from 'react';
import { MoreVertical, ArrowUp, ArrowRight, ArrowLeftRight, X } from 'lucide-react';
import { useWalletTheme } from '@/hooks/useWalletTheme';

const HistoryContent = () => {
  const { getHistoryLayer, getAssetCard, getGlobal } = useWalletTheme();

  // Get layer-specific styles
  const historyStyle = getHistoryLayer();
  const assetCard = getAssetCard();
  const globalStyle = getGlobal();

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
    <div className="h-full flex flex-col px-4 py-3 overflow-y-auto history-content" data-element-id="history-content">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 history-header" data-element-id="history-header">
        <h2 
          className="text-lg font-semibold history-title"
          data-element-id="history-title"
          style={{
            color: historyStyle.recentActivityTitle?.textColor || '#FFFFFF',
            fontFamily: historyStyle.recentActivityTitle?.fontFamily || globalStyle.fontFamily,
            fontWeight: historyStyle.recentActivityTitle?.fontWeight || 'bold',
            fontSize: historyStyle.recentActivityTitle?.fontSize || '19px'
          }}
        >
          Recent Activity
        </h2>
        <button 
          className="p-2 rounded-full hover:bg-white/10 transition-colors history-menu"
          data-element-id="history-menu"
          style={{
            borderRadius: '50%',
            transition: globalStyle.transition || 'all 0.2s ease'
          }}
        >
          <MoreVertical 
            className="w-5 h-5 history-menu-icon" 
            data-element-id="history-menu-icon"
            style={{ color: historyStyle.menuIcon?.color || '#FFFFFF' }}
          />
        </button>
      </div>

      {/* Transaction Groups by Date */}
      <div className="space-y-4 history-transactions" data-element-id="history-transactions">
        {transactions.map((group, groupIndex) => (
          <div key={groupIndex} className="history-transaction-group" data-element-id={`history-transaction-group-${groupIndex}`}>
            {/* Date Header */}
            <div 
              className="text-xs mb-3 font-medium history-date"
              data-element-id={`history-date-${groupIndex}`}
              style={{ 
                color: historyStyle.activityDate?.textColor || '#aaa',
                fontFamily: historyStyle.activityDate?.fontFamily || globalStyle.fontFamily,
                fontSize: historyStyle.activityDate?.fontSize || '13px'
              }}
            >
              {group.date}
            </div>
            
            {/* Transactions for this date - Using assetCard */}
            <div className="space-y-3">
              {group.items.map((transaction, itemIndex) => (
                <div
                  key={itemIndex}
                  className="p-3 hover:bg-white/5 transition-colors cursor-pointer history-transaction-item"
                  data-element-id={`history-transaction-item-${groupIndex}-${itemIndex}`}
                  onClick={() => handleTransactionClick(transaction.type)}
                  style={{
                    backgroundColor: assetCard.backgroundColor || '#232323',
                    borderRadius: assetCard.borderRadius || '15px',
                    transition: globalStyle.transition || 'all 0.2s ease'
                  }}
                >
                  
                  <div className="flex items-center space-x-3">
                    
                    <div className="relative">
                      {transaction.avatar ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden history-transaction-avatar" data-element-id={`history-transaction-avatar-${groupIndex}-${itemIndex}`}>
                          <img
                            src={transaction.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center history-transaction-icon-container ${
                            transaction.isFailed
                              ? 'bg-red-500/20 border border-red-500/30'
                              : 'bg-gray-600/50'
                          }`}
                          data-element-id={`history-transaction-icon-container-${groupIndex}-${itemIndex}`}
                          style={{
                            borderRadius: '50%'
                          }}
                        >
                          <transaction.icon
                            className={`w-5 h-5 history-transaction-icon ${
                              transaction.isFailed ? 'text-red-400' : 'text-gray-300'
                            }`}
                            data-element-id={`history-transaction-icon-${groupIndex}-${itemIndex}`}
                          />
                        </div>
                      )}
                      
                      
                      <div
                        className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center history-transaction-status ${
                          transaction.type === 'sent'
                            ? 'bg-blue-500'
                            : transaction.type === 'swapped'
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                        data-element-id={`history-transaction-status-${groupIndex}-${itemIndex}`}
                        style={{
                          borderRadius: '50%',
                          background: transaction.type === 'sent' 
                            ? '#3B82F6'
                            : transaction.type === 'swapped'
                            ? '#10B981'
                            : '#EF4444'
                        }}
                      >
                        <transaction.icon className="w-3 h-3 text-white history-transaction-status-icon" data-element-id={`history-transaction-status-icon-${groupIndex}-${itemIndex}`} />
                      </div>
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1">
                      <div 
                        className="text-sm font-medium history-transaction-title"
                        data-element-id={`history-transaction-title-${groupIndex}-${itemIndex}`}
                        style={{
                          color: assetCard.title?.textColor || '#FFFFFF',
                          fontFamily: assetCard.title?.fontFamily || globalStyle.fontFamily,
                          fontSize: assetCard.title?.fontSize || '15px'
                        }}
                      >
                        {transaction.title}
                      </div>
                      {transaction.subtitle && (
                        <div 
                          className="text-xs history-transaction-subtitle"
                          data-element-id={`history-transaction-subtitle-${groupIndex}-${itemIndex}`}
                          style={{ 
                            color: assetCard.description?.textColor || '#aaa',
                            fontFamily: assetCard.description?.fontFamily || globalStyle.fontFamily
                          }}
                        >
                          {transaction.subtitle}
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <div
                        className="text-sm font-medium history-transaction-amount"
                        data-element-id={`history-transaction-amount-${groupIndex}-${itemIndex}`}
                        style={{
                          fontFamily: assetCard.value?.fontFamily || globalStyle.fontFamily,
                          fontWeight: historyStyle.activityStatus?.fontWeight || '500',
                          color: transaction.isFailed
                            ? historyStyle.activityStatus?.failedColor || '#ff5959'
                            : transaction.isNegative
                            ? assetCard.value?.textColor || '#FFFFFF'
                            : assetCard.percent?.positiveColor || '#13e163'
                        }}
                      >
                        {transaction.amount}
                      </div>
                      {transaction.subtitle && transaction.type === 'swapped' && (
                        <div 
                          className="text-xs history-transaction-amount-subtitle"
                          data-element-id={`history-transaction-amount-subtitle-${groupIndex}-${itemIndex}`}
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
            color: historyStyle.loadMore?.textColor || '#b03fff',
            fontFamily: historyStyle.loadMore?.fontFamily || globalStyle.fontFamily,
            fontSize: historyStyle.loadMore?.fontSize || '15px',
            transition: globalStyle.transition || 'all 0.2s ease'
          }}
        >
          <span className="history-load-more-text" data-element-id="history-load-more-text">
            Load more transactions
          </span>
        </button>
      </div>
    </div>
  );
};

export default HistoryContent;
