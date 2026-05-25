import { json, type RequestHandler } from '@sveltejs/kit';
import {
	db,
	certificationsTable,
	questionsTable,
	platformSettingsTable,
	usersTable
} from '$lib/server/db';
import { eq, and } from 'drizzle-orm';
import { SubmitQuizBody } from '$lib/api-zod/api';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (me.role !== 'rep') return json({ error: 'Only reps can take quizzes' }, { status: 403 });

	const productId = parseInt(params.productId!, 10);
	const body = await request.json();
	const parsed = SubmitQuizBody.safeParse(body);
	if (!parsed.success) return json({ error: parsed.error.message }, { status: 400 });

	const [existing] = await db
		.select()
		.from(certificationsTable)
		.where(and(eq(certificationsTable.repId, me.id), eq(certificationsTable.productId, productId)));

	if (existing) {
		return json({
			passed: true,
			score: existing.score,
			total: 0,
			certificationStatus: 'already_certified'
		});
	}

	const questions = await db.select().from(questionsTable).where(eq(questionsTable.productId, productId));
	if (questions.length === 0) {
		return json({ error: 'No questions for this product' }, { status: 400 });
	}

	const { answers } = parsed.data;
	let correct = 0;
	for (const answer of answers) {
		const question = questions.find((q) => q.id === answer.questionId);
		if (question && question.correctIndex === answer.selectedIndex) correct++;
	}

	const passed = correct >= Math.ceil(questions.length * 0.7);

	if (!passed) {
		return json({
			passed: false,
			score: correct,
			total: questions.length,
			certificationStatus: 'failed'
		});
	}

	let [settings] = await db.select().from(platformSettingsTable);
	if (!settings) {
		[settings] = await db
			.insert(platformSettingsTable)
			.values({ onboardingMode: 'open_access' })
			.returning();
	}

	const certStatus =
		settings.onboardingMode === 'interview_required' ? 'pending_interview' : 'active';

	await db.insert(certificationsTable).values({
		repId: me.id,
		productId,
		status: certStatus,
		score: correct
	});

	if (certStatus === 'pending_interview' && me.status === 'active') {
		await db.update(usersTable).set({ status: 'pending_interview' }).where(eq(usersTable.id, me.id));
	}

	return json({
		passed: true,
		score: correct,
		total: questions.length,
		certificationStatus: certStatus
	});
};
