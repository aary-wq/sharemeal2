class NotificationHandler {
    static async init() {
        try {
            if (!('Notification' in window)) {
                console.log('This browser does not support notifications');
                return;
            }

            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await this.subscribeToPush();
            }
        } catch (error) {
            console.error('Notification initialization error:', error);
        }
    }

    static async subscribeToPush() {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
            });

            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify(subscription)
            });
        } catch (error) {
            console.error('Push subscription error:', error);
        }
    }
}

export default NotificationHandler; 