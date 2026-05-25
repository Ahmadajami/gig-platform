import { json, type RequestHandler } from '@sveltejs/kit';
import {
	db,
	usersTable,
	productsTable,
	leadsTable,
	certificationsTable,
	platformSettingsTable
} from '$lib/server/db';
import { eq, and, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });

	let [settings] = await db.select().from(platformSettingsTable);
	if (!settings) {
		[settings] = await db
			.insert(platformSettingsTable)
			.values({ onboardingMode: 'open_access', platformFeeRate: '0' })
			.returning();
	}

	const [repCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(usersTable)
		.where(eq(usersTable.role, 'rep'));
	const [pendingCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(usersTable)
		.where(and(eq(usersTable.role, 'rep'), eq(usersTable.status, 'pending_interview')));
	const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(productsTable);
	const [leadCount] = await db.select({ count: sql<number>`count(*)` }).from(leadsTable);
	const [pendingLeadCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(leadsTable)
		.where(eq(leadsTable.status, 'pending'));
	const [approvedLeadCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(leadsTable)
		.where(eq(leadsTable.status, 'approved'));

	// Global financials
	const allApprovedLeads = await db
		.select({ commission: leadsTable.commission, platformFee: leadsTable.platformFee })
		.from(leadsTable)
		.where(eq(leadsTable.status, 'approved'));
	const totalPayoutsToReps = allApprovedLeads.reduce(
		(s, l) => s + parseFloat(String(l.commission ?? '0')),
		0
	);
	const totalPlatformFees = allApprovedLeads.reduce(
		(s, l) => s + parseFloat(String(l.platformFee ?? '0')),
		0
	);

	const totalSalesVolume = totalPayoutsToReps + totalPlatformFees;

	const [totalLeadsGenerated] = await db.select({ count: sql<number>`count(*)` }).from(leadsTable);

	// Per-rep stats
	let rewardBalance = 0;
	let myCertifications = 0;
	let myPendingLeads = 0;
	let myApprovedLeads = 0;
	let totalPersonalProfit = 0;

	if (me.role === 'rep') {
		const approvedLeads = await db
			.select({ commission: leadsTable.commission })
			.from(leadsTable)
			.where(and(eq(leadsTable.repId, me.id), eq(leadsTable.status, 'approved')));
		rewardBalance = approvedLeads.reduce((sum, l) => sum + parseFloat(String(l.commission ?? '0')), 0);
		totalPersonalProfit = rewardBalance;

		const [certCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(certificationsTable)
			.where(and(eq(certificationsTable.repId, me.id), eq(certificationsTable.status, 'active')));
		myCertifications = Number(certCount?.count ?? 0);

		const [myPending] = await db
			.select({ count: sql<number>`count(*)` })
			.from(leadsTable)
			.where(and(eq(leadsTable.repId, me.id), eq(leadsTable.status, 'pending')));
		myPendingLeads = Number(myPending?.count ?? 0);

		const [myApproved] = await db
			.select({ count: sql<number>`count(*)` })
			.from(leadsTable)
			.where(and(eq(leadsTable.repId, me.id), eq(leadsTable.status, 'approved')));
		myApprovedLeads = Number(myApproved?.count ?? 0);
	}

	return json({
		totalReps: Number(repCount?.count ?? 0),
		pendingInterviews: Number(pendingCount?.count ?? 0),
		totalProducts: Number(productCount?.count ?? 0),
		totalLeads: Number(leadCount?.count ?? 0),
		pendingLeads: Number(pendingLeadCount?.count ?? 0),
		approvedLeads: Number(approvedLeadCount?.count ?? 0),
		rewardBalance,
		myCertifications,
		myPendingLeads,
		myApprovedLeads,
		onboardingMode: settings.onboardingMode,
		totalSalesVolume,
		totalPersonalProfit,
		totalPayoutsToReps,
		totalPlatformFees,
		totalLeadsGenerated: Number(totalLeadsGenerated?.count ?? 0)
	});
};
