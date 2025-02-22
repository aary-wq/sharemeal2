const stripe = Stripe('your_publishable_key'); // Replace with your Stripe key

class PaymentService {
    static async createPaymentIntent(amount, currency = 'inr') {
        const response = await fetch('/api/payment/create-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ amount, currency })
        });

        if (!response.ok) {
            throw new Error('Payment failed to initialize');
        }

        return await response.json();
    }

    static async processPayment(paymentMethodId, amount) {
        try {
            const paymentIntent = await this.createPaymentIntent(amount);
            
            const result = await stripe.confirmCardPayment(paymentIntent.clientSecret, {
                payment_method: paymentMethodId
            });

            if (result.error) {
                throw new Error(result.error.message);
            }

            return result.paymentIntent;
        } catch (error) {
            console.error('Payment error:', error);
            throw error;
        }
    }

    static async getPaymentHistory() {
        const response = await fetch('/api/payment/history', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch payment history');
        }

        return await response.json();
    }
}

export default PaymentService; 