import { json, type RequestHandler } from '@sveltejs/kit';
import { db, leadsTable } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	let rewardBalance = 0;
	if (user.role === 'rep') {
		const approvedLeads = await db
			.select({ commission: leadsTable.commission })
			.from(leadsTable)
			.where(eq(leadsTable.repId, user.id));

		rewardBalance = approvedLeads
			.filter((l) => l.commission != null)
			.reduce((sum, l) => sum + parseFloat(String(l.commission ?? '0')), 0);
	}

	return json({
		id: user.id,
		name: user.name,
		phone: user.phone ?? null,
		email: user.email ?? null,
		role: user.role,
		status: user.status,
		area: user.area ?? null,
		salesTarget: user.salesTarget != null ? parseFloat(String(user.salesTarget)) : null,
		rewardBalance,
		createdAt: user.createdAt.toISOString()
	});
};
