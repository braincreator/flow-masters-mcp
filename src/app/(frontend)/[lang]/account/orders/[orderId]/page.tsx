import React from 'react';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Placeholder for actual order data fetching and type
// import { getOrderById } from '@/actions/orders'; // Assuming an action to fetch a specific order
// import { Order, OrderItem } from '@/types/order'; // Assuming order type definitions

interface OrderDetailPageProps {
  params: {
    orderId: string;
    locale: string;
  };
}

// Placeholder data - replace with actual data fetching
const fetchOrderDetails = async (orderId: string): Promise<any /* Order */ | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  const orders = [
    { 
      id: '1', 
      orderNumber: 'ORD-12345', 
      date: '2024-05-10', 
      total: 99.99, 
      status: 'Delivered',
      shippingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '90210',
        country: 'USA',
      },
      billingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip: '90210',
        country: 'USA',
      },
      items: [
        { id: 'item1', name: 'Product A', quantity: 1, price: 50.00, imageUrl: 'https://via.placeholder.com/100' },
        { id: 'item2', name: 'Product B', quantity: 2, price: 24.99, imageUrl: 'https://via.placeholder.com/100' },
      ],
      subtotal: 99.98,
      shippingCost: 5.00,
      tax: 8.00,
      discount: 12.99, // Example discount
      paymentMethod: 'Visa **** 1234',
      statusHistory: [
        { status: 'Pending', date: '2024-05-09T10:00:00Z' },
        { status: 'Processing', date: '2024-05-09T14:00:00Z' },
        { status: 'Shipped', date: '2024-05-10T09:00:00Z', trackingLink: 'https://example.com/track/123' },
        { status: 'Delivered', date: '2024-05-10T15:00:00Z' },
      ]
    },
    // Add more mock orders if needed for testing different IDs
  ];
  return orders.find(o => o.id === orderId) || null;
};


export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const t = await getTranslations('Account.OrderDetail');
  const order = await fetchOrderDetails(params.orderId);

  if (!order) {
    notFound();
  }

  const currentStatusEntry = order.statusHistory[order.statusHistory.length - 1];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/account/orders" className="text-indigo-600 hover:text-indigo-800">
          &larr; {t('backToOrders')}
        </Link>
      </div>
      <h1 className="text-3xl font-semibold mb-2">{t('title', { orderNumber: order.orderNumber })}</h1>
      <p className="text-gray-600 mb-1">{t('placedOn', { date: new Date(order.date).toLocaleDateString() })}</p>
      <p className="text-gray-600 mb-6">
        {t('status')}: <span
          className={`px-2 py-1 text-sm font-semibold rounded-full ${
            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
            order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
            order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}
        >
          {order.status}
        </span>
        {currentStatusEntry.trackingLink && (
          <a href={currentStatusEntry.trackingLink} target="_blank" rel="noopener noreferrer" className="ml-2 text-indigo-600 hover:text-indigo-800 text-sm">
            ({t('trackShipment')})
          </a>
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 shadow rounded-lg">
          <h2 className="text-xl font-semibold mb-4">{t('itemsOrdered')}</h2>
          {order.items.map((item: any /* OrderItem */) => (
            <div key={item.id} className="flex items-center border-b border-gray-200 py-4 last:border-b-0">
              <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded mr-4" />
              <div className="flex-grow">
                <h3 className="font-medium text-gray-800">{item.name}</h3>
                <p className="text-sm text-gray-600">{t('quantity')}: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">${(item.price * item.quantity).toFixed(2)}</p>
                {item.quantity > 1 && (
                  <p className="text-sm text-gray-500">(${item.price.toFixed(2)} {t('each')})</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{t('orderSummary')}</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('subtotal')}:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('shipping')}:</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('tax')}:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('discount')}:</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>{t('total')}:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{t('paymentInformation')}</h2>
            <p>{t('paymentMethod')}: {order.paymentMethod}</p>
            {/* Add more payment details if available */}
          </div>

          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{t('shippingAddress')}</h2>
            <address className="not-italic text-gray-700">
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}<br />
              {order.shippingAddress.country}
            </address>
          </div>
          
          {/* Optional: Billing Address if different from shipping */}
          {/* 
          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{t('billingAddress')}</h2>
            <address className="not-italic text-gray-700">
              {order.billingAddress.street}<br />
              {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zip}<br />
              {order.billingAddress.country}
            </address>
          </div>
          */}

          <div className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-xl font-semibold mb-4">{t('statusHistory')}</h2>
            <ul className="space-y-3">
              {order.statusHistory.map((entry: any, index: number) => (
                <li key={index} className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{entry.status}</span> - {new Date(entry.date).toLocaleString()}
                  {entry.trackingLink && entry.status === 'Shipped' && (
                     <a href={entry.trackingLink} target="_blank" rel="noopener noreferrer" className="ml-1 text-indigo-600 hover:text-indigo-800">
                       ({t('trackShipment')})
                     </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      <div className="mt-8 text-center">
        {/* Placeholder for actions like "Reorder", "Request Cancellation", "Contact Support" */}
        <button className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 mr-2">{t('reorder')}</button>
        <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300">{t('contactSupport')}</button>
      </div>
    </div>
  );
}