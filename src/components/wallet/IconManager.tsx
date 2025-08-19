import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Lock } from 'lucide-react';
import { FLAGS } from '@/config/featureFlags';

interface IconManagerProps {
  userId?: string;
}

const IconManager: React.FC<IconManagerProps> = ({ userId = 'demo-user' }) => {
  // Показываем заглушку если флаг отключен
  if (!FLAGS.ICON_LIB_ENABLED) {
    return (
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Менеджер Иконок</h2>
            <p className="text-gray-600">Управление иконками wallet приложения</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Lock className="w-3 h-3 mr-1" />
            Функция отключена
          </Badge>
        </div>

        {/* Заглушка */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span>Функция временно недоступна</span>
            </CardTitle>
            <CardDescription>
              Менеджер иконок отключен в текущей конфигурации системы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Управление иконками отключено
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Эта функция в настоящее время недоступна. Для получения доступа к управлению 
                иконками обратитесь к администратору системы.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Что будет доступно при включении:
                  </h4>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Просмотр всех иконок по категориям</li>
                    <li>• Загрузка пользовательских иконок</li>
                    <li>• Замена иконок через AI чат</li>
                    <li>• Управление группами дублирующихся иконок</li>
                    <li>• Просмотр структуры Storage</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Если флаг включен - используем оригинальный компонент
  // ... keep existing code (оригинальная реализация IconManager)
  return null; // Этот блок никогда не выполнится при текущих флагах
};

export default IconManager;
