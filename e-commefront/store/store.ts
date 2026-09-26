import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authReducer, { logoutUser } from "@/store/authSlice";
import productReducer from "@/store/productSlice";
import categoryReducer from "@/store/categorySlice";
import cartReducer from "@/store/cartSlice";
import favoriteReducer from "@/store/favoriteSlice";
import reviewReducer from "@/store/reviewSlice";
import orderReducer from "@/store/orderSlice";
import profileReducer from "@/store/profileSlice";
import contactReducer from "@/store/contactSlice";
import contactInboxReducer from "@/store/contactInboxSlice";
import { toastMiddleware } from "@/store/toastMiddleware";

const appReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  categories: categoryReducer,
  cart: cartReducer,
  favorites: favoriteReducer,
  reviews: reviewReducer,
  orders: orderReducer,
  profile: profileReducer,
  contact: contactReducer,
  contactInbox: contactInboxReducer,
});

export const makeStore = () =>
  configureStore({
    reducer: (state, action) => {
      if (logoutUser.fulfilled.match(action) || logoutUser.rejected.match(action)) {
        state = undefined;
      }
      return appReducer(state, action);
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(toastMiddleware),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
