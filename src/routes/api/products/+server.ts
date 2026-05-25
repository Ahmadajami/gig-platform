import { json, type RequestHandler } from '@sveltejs/kit';
import { db, productsTable } from '$lib/server/db';
import { CreateProductBody } from '$lib/api-zod/api';
import { formatProduct } from '$lib/server/products';

export const GET: RequestHandler = async () => {
	const products = await db.select().from(productsTable).orderBy(productsTable.createdAt);
	const result = await Promise.all(products.map(formatProduct));
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (!['owner', 'superadmin'].includes(me.role)) return json({ error: 'Forbidden' }, { status: 403 });

	const body = await request.json();
	const parsed = CreateProductBody.safeParse(body);
	if (!parsed.success) return json({ error: parsed.error.message }, { status: 400 });

	const [product] = await db
		.insert(productsTable)
		.values({
			...parsed.data,
			ownerId: me.id,
			subscriptionPrice: String(parsed.data.subscriptionPrice ?? 0),
			commissionRate: String(parsed.data.commissionRate ?? 0),
			leadBounty: parsed.data.leadBounty != null ? String(parsed.data.leadBounty) : null,
			platformFeeRate: String(parsed.data.platformFeeRate ?? 0)
		})
		.returning();

	return json(await formatProduct(product), { status: 201 });
};
