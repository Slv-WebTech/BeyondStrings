/**
 * Unified chats handler — merges join-request and resync-membership into one
 * Vercel serverless function to stay within the Hobby plan 12-function limit.
 *
 * Routes (set via vercel.json rewrites → ?handler=<name>):
 *   POST /api/chats/join-request      → handler=join-request
 *   POST /api/chats/resync-membership → handler=resync-membership
 */
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { authenticate } from '../_lib/rbac.js';
import { getFirebaseAdminApp } from '../_lib/firebaseAdmin.js';

// ── join-request helpers ──────────────────────────────────────────────────────

function isModeratorForChat(chatData, uid, role) {
    if (!chatData || !uid) return false;
    if (role === 'admin') return true;
    const ownerId = String(chatData.ownerId || chatData.createdBy || '').trim();
    if (ownerId && ownerId === uid) return true;
    const memberRoles = chatData.memberRoles && typeof chatData.memberRoles === 'object' ? chatData.memberRoles : {};
    const actorRole = String(memberRoles[uid] || '').toLowerCase();
    return actorRole === 'owner' || actorRole === 'admin';
}

async function handleJoinRequest(req, res, user, adminDb) {
    const safeChatId = String(req.body?.chatId || '').trim();
    const safeRequestId = String(req.body?.requestId || '').trim();
    const action = String(req.body?.action || '').trim().toLowerCase();

    if (!safeChatId || !safeRequestId) {
        return res.status(400).json({ error: 'chatId and requestId are required.' });
    }
    if (action !== 'approve' && action !== 'reject') {
        return res.status(400).json({ error: 'action must be approve or reject.' });
    }

    const chatRef = adminDb.collection('chats').doc(safeChatId);
    const chatSnapshot = await chatRef.get();
    if (!chatSnapshot.exists) {
        return res.status(404).json({ error: 'Chat not found.' });
    }

    const chatData = chatSnapshot.data() || {};
    if (!isModeratorForChat(chatData, user.uid, user.role)) {
        return res.status(403).json({ error: 'Only group owner/admin can moderate requests.' });
    }

    const requestRef = adminDb.collection('chats').doc(safeChatId).collection('join_requests').doc(safeRequestId);
    const requestSnapshot = await requestRef.get();
    if (!requestSnapshot.exists) {
        return res.status(404).json({ error: 'Join request not found.' });
    }

    const requestData = requestSnapshot.data() || {};
    const targetUid = String(requestData.uid || safeRequestId).trim();
    const username = String(requestData.username || 'Member').trim() || 'Member';

    if (!targetUid) {
        return res.status(400).json({ error: 'Invalid request user id.' });
    }

    if (action === 'reject') {
        await requestRef.delete();
        return res.status(200).json({ ok: true, action: 'reject', chatId: safeChatId, requestId: safeRequestId });
    }

    // approve
    const batch = adminDb.batch();
    batch.set(
        chatRef,
        {
            members: FieldValue.arrayUnion(targetUid),
            [`memberUsernames.${targetUid}`]: username,
            updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
    );
    batch.set(
        adminDb.collection('user_chats').doc(targetUid),
        {
            chatIds: FieldValue.arrayUnion(safeChatId),
            updatedAt: FieldValue.serverTimestamp()
        },
        { merge: true }
    );
    batch.delete(requestRef);
    await batch.commit();

    return res.status(200).json({
        ok: true,
        action: 'approve',
        chatId: safeChatId,
        requestId: safeRequestId,
        memberUid: targetUid
    });
}

// ── resync-membership helpers ─────────────────────────────────────────────────

function dedupe(ids = []) {
    return Array.from(new Set(ids.map((id) => String(id || '').trim()).filter(Boolean)));
}

async function handleResyncMembership(req, res, user, adminDb) {
    const uid = String(user.uid || '').trim();

    const [memberChatsSnapshot, ownerChatsSnapshot, creatorChatsSnapshot] = await Promise.all([
        adminDb.collection('chats').where('members', 'array-contains', uid).limit(500).get(),
        adminDb.collection('chats').where('ownerId', '==', uid).limit(500).get(),
        adminDb.collection('chats').where('createdBy', '==', uid).limit(500).get()
    ]);

    const memberIds = memberChatsSnapshot.docs.map((doc) => doc.id);
    const ownerIds = ownerChatsSnapshot.docs.map((doc) => doc.id);
    const creatorIds = creatorChatsSnapshot.docs.map((doc) => doc.id);
    const mergedIds = dedupe([...memberIds, ...ownerIds, ...creatorIds]);

    const repairTargets = dedupe([...ownerIds, ...creatorIds]);
    if (repairTargets.length) {
        const batch = adminDb.batch();
        repairTargets.forEach((chatId) => {
            const chatRef = adminDb.collection('chats').doc(chatId);
            const isOwnerChat = ownerIds.includes(chatId);
            batch.set(
                chatRef,
                {
                    members: FieldValue.arrayUnion(uid),
                    ...(isOwnerChat ? { [`memberRoles.${uid}`]: 'owner' } : {}),
                    updatedAt: FieldValue.serverTimestamp()
                },
                { merge: true }
            );
        });
        await batch.commit();
    }

    await adminDb
        .collection('user_chats')
        .doc(uid)
        .set(
            {
                chatIds: mergedIds,
                updatedAt: FieldValue.serverTimestamp()
            },
            { merge: true }
        );

    return res.status(200).json({
        ok: true,
        uid,
        totalChats: mergedIds.length,
        memberChatCount: memberIds.length,
        ownerChatCount: ownerIds.length,
        creatorChatCount: creatorIds.length,
        repairedOwnerMembershipCount: repairTargets.length
    });
}

// ── Main handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const user = await authenticate(req, res);
    if (!user) return;

    // Resolve which sub-handler to use. vercel.json rewrites inject ?handler=<name>.
    // Fallback: parse the last path segment from the original URL header.
    const handlerParam = String(req.query?.handler || '').trim().toLowerCase()
        || String(req.headers?.['x-original-path'] || req.url || '').split('/').pop().split('?')[0].toLowerCase();

    try {
        const app = getFirebaseAdminApp();
        const adminDb = getFirestore(app);

        if (handlerParam === 'join-request') {
            return await handleJoinRequest(req, res, user, adminDb);
        }
        if (handlerParam === 'resync-membership') {
            return await handleResyncMembership(req, res, user, adminDb);
        }

        return res.status(400).json({ error: 'Unknown handler. Use join-request or resync-membership.' });
    } catch (error) {
        return res.status(500).json({
            error: 'Internal server error.',
            details: String(error?.message || error || 'Unknown error')
        });
    }
}
