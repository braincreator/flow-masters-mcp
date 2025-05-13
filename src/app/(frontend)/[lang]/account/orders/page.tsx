import React from 'react';
import { getTranslations } from 'next-intl/server';

// Placeholder for actual order data fetching and type
// import { getOrders } from '@/actions/orders'; // Assuming an action to fetch orders
// import { Order } from '@/types/order'; // Assuming an order type definition

export default async function OrderHistoryPage() {
  const t = await getTranslations('Account.OrderHistory');
  // const orders: Order[] = await getOrders(); // Placeholder for fetching orders

  // Placeholder data
  const orders = [
    { id: '1', orderNumber: 'ORD-12345', date: '2024-05-10', total: 99.99, status: 'Delivered' },
    { id: '2', orderNumber: 'ORD-12346', date: '2024-05-11', total: 45.50, status: 'Processing' },
    { id: '3', orderNumber: 'ORD-12347', date: '2024-05-12', total: 120.00, status: 'Shipped' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">{t('title')}</h1>
      {orders.length === 0 ? (
        <p>{t('noOrders')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 uppercase">{t('orderNumber')}</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 uppercase">{t('date')}</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 uppercase">{t('total')}</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 uppercase">{t('status')}</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 uppercase">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">{order.orderNumber}</td>
                  <td className="py-3 px-4">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">${order.total.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <a href={`/account/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                      {t('viewDetails')}
                    </a>
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