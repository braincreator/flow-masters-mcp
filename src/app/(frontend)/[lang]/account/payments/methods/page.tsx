import React from 'react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
// Placeholder for actual payment method data fetching and type
// import { getSavedPaymentMethods, deletePaymentMethod, setDefaultPaymentMethod } from '@/actions/payments';
// import { SavedPaymentMethod } from '@/types/payment';

// Placeholder for a generic Icon component or specific icons
const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);


export default async function SavedPaymentMethodsPage() {
  const t = await getTranslations('Account.PaymentMethods');
  // const paymentMethods: SavedPaymentMethod[] = await getSavedPaymentMethods(); // Placeholder

  // Placeholder data
  const paymentMethods = [
    { id: 'pm_1', type: 'card', brand: 'Visa', last4: '1234', expiryMonth: 12, expiryYear: 2025, isDefault: true },
    { id: 'pm_2', type: 'card', brand: 'Mastercard', last4: '5678', expiryMonth: 8, expiryYear: 2026, isDefault: false },
    { id: 'pm_3', type: 'paypal', email: 'user@example.com', isDefault: false }, // Example for PayPal
  ];

  // Placeholder actions - in a real app, these would call server actions
  const handleDelete = async (id: string) => {
    'use server';
    logDebug(`Attempting to delete payment method: ${id}`);
    // await deletePaymentMethod(id);
    // revalidatePath('/account/payments/methods'); // If using server actions and revalidation
  };

  const handleSetDefault = async (id: string) => {
    'use server';
    logDebug(`Attempting to set default payment method: ${id}`);
    // await setDefaultPaymentMethod(id);
    // revalidatePath('/account/payments/methods');
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">{t('title')}</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded">
          {t('addNewMethod')}
        </button> 
        {/* This button would typically open a modal or redirect to a secure payment provider page */}
      </div>
      <p className="text-gray-600 mb-8">{t('description')}</p>

      {paymentMethods.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xl text-gray-600 mb-4">{t('noMethodsTitle')}</p>
          <p className="text-gray-500">{t('noMethodsDescription')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {paymentMethods.map((method) => (
            <div key={method.id} className="bg-white shadow rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <CreditCardIcon /> {/* Replace with dynamic icon based on method.type/brand */}
                <div>
                  {method.type === 'card' ? (
                    <>
                      <p className="font-semibold text-gray-800">{method.brand} {t('endingIn')} {method.last4}</p>
                      <p className="text-sm text-gray-500">{t('expires')} {String(method.expiryMonth).padStart(2, '0')}/{method.expiryYear}</p>
                    </>
                  ) : method.type === 'paypal' ? (
                     <p className="font-semibold text-gray-800">PayPal: {method.email}</p>
                  ) : (
                    <p className="font-semibold text-gray-800">{t('unknownMethod')}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-4 mt-4 md:mt-0 w-full md:w-auto">
                {method.isDefault ? (
                  <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">{t('default')}</span>
                ) : (
                  <form action={async () => { await handleSetDefault(method.id); }} className="inline-block">
                    <button 
                      type="submit"
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {t('setDefault')}
                    </button>
                  </form>
                )}
                 <form action={async () => { await handleDelete(method.id); }} className="inline-block">
                  <button 
                    type="submit"
                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    {t('delete')}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
       <div className="mt-8">
        <Link href="/account/payments/history" className="text-indigo-600 hover:text-indigo-800">
          &larr; {t('backToPaymentHistory')}
        </Link>
      </div>
    </div>
  );
}