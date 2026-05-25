import { json, type RequestHandler } from '@sveltejs/kit';
import { db, usersTable } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { formatUser, getRepRewardBalance } from '$lib/server/users';
import { UpdateUserBody } from '$lib/api-zod/api';

export const GET: RequestHandler = async ({ params, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });

	const id = parseInt(params.id!, 10);
	if (me.role === 'rep' && me.id !== id) return json({ error: 'Forbidden' }, { status: 403 });

	const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
	if (!user) return json({ error: 'User not found' }, { status: 404 });

	const balance = user.role === 'rep' ? await getRepRewardBalance(user.id) : 0;
	return json(formatUser(user, balance));
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (!['owner', 'superadmin'].includes(me.role)) return json({ error: 'Forbidden' }, { status: 403 });

	const id = parseInt(params.id!, 10);
	const body = await request.json();
	const parsed = UpdateUserBody.safeParse(body);
	if (!parsed.success) return json({ error: parsed.error.message }, { status: 400 });

	const updateData: any = {};
	if (parsed.data.name != null) updateData.name = parsed.data.name;
	if (parsed.data.area !== undefined) updateData.area = parsed.data.area;
	if (parsed.data.salesTarget !== undefined) {
		updateData.salesTarget = parsed.data.salesTarget != null ? String(parsed.data.salesTarget) : null;
	}
	if (parsed.data.status != null) updateData.status = parsed.data.status;

	const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
	if (!user) return json({ error: 'User not found' }, { status: 404 });

	const balance = user.role === 'rep' ? await getRepRewardBalance(user.id) : 0;
	return json(formatUser(user, balance));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (me.role !== 'superadmin') return json({ error: 'Only superadmin can delete users' }, { status: 403 });

	const id = parseInt(params.id!, 10);
	if (id === me.id) return json({ error: 'Cannot delete yourself' }, { status: 400 });

	const [user] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
	if (!user) return json({ error: 'User not found' }, { status: 404 });

	return new Response(null, { status: 204 });
};
