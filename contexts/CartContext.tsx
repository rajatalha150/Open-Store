'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { ProductVariant, getVariantSelectionKey } from '@/lib/product-variants'

export interface CartItem {
  cartKey: string
  id: number
  name: string
  price: number
  image_url: string
  quantity: number
  stock_quantity: number
  variantLabel?: string
  selectedVariants?: ProductVariant[]
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  couponCode?: string
  discountAmount: number
  discountedTotal: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity' | 'cartKey'> & { quantity?: number; cartKey?: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { cartKey: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_COUPON'; payload: { code: string; discount: number; type: 'percentage' | 'fixed_amount' } }
  | { type: 'REMOVE_COUPON' }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

export function buildCartItemKey(productId: number, selectedVariants?: ProductVariant[]) {
  const variantKey = selectedVariants && selectedVariants.length > 0
    ? getVariantSelectionKey(selectedVariants)
    : ''

  return variantKey ? `${productId}:${variantKey}` : productId.toString()
}

function normalizeCartItem(item: Omit<CartItem, 'quantity' | 'cartKey'> & { quantity?: number; cartKey?: string }): CartItem {
  const price = typeof item.price === 'number' ? item.price : parseFloat(item.price as any)
  const stockQuantity = typeof item.stock_quantity === 'number'
    ? item.stock_quantity
    : parseInt(item.stock_quantity as any || '0')
  const selectedVariants = Array.isArray(item.selectedVariants) ? item.selectedVariants : []

  return {
    ...item,
    cartKey: item.cartKey || buildCartItemKey(item.id, selectedVariants),
    price: Number.isFinite(price) ? price : 0,
    stock_quantity: Number.isFinite(stockQuantity) ? stockQuantity : 0,
    quantity: Math.max(1, Math.floor(item.quantity || 1)),
    selectedVariants,
  }
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const nextItem = normalizeCartItem(action.payload)
      const existingItem = state.items.find(item => item.cartKey === nextItem.cartKey)

      if (existingItem) {
        const stock = nextItem.stock_quantity;
        const newQuantity = Math.min(existingItem.quantity + nextItem.quantity, stock);

        const updatedItems = state.items.map(item =>
          item.cartKey === nextItem.cartKey
            ? { ...item, ...nextItem, stock_quantity: stock, quantity: newQuantity }
            : item
        )
        return calculateTotals({ ...state, items: updatedItems })
      }

      // Initial add: clamp to stock (should be 1 usually, but just in case)
      const initialQuantity = Math.min(nextItem.quantity, nextItem.stock_quantity);
      if (initialQuantity < 1) return state; // Can't add if stock is 0

      const newItems = [...state.items, { ...nextItem, quantity: initialQuantity }]
      return calculateTotals({ ...state, items: newItems })
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.cartKey !== action.payload)
      return calculateTotals({ ...state, items: newItems })
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload.cartKey })
      }

      const item = state.items.find(i => i.cartKey === action.payload.cartKey);
      // If item not found or stock_quantity is missing, default to the requested quantity
      const maxQuantity = item ? item.stock_quantity : action.payload.quantity;
      const finalQuantity = Math.min(action.payload.quantity, maxQuantity);

      const updatedItems = state.items.map(item =>
        item.cartKey === action.payload.cartKey
          ? { ...item, quantity: finalQuantity }
          : item
      )
      return calculateTotals({ ...state, items: updatedItems })
    }

    case 'CLEAR_CART':
      return { items: [], total: 0, itemCount: 0, discountAmount: 0, discountedTotal: 0 }

    case 'APPLY_COUPON': {
      // Calculate total first
      const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      let discountAmount = 0;
      if (action.payload.type === 'percentage') {
        discountAmount = total * (action.payload.discount / 100);
      } else { // fixed_amount
        discountAmount = Math.min(action.payload.discount, total); // Cap at total
      }

      return {
        ...state,
        couponCode: action.payload.code,
        discountAmount,
        discountedTotal: total - discountAmount
      };
    }

    case 'REMOVE_COUPON': {
      const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      return {
        ...state,
        couponCode: undefined,
        discountAmount: 0,
        discountedTotal: total
      };
    }

    default:
      return state
  }
}

function calculateTotals(state: CartState): CartState {
  const total = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0)

  // If there's a coupon, apply discount logic
  let discountAmount = 0;
  let discountedTotal = total;
  if (state.couponCode && state.discountAmount > 0) {
    discountAmount = state.discountAmount;
    discountedTotal = total - discountAmount;
  }

  return { ...state, total, itemCount, discountAmount, discountedTotal }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    itemCount: 0,
    discountAmount: 0,
    discountedTotal: 0
  })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('open-store-cart')
    if (savedCart) {
      const cartData = JSON.parse(savedCart)
      cartData.items.forEach((item: any) => {
        // Ensure price is a number when loading from localStorage
        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price)
        const selectedVariants = Array.isArray(item.selectedVariants) ? item.selectedVariants : []
        dispatch({
          type: 'ADD_ITEM',
          payload: {
            id: item.id,
            name: item.name,
            price,
            image_url: item.image_url,
            stock_quantity: item.stock_quantity || 10, // Default to 10 if missing
            variantLabel: item.variantLabel,
            selectedVariants,
            quantity: item.quantity || 1,
            cartKey: item.cartKey || buildCartItemKey(item.id, selectedVariants),
          }
        })
      })
    }
  }, [])

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('open-store-cart', JSON.stringify(state))
  }, [state])

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
