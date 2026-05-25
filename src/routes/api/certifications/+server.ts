import { json, type RequestHandler } from '@sveltejs/kit';
import { db, certificationsTable, usersTable, productsTable } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });

	let certs;
	if (me.role === 'rep') {
		certs = await db.select().from(certificationsTable).where(eq(certificationsTable.repId, me.id));
	} else {
		certs = await db.select().from(certificationsTable);
	}

	const result = await Promise.all(
		certs.map(async (c) => {
			const [rep] = await db
				.select({ name: usersTable.name })
				.from(usersTable)
				.where(eq(usersTable.id, c.repId));
			const [product] = await db
				.select({ name: productsTable.name })
				.from(productsTable)
				.where(eq(productsTable.id, c.productId));
			return {
				id: c.id,
				repId: c.repId,
				repName: rep?.name ?? 'Unknown',
				productId: c.productId,
				productName: product?.name ?? 'Unknown',
				status: c.status,
				score: c.score,
				createdAt: c.createdAt.toISOString()
			};
		})
	);

	return json(result);
};
