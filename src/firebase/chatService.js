import {
    addDoc,
    collection,
    deleteDoc,
    deleteField,
    doc,
    getDocs,
    increment,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    startAfter,
    setDoc,
    updateDoc,
    writeBatch
} from 'firebase/firestore';
import { db } from './config';

const MESSAGE_LIMIT = 200;
const MESSAGE_PAGE_SIZE = 50;

function ensureDb() {
    if (!db) {
        throw new Error('Firebase is not configured. Add VITE_FIREBASE_* variables.');
    }
}

export function sanitizeRoomId(rawRoomId) {
    const safe = String(rawRoomId || 'room1')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-');

    return safe || 'room1';
}

function roomMessagesRef(roomId) {
    return collection(db, 'rooms', sanitizeRoomId(roomId), 'messages');
}

function roomTypingRef(roomId) {
    return collection(db, 'rooms', sanitizeRoomId(roomId), 'typing');
}

function roomUsersRef(roomId) {
    return collection(db, 'rooms', sanitizeRoomId(roomId), 'users');
}

async function deleteSnapshotDocs(snapshot) {
    if (!snapshot?.docs?.length) {
        return 0;
    }

    let batch = writeBatch(db);
    let pendingWrites = 0;
    let deletedCount = 0;

    for (const entry of snapshot.docs) {
        batch.delete(entry.ref);
        pendingWrites += 1;
        deletedCount += 1;

        if (pendingWrites >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            pendingWrites = 0;
        }
    }

    if (pendingWrites > 0) {
        await batch.commit();
    }

    return deletedCount;
}

async function deleteRefsInParallel(docRefs, chunkSize = 200) {
    let deletedCount = 0;

    for (let startIndex = 0; startIndex < docRefs.length; startIndex += chunkSize) {
        const currentChunk = docRefs.slice(startIndex, startIndex + chunkSize);
        await Promise.all(currentChunk.map((ref) => deleteDoc(ref)));
        deletedCount += currentChunk.length;
    }

    return deletedCount;
}

export function subscribeToRoomMessages(roomId, onNext, onError) {
    ensureDb();
    const q = query(roomMessagesRef(roomId), orderBy('createdAt', 'desc'), limit(MESSAGE_LIMIT));

    return onSnapshot(
        q,
        (snapshot) => {
            const messages = snapshot.docs
                .map((entry) => ({ id: entry.id, ...entry.data() }))
                .sort((a, b) => {
                    const aTime = a.createdAt?.toMillis?.() || 0;
                    const bTime = b.createdAt?.toMillis?.() || 0;
                    return aTime - bTime;
                });

            const oldestCursor = snapshot.docs[snapshot.docs.length - 1] || null;
            onNext(messages, {
                oldestCursor,
                hasMore: snapshot.size >= MESSAGE_LIMIT
            });
        },
        onError
    );
}

export async function fetchOlderRoomMessages(roomId, cursor, pageSize = MESSAGE_PAGE_SIZE) {
    ensureDb();

    if (!cursor) {
        return {
            messages: [],
            oldestCursor: null,
            hasMore: false
        };
    }

    const q = query(
        roomMessagesRef(roomId),
        orderBy('createdAt', 'desc'),
        startAfter(cursor),
        limit(pageSize)
    );

    const snapshot = await getDocs(q);
    const messages = snapshot.docs
        .map((entry) => ({ id: entry.id, ...entry.data() }))
        .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() || 0;
            const bTime = b.createdAt?.toMillis?.() || 0;
            return aTime - bTime;
        });

    return {
        messages,
        oldestCursor: snapshot.docs[snapshot.docs.length - 1] || cursor,
        hasMore: snapshot.size >= pageSize
    };
}

export async function clearRoomMessages(roomId) {
    ensureDb();

    const messagesSnapshot = await getDocs(roomMessagesRef(roomId));
    const messageRefs = messagesSnapshot.docs.map((entry) => entry.ref);

    if (!messageRefs.length) {
        return 0;
    }

    return deleteRefsInParallel(messageRefs);
}

export async function sendRoomMessage(roomId, payload) {
    ensureDb();

    const safeText = String(payload?.text || '').trim();
    const safeUid = String(payload?.uid || '').trim();
    const safeSenderEncrypted = String(payload?.senderEnc || '').trim();
    const safeType = payload?.type || 'text';
    const isEncrypted = Boolean(payload?.encrypted);

    if (!safeUid) {
        throw new Error('Authenticated uid is required.');
    }

    if (!safeText) {
        throw new Error('Message cannot be empty.');
    }

    if (safeText.length > 1200) {
        throw new Error('Message is too long (max 1200 chars).');
    }

    if (!isEncrypted) {
        throw new Error('Plain text messages are blocked. Encrypt before sending.');
    }

    await addDoc(roomMessagesRef(roomId), {
        text: safeText,
        sender: String(payload?.sender || '').trim() || null,
        senderEnc: safeSenderEncrypted || null,
        uid: safeUid,
        type: safeType,
        reactions: {},
        encrypted: true,
        cipherVersion: payload?.cipherVersion || null,
        deliveredTo: {
            [safeUid]: true
        },
        readBy: {
            [safeUid]: true
        },
        createdAt: serverTimestamp()
    });
}

export function subscribeTypingStatus(roomId, onNext, onError) {
    ensureDb();
    return onSnapshot(
        roomTypingRef(roomId),
        (snapshot) => {
            const typingMap = {};
            snapshot.forEach((entry) => {
                const data = entry.data() || {};
                typingMap[entry.id] = {
                    isTyping: Boolean(data.isTyping),
                    encryptedDisplayName: String(data.encryptedDisplayName || ''),
                    updatedAt: data.updatedAt || null
                };
            });
            onNext(typingMap);
        },
        onError
    );
}

export async function setTypingStatus(roomId, userId, isTyping, encryptedDisplayName = '') {
    ensureDb();
    const safeUserId = String(userId || '').trim();
    if (!safeUserId) {
        return;
    }

    await setDoc(
        doc(db, 'rooms', sanitizeRoomId(roomId), 'typing', safeUserId),
        {
            isTyping: Boolean(isTyping),
            encryptedDisplayName: String(encryptedDisplayName || ''),
            updatedAt: serverTimestamp()
        },
        { merge: true }
    );
}

export function subscribeRoomUsers(roomId, onNext, onError) {
    ensureDb();
    return onSnapshot(
        roomUsersRef(roomId),
        (snapshot) => {
            const usersMap = {};
            snapshot.forEach((entry) => {
                const data = entry.data() || {};
                usersMap[entry.id] = {
                    online: Boolean(data.online),
                    encryptedDisplayName: String(data.encryptedDisplayName || ''),
                    lastSeen: data.lastSeen || null
                };
            });
            onNext(usersMap);
        },
        onError
    );
}

export async function setRoomUserPresence(roomId, userId, online, encryptedDisplayName = '') {
    ensureDb();
    const safeUserId = String(userId || '').trim();
    if (!safeUserId) {
        return;
    }

    await setDoc(
        doc(db, 'rooms', sanitizeRoomId(roomId), 'users', safeUserId),
        {
            online: Boolean(online),
            encryptedDisplayName: String(encryptedDisplayName || ''),
            lastSeen: serverTimestamp()
        },
        { merge: true }
    );
}

export async function scrubLegacyRoomMetadata(roomId) {
    ensureDb();

    const safeRoomId = sanitizeRoomId(roomId);
    const messagesSnapshot = await getDocs(roomMessagesRef(safeRoomId));
    const usersSnapshot = await getDocs(roomUsersRef(safeRoomId));
    const typingSnapshot = await getDocs(roomTypingRef(safeRoomId));
    let batch = writeBatch(db);
    let pendingWrites = 0;
    let mutationCount = 0;

    const commitIfNeeded = async (force = false) => {
        if (!pendingWrites) {
            return;
        }

        if (pendingWrites >= 450 || force) {
            await batch.commit();
            batch = writeBatch(db);
            pendingWrites = 0;
        }
    };

    for (const entry of messagesSnapshot.docs) {
        const data = entry.data() || {};
        if ('sender' in data) {
            batch.update(doc(db, 'rooms', safeRoomId, 'messages', entry.id), {
                sender: deleteField()
            });
            mutationCount += 1;
            pendingWrites += 1;
            await commitIfNeeded();
        }
    }

    usersSnapshot.forEach((entry) => {
        const data = entry.data() || {};
        if ('name' in data || 'displayName' in data) {
            batch.update(doc(db, 'rooms', safeRoomId, 'users', entry.id), {
                name: deleteField(),
                displayName: deleteField()
            });
            mutationCount += 1;
            pendingWrites += 1;
        }
    });

    typingSnapshot.forEach((entry) => {
        const data = entry.data() || {};
        if ('displayName' in data) {
            batch.update(doc(db, 'rooms', safeRoomId, 'typing', entry.id), {
                displayName: deleteField()
            });
            mutationCount += 1;
            pendingWrites += 1;
        }
    });

    if (!mutationCount) {
        return 0;
    }

    await commitIfNeeded(true);
    return mutationCount;
}

export async function hardDeleteRoomData(roomId) {
    ensureDb();

    const safeRoomId = sanitizeRoomId(roomId);
    const [messagesSnapshot, typingSnapshot, usersSnapshot] = await Promise.all([
        getDocs(roomMessagesRef(safeRoomId)),
        getDocs(roomTypingRef(safeRoomId)),
        getDocs(roomUsersRef(safeRoomId))
    ]);

    let deletedCount = 0;
    deletedCount += await deleteSnapshotDocs(messagesSnapshot);
    deletedCount += await deleteSnapshotDocs(typingSnapshot);
    deletedCount += await deleteSnapshotDocs(usersSnapshot);

    await deleteDoc(doc(db, 'rooms', safeRoomId)).catch(() => {
        // Parent room doc may not exist; data removal still succeeds.
    });

    return deletedCount;
}

export async function addMessageReaction(roomId, messageId, emoji) {
    ensureDb();
    const safeMessageId = String(messageId || '').trim();
    const safeEmoji = String(emoji || '').trim();

    if (!safeMessageId || !safeEmoji) {
        return;
    }

    const reactionKey = `reactions.${safeEmoji}`;
    await updateDoc(doc(db, 'rooms', sanitizeRoomId(roomId), 'messages', safeMessageId), {
        [reactionKey]: increment(1)
    });
}

export async function markMessageDelivered(roomId, messageId, userId) {
    ensureDb();

    const safeMessageId = String(messageId || '').trim();
    const safeUserId = String(userId || '').trim();
    if (!safeMessageId || !safeUserId) {
        return;
    }

    await updateDoc(doc(db, 'rooms', sanitizeRoomId(roomId), 'messages', safeMessageId), {
        [`deliveredTo.${safeUserId}`]: true,
        deliveredAt: serverTimestamp()
    });
}

export async function markMessageRead(roomId, messageId, userId) {
    ensureDb();

    const safeMessageId = String(messageId || '').trim();
    const safeUserId = String(userId || '').trim();
    if (!safeMessageId || !safeUserId) {
        return;
    }

    await updateDoc(doc(db, 'rooms', sanitizeRoomId(roomId), 'messages', safeMessageId), {
        [`readBy.${safeUserId}`]: true,
        readAt: serverTimestamp()
    });
}
