import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    authSession: null,
    chatMode: 'romantic',
    themePreference: 'dark',
    currentUser: 'You',
    lastRoomId: 'room1'
};

const appSessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setAuthSession(state, action) {
            const displayName = String(action.payload?.displayName || action.payload?.username || '').trim();
            const secret = String(action.payload?.secret || '').trim();

            if (!displayName || !secret) {
                state.authSession = null;
                return;
            }

            state.authSession = { displayName, secret };
            state.currentUser = displayName;
        },
        clearAuthSession(state) {
            state.authSession = null;
            state.currentUser = 'You';
            state.lastRoomId = 'room1';
        },
        setChatMode(state, action) {
            state.chatMode = action.payload === 'formal' ? 'formal' : 'romantic';
        },
        setThemePreference(state, action) {
            const nextTheme = action.payload;
            state.themePreference = ['light', 'dark', 'system'].includes(nextTheme) ? nextTheme : 'dark';
        },
        setCurrentUser(state, action) {
            const nextUser = String(action.payload || '').trim();
            state.currentUser = nextUser || 'You';
        },
        setLastRoomId(state, action) {
            const nextRoomId = String(action.payload || '').trim();
            state.lastRoomId = nextRoomId || 'room1';
        }
    }
});

export const { clearAuthSession, setAuthSession, setChatMode, setCurrentUser, setLastRoomId, setThemePreference } = appSessionSlice.actions;

export const selectAuthSession = (state) => state.session.authSession;
export const selectChatMode = (state) => state.session.chatMode;
export const selectThemePreference = (state) => state.session.themePreference;
export const selectCurrentUser = (state) => state.session.currentUser;
export const selectLastRoomId = (state) => state.session.lastRoomId;

export default appSessionSlice.reducer;