import { json, type RequestHandler } from '@sveltejs/kit';
import { db, leadsTable } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { formatLead } from '$lib/server/leads';

export const POST: RequestHandler = async ({ params, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (!['owner', 'superadmin'].includes(me.role)) return json({ error: 'Forbidden' }, { status: 403 });

	const id = parseInt(params.id!, 10);
	const [lead] = await db
		.update(leadsTable)
		.set({ status: 'rejected' })
		.where(eq(leadsTable.id, id))
		.returning();

	if (!lead) return json({ error: 'Lead not found' }, { status: 404 });
	return json(await formatLead(lead));
};
