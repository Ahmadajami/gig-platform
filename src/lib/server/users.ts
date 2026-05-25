import { db, usersTable, leadsTable } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';

export async function getRepRewardBalance(repId: number): Promise<number> {
	const approvedLeads = await db
		.select({ commission: leadsTable.commission })
		.from(leadsTable)
		.where(and(eq(leadsTable.repId, repId), eq(leadsTable.status, 'approved')));
	return approvedLeads.reduce((sum, l) => sum + parseFloat(String(l.commission ?? '0')), 0);
}

export function formatUser(user: any, rewardBalance = 0) {
	return {
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
	};
}
