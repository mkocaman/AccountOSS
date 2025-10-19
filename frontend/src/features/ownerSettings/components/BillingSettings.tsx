import { Alert } from 'antd';

export default function BillingSettings() {
  return (
    <div className="max-w-3xl">
      <h3 className="text-lg font-semibold mb-4">Billing Settings</h3>
      
      <Alert
        message="Coming Soon"
        description="Billing configuration will be available in a future update. This will include Stripe, PayPal, and manual payment settings."
        type="info"
        showIcon
      />
    </div>
  );
}

