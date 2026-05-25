import { json, type RequestHandler } from '@sveltejs/kit';
import { db, leadsTable, productsTable, platformSettingsTable } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { formatLead } from '$lib/server/leads';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (!['owner', 'superadmin'].includes(me.role)) return json({ error: 'Forbidden' }, { status: 403 });

	const id = parseInt(params.id!, 10);
	const [existingLead] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
	if (!existingLead) return json({ error: 'Lead not found' }, { status: 404 });

	const body = await request.json().catch(() => ({}));
	const isFreeTrialLead = body.freeTrial === true;

	let commissionAmount = 0;
	let platformFeeAmount = 0;

	if (!isFreeTrialLead) {
		const [product] = await db.select().from(productsTable).where(eq(productsTable.id, existingLead.productId));
		if (product) {
			const rewardStructure = product.rewardStructure ?? 'per_subscription';
			const prodPlatformFeeRate = parseFloat(String(product.platformFeeRate ?? '0'));

			if (rewardStructure === 'per_lead') {
				commissionAmount = Math.round(parseFloat(String(product.leadBounty ?? '0')));
			} else {
				const subPrice = parseFloat(String(product.subscriptionPrice ?? '0'));
				const rate = parseFloat(String(product.commissionRate));
				commissionAmount = Math.round((subPrice * rate) / 100);
			}

			// Platform fee: either product-specific rate or global
			let feeRate = prodPlatformFeeRate;
			if (feeRate === 0) {
				const [settings] = await db.select().from(platformSettingsTable);
				feeRate = parseFloat(String(settings?.platformFeeRate ?? '0'));
			}
			platformFeeAmount = Math.round((commissionAmount * feeRate) / 100);
		}
	}

	const [lead] = await db
		.update(leadsTable)
		.set({
			status: 'approved',
			commission: String(commissionAmount),
			platformFee: String(platformFeeAmount),
			isFreeTrialLead
		})
		.where(eq(leadsTable.id, id))
		.returning();

	return json(await formatLead(lead));
};
