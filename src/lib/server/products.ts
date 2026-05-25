import { db, productsTable, usersTable, questionsTable } from '$lib/server/db';
import { eq, sql } from 'drizzle-orm';

export async function formatProduct(product: any) {
	const [owner] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, product.ownerId));
	const qCount = await db.select({ count: sql<number>`count(*)` }).from(questionsTable).where(eq(questionsTable.productId, product.id));
	return {
		id: product.id,
		ownerId: product.ownerId,
		name: product.name,
		description: product.description,
		prerequisites: product.prerequisites,
		rewardStructure: product.rewardStructure ?? 'per_subscription',
		subscriptionPrice: parseFloat(String(product.subscriptionPrice ?? '0')),
		commissionRate: parseFloat(String(product.commissionRate)),
		leadBounty: product.leadBounty != null ? parseFloat(String(product.leadBounty)) : null,
		platformFeeRate: parseFloat(String(product.platformFeeRate ?? '0')),
		ownerName: owner?.name ?? null,
		questionCount: Number(qCount[0]?.count ?? 0),
		createdAt: product.createdAt.toISOString()
	};
}
