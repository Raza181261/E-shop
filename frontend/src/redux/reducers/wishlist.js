import { createReducer } from "@reduxjs/toolkit";

const initialState = {
  wishlist: localStorage.getItem("wishlistItems")
    ? JSON.parse(localStorage.getItem("wishlistItems"))
    : [],
};

// export const cartReducer = createReducer(initialState, {
//     addToCart: (state, action) => {
//         const item = action.payload;
//         const isItemExist = state.cart.find((i) => i._id === item._id);
//         if(isItemExist){
//             return{
//                 ...state,
//                 cart: state.cart.map((i) => (i._id === isItemExist._id ? item:i  )),
//             };
//         }else{
//             return{
//                 ...state,
//                 cart:[...state.cart, item],
//             };
//         };
//     },

//     removeFromCart: (state, action) => {
//         return{
//             ...state,
//             cart: state.cart.filter((i) => i._id !== action.payload),
//         }
//     },
// })

export const wishlistReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("addToWishlist", (state, action) => {
      const item = action.payload;
      const isItemExist = state.wishlist.find((i) => i._id === item._id);
      if (isItemExist) {
        state.wishlist = state.wishlist.map((i) =>
          i._id === isItemExist._id ? item : i
        );
      } else {
        state.wishlist.push(item);
      }
    })
    .addCase("removeFromWishlist", (state, action) => {
      state.wishlist = state.wishlist.filter((i) => i._id !== action.payload);
    });
});
