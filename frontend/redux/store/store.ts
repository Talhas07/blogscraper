import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Local storage for persistence
import userReducer from "./slices/userSlice";
import assessmentReducer from "./slices/AssessmentSlice";

const persistConfig = {
  key: "auth",
  storage, // Persists Redux state across refreshes
  whitelist: ["token", "user"], // Only store the token, not user details
};

const persistedAuthReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedAuthReducer,
    assessment: assessmentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }), // Required for redux-persist
});

// Create a persistor to persist the store
export const persistor = persistStore(store);

// Define types for state and dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
