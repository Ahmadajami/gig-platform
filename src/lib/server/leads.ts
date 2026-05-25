import { db, usersTable, productsTable } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export async function formatLead(lead: any) {
	const [rep] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, lead.repId));
	const [product] = await db.select({ name: productsTable.name }).from(productsTable).where(eq(productsTable.id, lead.productId));
	return {
		id: lead.id,
		repId: lead.repId,
		repName: rep?.name ?? 'Unknown',
		productId: lead.productId,
		productName: product?.name ?? 'Unknown',
		contactName: lead.contactName,
		contactEmail: lead.contactEmail ?? null,
		contactPhone: lead.contactPhone ?? null,
		notes: lead.notes ?? null,
		status: lead.status,
		commission: lead.commission != null ? parseFloat(String(lead.commission)) : null,
		platformFee: lead.platformFee != null ? parseFloat(String(lead.platformFee)) : null,
		isFreeTrialLead: lead.isFreeTrialLead ?? false,
		createdAt: lead.createdAt.toISOString()
	};
}
