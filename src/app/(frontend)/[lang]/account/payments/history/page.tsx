import React from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

// Placeholder for actual payment data fetching and type
// import { getPaymentHistory } from '@/actions/payments'; // Assuming an action
// import { PaymentTransaction } from '@/types/payment'; // Assuming a type

export default async function PaymentHistoryPage() {
  const t = await getTranslations('Account.PaymentHistory');
  // const transactions: PaymentTransaction[] = await getPaymentHistory(); // Placeholder

  // Placeholder data
  const transactions = [
    { 
      id: 'txn_1', 
      date: '2024-07-15', 
      amount: 9.99, 
      currency: 'USD', 
      status: 'Succeeded', 
      method: 'Visa **** 1234', 
      description: 'Subscription Renewal - Basic Plan',
      relatedOrder: 'ORD-12345', // Optional
      relatedSubscription: 'sub1' // Optional
    },
    { 
      id: 'txn_2', 
      date: '2024-06-15', 
      amount: 29.99, 
      currency: 'USD', 
      status: 'Succeeded', 
      method: 'Mastercard **** 5678', 
      description: 'New Subscription - Premium Plan',
      relatedOrder: 'ORD-12300'
    },
    { 
      id: 'txn_3', 
      date: '2024-05-10', 
      amount: 50.00, 
      currency: 'USD', 
      status: 'Refunded', 
      method: 'Visa **** 1234', 
      description: 'Product Purchase - Item X',
      relatedOrder: 'ORD-11122'
    },
     { 
      id: 'txn_4', 
      date: '2024-05-09', 
      amount: 15.00, 
      currency: 'USD', 
      status: 'Failed', 
      method: 'Visa **** 7890', 
      description: 'Service Booking - Consultation',
      relatedOrder: 'ORD-11100'
    },
  ];

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-blue-100 text-blue-700'; // Or another color for refunded
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <Link href="/account/payments/methods" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded">
          {t('managePaymentMethods')}
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600 mb-4">{t('noTransactionsTitle')}</p>
          <p className="text-gray-500">{t('noTransactionsDescription')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left text-sm text-gray-600 uppercase">
                <th className="py-3 px-4 font-semibold">{t('date')}</th>
                <th className="py-3 px-4 font-semibold">{t('description')}</th>
                <th className="py-3 px-4 font-semibold">{t('amount')}</th>
                <th className="py-3 px-4 font-semibold">{t('method')}</th>
                <th className="py-3 px-4 font-semibold">{t('status')}</th>
                <th className="py-3 px-4 font-semibold">{t('reference')}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {transactions.map((txn) => (
                <tr key={txn.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{new Date(txn.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{txn.description}</td>
                  <td className="py-3 px-4">{txn.currency}{txn.amount.toFixed(2)}</td>
                  <td className="py-3 px-4">{txn.method}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(txn.status)}`}
                    >
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {txn.relatedOrder && (
                      <Link href={`/account/orders/${txn.relatedOrder}`} className="text-indigo-600 hover:underline">
                        {t('orderRef', { orderId: txn.relatedOrder })}
                      </Link>
                    )}
                    {txn.relatedSubscription && (
                      <Link href={`/account/subscriptions/${txn.relatedSubscription}`} className="text-indigo-600 hover:underline ml-2">
                        {t('subscriptionRef', { subscriptionId: txn.relatedSubscription })}
                      </Link>
                    )}
                    {!txn.relatedOrder && !txn.relatedSubscription && txn.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}