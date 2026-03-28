import CryptoJS from 'crypto-js';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createTransform, FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import appSessionReducer from './appSessionSlice';

const persistSecret = import.meta.env.VITE_REDUX_PERSIST_SECRET || 'whatsapp-chat-ui-persist';

const encryptedSessionTransform = createTransform(
    (inboundState) => {
        try {
            return CryptoJS.AES.encrypt(JSON.stringify(inboundState), persistSecret).toString();
        } catch {
            return inboundState;
        }
    },
    (outboundState) => {
        if (typeof outboundState !== 'string') {
            return outboundState;
        }

        try {
            const decrypted = CryptoJS.AES.decrypt(outboundState, persistSecret).toString(CryptoJS.enc.Utf8);
            return decrypted ? JSON.parse(decrypted) : undefined;
        } catch {
            return undefined;
        }
    },
    { whitelist: ['session'] }
);

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['session'],
    transforms: [encryptedSessionTransform]
};

const rootReducer = combineReducers({
    session: appSessionReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
            }
        })
});

export const persistor = persistStore(store);