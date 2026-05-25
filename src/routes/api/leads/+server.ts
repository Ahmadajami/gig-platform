import { json, type RequestHandler } from '@sveltejs/kit';
import { db, leadsTable, certificationsTable } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { CreateLeadBody } from '$lib/api-zod/api';
import { formatLead } from '$lib/server/leads';

export const GET: RequestHandler = async ({ url, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });

	const statusFilter = url.searchParams.get('status');

	let leads;
	if (me.role === 'rep') {
		leads = statusFilter
			? await db
					.select()
					.from(leadsTable)
					.where(and(eq(leadsTable.repId, me.id), eq(leadsTable.status, statusFilter as any)))
			: await db.select().from(leadsTable).where(eq(leadsTable.repId, me.id));
	} else {
		leads = statusFilter
			? await db
					.select()
					.from(leadsTable)
					.where(eq(leadsTable.status, statusFilter as any))
			: await db.select().from(leadsTable);
	}

	const result = await Promise.all(leads.map(formatLead));
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (me.role !== 'rep') return json({ error: 'Only reps can submit leads' }, { status: 403 });

	const body = await request.json();
	const parsed = CreateLeadBody.safeParse(body);
	if (!parsed.success) return json({ error: parsed.error.message }, { status: 400 });

	const [cert] = await db
		.select()
		.from(certificationsTable)
		.where(
			and(
				eq(certificationsTable.repId, me.id),
				eq(certificationsTable.productId, parsed.data.productId),
				eq(certificationsTable.status, 'active')
			)
		);

	if (!cert) {
		return json({ error: 'You must be certified for this product to submit leads' }, { status: 403 });
	}

	const [lead] = await db
		.insert(leadsTable)
		.values({
			repId: me.id,
			productId: parsed.data.productId,
			contactName: parsed.data.contactName,
			contactEmail: parsed.data.contactEmail ?? null,
			contactPhone: parsed.data.contactPhone ?? null,
			notes: parsed.data.notes ?? null,
			status: 'pending',
			isFreeTrialLead: false
		})
		.returning();

	return json(await formatLead(lead), { status: 201 });
};
