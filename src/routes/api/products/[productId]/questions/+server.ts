import { json, type RequestHandler } from '@sveltejs/kit';
import { db, questionsTable } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { CreateQuestionBody } from '$lib/api-zod/api';

export const GET: RequestHandler = async ({ params }) => {
	const productId = parseInt(params.productId!, 10);
	const questions = await db.select().from(questionsTable).where(eq(questionsTable.productId, productId));
	return json(
		questions.map((q) => ({
			id: q.id,
			productId: q.productId,
			text: q.text,
			options: q.options,
			correctIndex: q.correctIndex,
			createdAt: q.createdAt.toISOString()
		}))
	);
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (!['owner', 'superadmin'].includes(me.role)) return json({ error: 'Forbidden' }, { status: 403 });

	const productId = parseInt(params.productId!, 10);
	const body = await request.json();
	const parsed = CreateQuestionBody.safeParse(body);
	if (!parsed.success) return json({ error: parsed.error.message }, { status: 400 });

	const [question] = await db
		.insert(questionsTable)
		.values({ ...parsed.data, productId })
		.returning();

	return json(
		{
			id: question.id,
			productId: question.productId,
			text: question.text,
			options: question.options,
			correctIndex: question.correctIndex,
			createdAt: question.createdAt.toISOString()
		},
		{ status: 201 }
	);
};
