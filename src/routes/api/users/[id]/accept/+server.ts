import { json, type RequestHandler } from '@sveltejs/kit';
import { db, usersTable, certificationsTable } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { formatUser, getRepRewardBalance } from '$lib/server/users';

export const POST: RequestHandler = async ({ params, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (!['owner', 'superadmin'].includes(me.role)) return json({ error: 'Forbidden' }, { status: 403 });

	const id = parseInt(params.id!, 10);
	const [user] = await db
		.update(usersTable)
		.set({ status: 'active' })
		.where(and(eq(usersTable.id, id), eq(usersTable.status, 'pending_interview')))
		.returning();

	if (!user) return json({ error: 'User not found or not in pending_interview status' }, { status: 404 });

	await db
		.update(certificationsTable)
		.set({ status: 'active' })
		.where(and(eq(certificationsTable.repId, id), eq(certificationsTable.status, 'pending_interview')));

	const balance = await getRepRewardBalance(user.id);
	return json(formatUser(user, balance));
};
