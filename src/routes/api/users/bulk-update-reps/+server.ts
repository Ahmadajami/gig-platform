import { json, type RequestHandler } from '@sveltejs/kit';
import { db, usersTable } from '$lib/server/db';
import { inArray } from 'drizzle-orm';
import { formatUser, getRepRewardBalance } from '$lib/server/users';

export const POST: RequestHandler = async ({ request, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (!['owner', 'superadmin'].includes(me.role)) return json({ error: 'Forbidden' }, { status: 403 });

	const { repIds, area, salesTarget } = await request.json();
	if (!Array.isArray(repIds) || repIds.length === 0) {
		return json({ error: 'repIds must be a non-empty array' }, { status: 400 });
	}

	const updateData: any = {};
	if (area !== undefined) updateData.area = area;
	if (salesTarget !== undefined) updateData.salesTarget = salesTarget != null ? String(salesTarget) : null;

	if (Object.keys(updateData).length === 0) {
		return json({ error: 'No fields to update' }, { status: 400 });
	}

	const users = await db
		.update(usersTable)
		.set(updateData)
		.where(inArray(usersTable.id, repIds))
		.returning();

	const result = await Promise.all(
		users.map(async (u) => {
			const balance = u.role === 'rep' ? await getRepRewardBalance(u.id) : 0;
			return formatUser(u, balance);
		})
	);
	return json(result);
};
