import { json, type RequestHandler } from '@sveltejs/kit';
import { db, productsTable } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { UpdateProductBody } from '$lib/api-zod/api';
import { formatProduct } from '$lib/server/products';

export const GET: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id!, 10);
	const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
	if (!product) return json({ error: 'Product not found' }, { status: 404 });
	return json(await formatProduct(product));
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (!['owner', 'superadmin'].includes(me.role)) return json({ error: 'Forbidden' }, { status: 403 });

	const id = parseInt(params.id!, 10);
	const body = await request.json();
	const parsed = UpdateProductBody.safeParse(body);
	if (!parsed.success) return json({ error: parsed.error.message }, { status: 400 });

	const updateData: any = { ...parsed.data };
	if (parsed.data.commissionRate != null) updateData.commissionRate = String(parsed.data.commissionRate);
	if (parsed.data.subscriptionPrice != null) updateData.subscriptionPrice = String(parsed.data.subscriptionPrice);
	if (parsed.data.leadBounty !== undefined)
		updateData.leadBounty = parsed.data.leadBounty != null ? String(parsed.data.leadBounty) : null;
	if (parsed.data.platformFeeRate != null) updateData.platformFeeRate = String(parsed.data.platformFeeRate);

	const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
	if (!product) return json({ error: 'Product not found' }, { status: 404 });

	return json(await formatProduct(product));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (!['owner', 'superadmin'].includes(me.role)) return json({ error: 'Forbidden' }, { status: 403 });

	const id = parseInt(params.id!, 10);
	const [product] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
	if (!product) return json({ error: 'Product not found' }, { status: 404 });

	return new Response(null, { status: 204 });
};
