import { json, type RequestHandler } from '@sveltejs/kit';
import { db, questionsTable } from '$lib/server/db';
import { eq, and } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (!['owner', 'superadmin'].includes(me.role)) return json({ error: 'Forbidden' }, { status: 403 });

	const productId = parseInt(params.productId!, 10);
	const questionId = parseInt(params.questionId!, 10);

	const [q] = await db
		.delete(questionsTable)
		.where(and(eq(questionsTable.id, questionId), eq(questionsTable.productId, productId)))
		.returning();

	if (!q) return json({ error: 'Question not found' }, { status: 404 });

	return new Response(null, { status: 204 });
};
