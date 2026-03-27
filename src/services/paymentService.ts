export type PaymentProvider = 'payme' | 'click' | 'bank' | 'usd_link';
export type Currency = 'UZS' | 'USD';

interface PaymentParams {
  amount: number;
  currency: Currency;
  planId: string;
  userId: string;
}

class PaymentService {
  private readonly PAYME_MERCHANT_ID = process.env.PAYME_MERCHANT_ID || '65e72a0e67776f8e759f6304'; // Placeholder
  private readonly CLICK_SERVICE_ID = process.env.CLICK_SERVICE_ID || '32145'; // Placeholder
  private readonly CLICK_MERCHANT_ID = process.env.CLICK_MERCHANT_ID || '22345'; // Placeholder
  private readonly USD_PAYMENT_URL = 'https://link.com/';

  generatePaymeLink({ amount, currency, planId, userId }: PaymentParams): string {
    // Payme amount is in tiyin (1 UZS = 100 tiyin)
    const amountInTiyin = amount * 100;
    const cr = currency === 'UZS' ? '0' : '1';
    
    const params = `m=${this.PAYME_MERCHANT_ID};ac.plan=${planId};ac.user=${userId};a=${amountInTiyin};c=${window.location.origin}/payment/success;cr=${cr}`;
    const encodedParams = btoa(params);
    
    return `https://checkout.paycom.uz/${encodedParams}`;
  }

  generateClickLink({ amount, planId, userId }: PaymentParams): string {
    // Click amount is in UZS
    const params = new URLSearchParams({
      service_id: this.CLICK_SERVICE_ID,
      merchant_id: this.CLICK_MERCHANT_ID,
      amount: amount.toString(),
      transaction_param: `${planId}:${userId}`,
      return_url: `${window.location.origin}/payment/success`
    });
    
    return `https://my.click.uz/services/pay?${params.toString()}`;
  }

  generateBankLink({ amount, planId, userId }: PaymentParams): string {
    // Simulated bank card payment link
    return `https://bank.uz/pay?amount=${amount}&plan=${planId}&user=${userId}`;
  }

  generateUsdLink({ amount, planId, userId }: PaymentParams): string {
    // Provided USD payment link
    return `${this.USD_PAYMENT_URL}?amount=${amount}&plan=${planId}&user=${userId}`;
  }

  generatePaymentLink(provider: PaymentProvider, params: PaymentParams): string {
    switch (provider) {
      case 'payme': return this.generatePaymeLink(params);
      case 'click': return this.generateClickLink(params);
      case 'bank': return this.generateBankLink(params);
      case 'usd_link': return this.generateUsdLink(params);
      default: return '#';
    }
  }
}

export const paymentService = new PaymentService();
