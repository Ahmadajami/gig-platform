import { json, type RequestHandler } from '@sveltejs/kit';
import { db, usersTable } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { simpleHash } from '$lib/server/auth';
import { formatUser, getRepRewardBalance } from '$lib/server/users';

export const GET: RequestHandler = async ({ url, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (!['owner', 'superadmin'].includes(me.role)) return json({ error: 'Forbidden' }, { status: 403 });

	const roleFilter = url.searchParams.get('role');
	const users = roleFilter
		? await db.select().from(usersTable).where(eq(usersTable.role, roleFilter as any))
		: await db.select().from(usersTable);

	const result = await Promise.all(
		users.map(async (u) => {
			const balance = u.role === 'rep' ? await getRepRewardBalance(u.id) : 0;
			return formatUser(u, balance);
		})
	);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	const me = locals.user;
	if (!me) return json({ error: 'Not authenticated' }, { status: 401 });
	if (me.role !== 'superadmin') return json({ error: 'Only superadmin can create users' }, { status: 403 });

	const { name, phone, email, password, role } = await request.json();
	if (!name || !phone || !password || !role) {
		return json({ error: 'name, phone, password, role are required' }, { status: 400 });
	}
	if (!['owner', 'rep'].includes(role)) {
		return json({ error: 'role must be owner or rep' }, { status: 400 });
	}

	const passwordHash = simpleHash(password);
	const [existing] = await db.select().from(usersTable).where(eq(usersTable.phone, phone.replace(/\s/g, '')));
	if (existing) return json({ error: 'Phone number already in use' }, { status: 409 });

	const [user] = await db
		.insert(usersTable)
		.values({
			name,
			phone: phone.replace(/\s/g, ''),
			email: email ?? null,
			passwordHash,
			role,
			status: 'active'
		})
		.returning();

	return json(formatUser(user, 0), { status: 201 });
};
