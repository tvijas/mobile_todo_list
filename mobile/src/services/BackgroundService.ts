import notifee, { EventType } from '@notifee/react-native';
import { AppState, AppStateStatus } from 'react-native';
import { updateAllNotifications } from '../utils/notificationUtils';

/**
 * Сервис для обработки фоновых событий, связанных с уведомлениями
 */
class BackgroundService {
  /**
   * Инициализация сервиса фоновых задач
   */
  initialize() {
    this.setupAppStateListener();
    this.setupNotificationListeners();
    this.setupBackgroundHandler();
  }
  
  /**
   * Настройка слушателя состояния приложения
   * Это позволяет перепланировать уведомления, когда приложение возвращается на передний план
   */
  setupAppStateListener() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }
  
  /**
   * Обработчик изменения состояния приложения
   */
  handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // Если приложение вернулось на передний план
    if (nextAppState === 'active') {
      console.log('App returned to foreground, rescheduling notifications');
      await updateAllNotifications();
    }
  };
  
  /**
   * Настройка слушателей событий уведомлений
   */
  setupNotificationListeners() {
    // Регистрация обработчика событий уведомлений
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          console.log('User pressed notification', detail.notification);
          break;
        case EventType.DISMISSED:
          console.log('User dismissed notification', detail.notification);
          break;
      }
    });
  }
  
  /**
   * Настройка обработчика для событий на фоне
   * Это позволяет взаимодействовать с уведомлениями, когда приложение не на переднем плане
   */
  setupBackgroundHandler() {
    // Регистрируем обработчик для фоновых событий
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      switch (type) {
        case EventType.PRESS:
          console.log('User pressed notification from background', detail.notification);
          break;
      }
      
      // Обязательно вернуть undefined, чтобы фоновое выполнение завершилось
      return Promise.resolve();
    });
  }
  
  // /**
  //  * Очистка ресурсов
  //  */
  // cleanup() {
  //   AppState.removeEventListener('change', this.handleAppStateChange);
  // }
}

export default new BackgroundService();
  