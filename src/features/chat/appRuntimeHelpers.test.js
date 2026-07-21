import { describe, expect, it } from 'vitest';
import { encryptMessage } from '../../utils/encryption';
import {
    deriveSharedRoomId,
    getGroupRoleLabel,
    getRouteChatId,
    getSyncHealthLabel,
    isRecoverableSendError,
    mapLiveMessageToUiMessage,
    mapQueuedMessageToUiMessage,
    normalizeReactionCount,
    parseChatDateTime,
    pseudonymFromUid,
    shouldHideConversationMessage,
    sortMembersByRole,
    timestampToMillis,
    toChatDate,
    toChatTime
} from './appRuntimeHelpers';

describe('timestampToMillis', () => {
    it('returns 0 for nullish input', () => {
        expect(timestampToMillis(null)).toBe(0);
        expect(timestampToMillis(undefined)).toBe(0);
        expect(timestampToMillis('')).toBe(0);
    });

    it('passes through numeric input', () => {
        expect(timestampToMillis(123456)).toBe(123456);
    });

    it('parses valid date strings and rejects invalid ones', () => {
        expect(timestampToMillis('2024-01-01T00:00:00.000Z')).toBe(Date.parse('2024-01-01T00:00:00.000Z'));
        expect(timestampToMillis('not-a-date')).toBe(0);
    });

    it('reads Firestore-style Timestamp objects via toMillis/toDate', () => {
        expect(timestampToMillis({ toMillis: () => 42 })).toBe(42);
        expect(timestampToMillis({ toDate: () => new Date(99) })).toBe(99);
    });
});

describe('parseChatDateTime', () => {
    it('returns null when date or time text is missing', () => {
        expect(parseChatDateTime('', '10:00')).toBeNull();
        expect(parseChatDateTime('01/02/2024', '')).toBeNull();
    });

    it('returns an invalid Date when the date text has no numeric parts', () => {
        const result = parseChatDateTime('not-a-date', '10:00');
        expect(result).toBeInstanceOf(Date);
        expect(Number.isNaN(result.getTime())).toBe(true);
    });

    it('parses dd/mm/yyyy with a 12-hour time and meridiem', () => {
        const result = parseChatDateTime('05/03/2024', '02:30 pm');
        expect(result).toBeInstanceOf(Date);
        expect(result.getDate()).toBe(5);
        expect(result.getMonth()).toBe(2);
        expect(result.getFullYear()).toBe(2024);
        expect(result.getHours()).toBe(14);
        expect(result.getMinutes()).toBe(30);
    });

    it('expands a two-digit year into the 2000s', () => {
        const result = parseChatDateTime('05-03-24', '9:00');
        expect(result.getFullYear()).toBe(2024);
    });

    it('falls back to midnight when the time text does not match', () => {
        const result = parseChatDateTime('05/03/2024', 'garbage');
        expect(result).toBeInstanceOf(Date);
        expect(result.getDate()).toBe(5);
    });
});

describe('toChatDate / toChatTime', () => {
    it('formats a valid date as dd/mm/yyyy', () => {
        expect(toChatDate(new Date(2024, 2, 5))).toBe('05/03/2024');
    });

    it('falls back to today for an invalid date value', () => {
        const formatted = toChatDate('not-a-date');
        expect(formatted).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it('returns a placeholder time for an invalid date value', () => {
        expect(toChatTime('not-a-date')).toBe('--:--');
    });

    it('formats a valid time', () => {
        expect(toChatTime(new Date(2024, 0, 1, 9, 5))).toMatch(/^\d{1,2}:\d{2}\s?[ap]m$/);
    });
});

describe('isRecoverableSendError', () => {
    it('treats known Firestore transient error codes as recoverable', () => {
        expect(isRecoverableSendError({ code: 'unavailable' })).toBe(true);
        expect(isRecoverableSendError({ code: 'deadline-exceeded' })).toBe(true);
    });

    it('treats network-flavored messages as recoverable', () => {
        expect(isRecoverableSendError({ message: 'The client is offline.' })).toBe(true);
        expect(isRecoverableSendError({ message: 'Request timed out' })).toBe(true);
    });

    it('treats an unrelated error as non-recoverable', () => {
        expect(isRecoverableSendError({ code: 'permission-denied', message: 'Missing or insufficient permissions.' })).toBe(false);
    });

    it('treats a missing/empty error as non-recoverable', () => {
        expect(isRecoverableSendError(undefined)).toBe(false);
    });
});

describe('normalizeReactionCount', () => {
    it('counts array-union style values by length', () => {
        expect(normalizeReactionCount(['a', 'b', 'c'])).toBe(3);
        expect(normalizeReactionCount([])).toBe(0);
    });

    it('floors positive numeric values', () => {
        expect(normalizeReactionCount(2.9)).toBe(2);
    });

    it('clamps negative, NaN, or non-numeric values to 0', () => {
        expect(normalizeReactionCount(-5)).toBe(0);
        expect(normalizeReactionCount('not-a-number')).toBe(0);
        expect(normalizeReactionCount(undefined)).toBe(0);
    });
});

describe('getSyncHealthLabel', () => {
    it('prioritizes offline over everything else', () => {
        expect(getSyncHealthLabel({ isOnline: false, isLoading: true, hasError: true })).toBe('Offline');
    });

    it('reports degraded when online but errored', () => {
        expect(getSyncHealthLabel({ isOnline: true, isLoading: false, hasError: true })).toBe('Degraded');
    });

    it('reports syncing when loading without error', () => {
        expect(getSyncHealthLabel({ isOnline: true, isLoading: true, hasError: false })).toBe('Syncing');
    });

    it('reports live when online, idle, and healthy', () => {
        expect(getSyncHealthLabel({ isOnline: true, isLoading: false, hasError: false })).toBe('Live');
    });
});

describe('getGroupRoleLabel / sortMembersByRole', () => {
    it('labels known roles and defaults unknown roles to Member', () => {
        expect(getGroupRoleLabel('owner')).toBe('Owner');
        expect(getGroupRoleLabel('ADMIN')).toBe('Admin');
        expect(getGroupRoleLabel('guest')).toBe('Member');
        expect(getGroupRoleLabel(undefined)).toBe('Member');
    });

    it('sorts owner, then admin, then member, treating unknown roles as member', () => {
        const members = [
            { id: 'm', role: 'member' },
            { id: 'o', role: 'owner' },
            { id: 'x', role: 'unknown' },
            { id: 'a', role: 'admin' }
        ];
        expect(sortMembersByRole(members).map((m) => m.id)).toEqual(['o', 'a', 'm', 'x']);
    });

    it('does not mutate the input array', () => {
        const members = [{ id: 'm', role: 'member' }, { id: 'o', role: 'owner' }];
        const sorted = sortMembersByRole(members);
        expect(sorted).not.toBe(members);
        expect(members[0].id).toBe('m');
    });
});

describe('pseudonymFromUid / deriveSharedRoomId / getRouteChatId', () => {
    it('falls back to "Member" for an empty uid', () => {
        expect(pseudonymFromUid('')).toBe('Member');
        expect(pseudonymFromUid(undefined)).toBe('Member');
    });

    it('derives a pseudonym from the trailing characters of a uid', () => {
        expect(pseudonymFromUid('user-abcd1234')).toBe('Member 1234');
    });

    it('derives a stable non-empty room id from a secret and falls back for empty input', () => {
        expect(deriveSharedRoomId('')).toBe('shared-room');
        const id = deriveSharedRoomId('my-secret');
        expect(id).toMatch(/^shared-[a-z0-9]+$/);
        expect(deriveSharedRoomId('my-secret')).toBe(id);
    });

    it('extracts the chat id segment from a route path', () => {
        expect(getRouteChatId('/chat/abc-123')).toBe('abc-123');
        expect(getRouteChatId('/chat/abc%20123')).toBe('abc 123');
        expect(getRouteChatId('/home')).toBe('');
    });
});

describe('shouldHideConversationMessage', () => {
    it('never hides non-system messages', () => {
        expect(shouldHideConversationMessage({ uid: 'ai-assistant', message: 'Key points: foo' })).toBe(false);
    });

    it('never hides system messages from senders other than the AI assistant', () => {
        expect(shouldHideConversationMessage({ uid: 'someone-else', isSystem: true, message: 'Key points: foo' })).toBe(false);
    });

    it('hides AI-assistant system summaries matching known markers', () => {
        expect(shouldHideConversationMessage({ uid: 'ai-assistant', isSystem: true, message: 'Participants: A, B' })).toBe(true);
    });

    it('does not hide AI-assistant system messages without a summary marker', () => {
        expect(shouldHideConversationMessage({ uid: 'ai-assistant', isSystem: true, message: 'Hello there' })).toBe(false);
    });
});

describe('mapQueuedMessageToUiMessage', () => {
    it('maps a queued entry with a plaintext preview and no secret needed', () => {
        const entry = {
            id: 'q1',
            clientId: 'client-1',
            uid: 'user-1',
            sender: 'Alice',
            previewText: 'hello world',
            createdAtMs: 1700000000000,
            payload: { type: 'text' }
        };
        const mapped = mapQueuedMessageToUiMessage(entry, 'secret');

        expect(mapped.id).toBe('queued-client-1');
        expect(mapped.sender).toBe('Alice');
        expect(mapped.uid).toBe('user-1');
        expect(mapped.message).toBe('hello world');
        expect(mapped.deliveryStatus).toBe('queued');
        expect(mapped.offlineQueued).toBe(true);
        expect(mapped.deliveredTo).toEqual({ 'user-1': true });
        expect(mapped.readBy).toEqual({ 'user-1': true });
        expect(mapped.reactions).toEqual({});
    });

    it('falls back to a pseudonym and placeholder text when sender/preview are missing and decryption fails', () => {
        const entry = {
            id: 'q2',
            uid: 'user-abcd1234',
            createdAtMs: 1700000000000,
            payload: { text: 'not-valid-ciphertext', type: 'text' }
        };
        const mapped = mapQueuedMessageToUiMessage(entry, 'secret');

        expect(mapped.sender).toBe('Member 1234');
        expect(mapped.message).toBe('[Queued encrypted message]');
    });

    it('decrypts the preview text when no plaintext preview is stored', () => {
        const cipher = encryptMessage('secret payload', 'shared-secret');
        const entry = {
            id: 'q3',
            uid: 'user-1',
            createdAtMs: 1700000000000,
            payload: { text: cipher, type: 'text' }
        };
        const mapped = mapQueuedMessageToUiMessage(entry, 'shared-secret');
        expect(mapped.message).toBe('secret payload');
    });
});

describe('mapLiveMessageToUiMessage', () => {
    const baseEntry = { id: 'm1', uid: 'user-1', text: 'hello', type: 'text' };

    it('maps an unencrypted message and defaults missing collections safely', () => {
        const mapped = mapLiveMessageToUiMessage(baseEntry, 'secret', 'user-1', () => 'Alice');

        expect(mapped.firestoreId).toBe('m1');
        expect(mapped.message).toBe('hello');
        expect(mapped.encrypted).toBe(false);
        expect(mapped.decryptionError).toBe(false);
        expect(mapped.deliveredTo).toEqual({});
        expect(mapped.readBy).toEqual({});
        expect(mapped.reactions).toEqual({});
        expect(mapped.hiddenForCurrentUser).toBe(false);
    });

    it('marks a decryption failure instead of throwing', () => {
        const entry = { ...baseEntry, text: 'not-valid-ciphertext', encrypted: true };
        const mapped = mapLiveMessageToUiMessage(entry, 'secret', 'user-1', () => 'Alice');

        expect(mapped.decryptionError).toBe(true);
        expect(mapped.message).toBe('[Unable to decrypt message]');
    });

    it('derives sent/delivered/read status only for the viewer\'s own messages', () => {
        const entry = {
            ...baseEntry,
            deliveredTo: { 'user-1': true, 'user-2': true },
            readBy: { 'user-2': true }
        };

        const asSender = mapLiveMessageToUiMessage(entry, 'secret', 'user-1', () => 'Alice');
        expect(asSender.deliveryStatus).toBe('read');

        const asOther = mapLiveMessageToUiMessage(entry, 'secret', 'user-2', () => 'Alice');
        expect(asOther.deliveryStatus).toBeNull();
    });

    it('respects per-viewer deletedFor hiding', () => {
        const entry = { ...baseEntry, deletedFor: { 'user-1': true } };
        const mapped = mapLiveMessageToUiMessage(entry, 'secret', 'user-1', () => 'Alice');
        expect(mapped.hiddenForCurrentUser).toBe(true);
    });

    it('falls back to a pseudonym when no sender label resolver result is available', () => {
        const mapped = mapLiveMessageToUiMessage(baseEntry, 'secret', 'user-1', () => null);
        expect(mapped.sender).toBe(pseudonymFromUid('user-1'));
    });
});
