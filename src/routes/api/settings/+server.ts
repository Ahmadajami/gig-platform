import { json, type RequestHandler } from '@sveltejs/kit';
import { db, platformSettingsTable } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { UpdatePlatformSettingsBody } from '$lib/api-zod/api';

async function getOrCreateSettings() {
	let [settings] = await db.select().from(platformSettingsTable);
	if (!settings) {
		[settings] = await db
			.insert(platformSettingsTable)
			.values({ onboardingMode: 'open_access', platformFeeRate: '0' })
			.returning();
	}
	return settings;
}

export const GET: RequestHandler = async () => {
	const settings = await getOrCreateSettings();
	return json({
		id: settings.id,
		onboardingMode: settings.onboardingMode,
		platformFeeRate: parseFloat(String(settings.platformFeeRate ?? '0')),
		updatedAt: settings.updatedAt.toISOString()
	});
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (me.role !== 'superadmin') return json({ error: 'Forbidden' }, { status: 403 });

	const body = await request.json();
	const parsed = UpdatePlatformSettingsBody.safeParse(body);
	if (!parsed.success) return json({ error: parsed.error.message }, { status: 400 });

	const current = await getOrCreateSettings();
	const updateData: any = {};
	if (parsed.data.onboardingMode != null) updateData.onboardingMode = parsed.data.onboardingMode;
	if (parsed.data.platformFeeRate != null) updateData.platformFeeRate = String(parsed.data.platformFeeRate);

	const [updated] = await db
		.update(platformSettingsTable)
		.set(updateData)
		.where(eq(platformSettingsTable.id, current.id))
		.returning();

	return json({
		id: updated.id,
		onboardingMode: updated.onboardingMode,
		platformFeeRate: parseFloat(String(updated.platformFeeRate ?? '0')),
		updatedAt: updated.updatedAt.toISOString()
	});
};
