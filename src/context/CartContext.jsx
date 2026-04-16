import { createContext, useReducer, useCallback, useMemo } from 'react';

export const CartContext = createContext(null);

// ─── Action Types ─────────────────────────────────────────────────────────────
const ADD_ITEM    = 'ADD_ITEM';
const REMOVE_ITEM = 'REMOVE_ITEM';
const UPDATE_QTY  = 'UPDATE_QTY';
const CLEAR_CART  = 'CLEAR_CART';

// ─── Reducer ──────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case ADD_ITEM: {
      const existing = state.find((i) => i.id === action.payload.id);
      if (existing) {
        return state.map((i) =>
          i.id === action.payload.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...state, { ...action.payload, qty: 1 }];
    }

    case REMOVE_ITEM:
      return state.filter((i) => i.id !== action.payload);

    case UPDATE_QTY:
      if (action.payload.qty < 1) {
        return state.filter((i) => i.id !== action.payload.id);
      }
      return state.map((i) =>
        i.id === action.payload.id ? { ...i, qty: action.payload.qty } : i
      );

    case CLEAR_CART:
      return [];

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);

  // Derived values — memoised to avoid re-renders
  const cartCount = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  );

  const cartTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.qty, 0),
    [items]
  );

  // Actions
  const addToCart = useCallback(
    (product) => dispatch({ type: ADD_ITEM, payload: product }),
    []
  );

  const removeFromCart = useCallback(
    (id) => dispatch({ type: REMOVE_ITEM, payload: id }),
    []
  );

  const updateQty = useCallback(
    (id, qty) => dispatch({ type: UPDATE_QTY, payload: { id, qty } }),
    []
  );

  const clearCart = useCallback(
    () => dispatch({ type: CLEAR_CART }),
    []
  );

  const value = useMemo(
    () => ({ items, cartCount, cartTotal, addToCart, removeFromCart, updateQty, clearCart }),
    [items, cartCount, cartTotal, addToCart, removeFromCart, updateQty, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
