import type { Endpoint, PayloadRequest } from 'payload/config' // Adjusted import for PayloadRequest
import type { Product, Service, CartSession } from '@/payload-types' // Added CartSession
// import { Response } from 'express' // Keep commented
import { findCartSession } from './cartHelpers'

interface AddItemRequestBody {
  itemId: string;
  itemType: 'product' | 'service';
  quantity?: number;
}

// Define a type for items in the cart, aligning with CartSessions.ts
// This helps ensure consistency when adding new items.
type CartItemPush = {
  itemType: 'product' | 'service';
  product?: string; // Assuming ID is stored
  service?: string; // Assuming ID is stored
  quantity: number;
  priceSnapshot: number;
  titleSnapshot?: string;
};


// POST /api/cart/add
const addItemHandler: Endpoint['handler'] = async (req: PayloadRequest): Promise<Response> => {
  const { payload, body } = req;
  const { itemId, itemType, quantity = 1 } = body as AddItemRequestBody; // Cast body
  payload.logger.info(`[addItemHandler] Received request body: ${JSON.stringify(body)}`);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (!itemId || typeof itemId !== 'string') {
    return new Response(JSON.stringify({ message: 'Item ID is required' }), {
      status: 400,
      headers,
    });
  }

  if (!itemType || (itemType !== 'product' && itemType !== 'service')) {
    return new Response(JSON.stringify({ message: 'Valid item type (product or service) is required' }), {
      status: 400,
      headers,
    });
  }

  if (typeof quantity !== 'number' || quantity <= 0 || !Number.isInteger(quantity)) {
    return new Response(JSON.stringify({ message: 'Invalid quantity' }), { status: 400, headers });
  }

  try {
    const { cartSession: cart, newCookieHeader } = await findCartSession(req, true);

    if (newCookieHeader) {
      headers['Set-Cookie'] = newCookieHeader;
    }

    if (!cart) {
      return new Response(JSON.stringify({ message: 'Failed to get or create cart session' }), {
        status: 500,
        headers,
      });
    }

    let price: number | undefined;
    let itemName: string | undefined;

    if (itemType === 'product') {
      const productDoc = await payload.findByID({ // Removed explicit generic, rely on collection slug
        collection: 'products',
        id: itemId,
        depth: 0, // Keep depth 0 if only direct fields are needed
      });
      // Ensure productDoc is treated as Product type
      const product = productDoc as Product;


      if (!product || product.pricing?.finalPrice === undefined || product.pricing?.finalPrice === null) {
        payload.logger.error(`[addItemHandler] Product not found or price unavailable for ID: ${itemId}. Product data: ${JSON.stringify(product)}`);
        return new Response(JSON.stringify({ message: 'Product not found or price unavailable' }), {
          status: 404,
          headers,
        });
      }
      price = product.pricing.finalPrice;
      itemName = product.title;
    } else if (itemType === 'service') {
      const serviceDoc = await payload.findByID({ // Removed explicit generic
        collection: 'services',
        id: itemId,
        depth: 0,
      });
      // Ensure serviceDoc is treated as Service type
      const service = serviceDoc as Service;

      if (!service || typeof service.price !== 'number') {
        payload.logger.error(`[addItemHandler] Service not found or price unavailable for ID: ${itemId}. Service data: ${JSON.stringify(service)}`);
        return new Response(JSON.stringify({ message: 'Service not found or price unavailable' }), {
          status: 404,
          headers,
        });
      }
      price = service.price;
      itemName = service.title;
    } else {
      return new Response(JSON.stringify({ message: 'Invalid item type specified' }), {
        status: 400,
        headers,
      });
    }

    if (price === undefined) { // itemName can be optional if not always available/needed for snapshot
        payload.logger.error(`[addItemHandler] Price is undefined after fetching item. ItemId: ${itemId}, ItemType: ${itemType}`);
        return new Response(JSON.stringify({ message: 'Failed to retrieve item price' }), {
            status: 500,
            headers,
        });
    }

    const currentItems = (cart.items || []) as CartSession['items'] || []; // Ensure currentItems is correctly typed
    const updatedItems = [...currentItems];


    const existingItemIndex = updatedItems.findIndex(
      (item) => {
        if (item && item.itemType === itemType) {
          if (itemType === 'product' && (typeof item.product === 'string' ? item.product : item.product?.id) === itemId) {
            return true;
          }
          if (itemType === 'service' && (typeof item.service === 'string' ? item.service : item.service?.id) === itemId) {
            return true;
          }
        }
        return false;
      }
    );

    if (existingItemIndex > -1 && updatedItems[existingItemIndex]) {
      updatedItems[existingItemIndex].quantity = (updatedItems[existingItemIndex].quantity || 0) + quantity;
      // Optionally update priceSnapshot if prices can change and you want the latest
      // updatedItems[existingItemIndex].priceSnapshot = price;
      // updatedItems[existingItemIndex].titleSnapshot = itemName;
    } else {
      const newItem: CartItemPush = {
        itemType,
        quantity,
        priceSnapshot: price,
        titleSnapshot: itemName,
      };
      if (itemType === 'product') {
        newItem.product = itemId;
      } else {
        newItem.service = itemId;
      }
      updatedItems.push(newItem as any); // Cast to any if CartItemPush is slightly different from inferred array type
                                        // Or ensure CartSession['items'] elements match CartItemPush
    }

    const updatedCart = await payload.update({
      collection: 'cart-sessions',
      id: cart.id,
      data: {
        items: updatedItems,
      },
      depth: 2,
      user: req.user, // req.user might be undefined for guest carts
      overrideAccess: true,
    });

    return new Response(JSON.stringify(updatedCart), { status: 200, headers });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // req.body might not be defined here if error happened before its destructuring
    const logItemId = (req.body as AddItemRequestBody)?.itemId || 'unknown';
    const logItemType = (req.body as AddItemRequestBody)?.itemType || 'unknown';
    req.payload.logger.error(`Error adding item (ID: ${logItemId}, Type: ${logItemType}) to cart: ${errorMessage} Stack: ${error instanceof Error ? error.stack : ''}`);
    return new Response(JSON.stringify({ message: 'Failed to add item to cart' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export default addItemHandler;
