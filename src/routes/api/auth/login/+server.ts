import { json, type RequestHandler } from '@sveltejs/kit';
import { db, usersTable } from '$lib/server/db';
import { simpleHash, normalizePhone } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const { phone, password } = await request.json();

	if (!phone || !password) {
		return json({ error: 'Phone and password are required' }, { status: 400 });
	}

	if (typeof phone !== 'string' || typeof password !== 'string') {
		return json({ error: 'Invalid input' }, { status: 400 });
	}

	if (phone.includes('-')) {
		return json(
			{
				error:
					'Phone number must not contain hyphens. Use spaces instead (e.g. +963 964 931 267)'
			},
			{ status: 400 }
		);
	}

	const normalizedInput = normalizePhone(phone);
	const allUsers = await db.select().from(usersTable);
	const user = allUsers.find((u) => {
		if (!u.phone) return false;
		return normalizePhone(u.phone) === normalizedInput;
	});

	if (!user) {
		console.log('no user')
		return json({ error: 'Invalid credentials' }, { status: 401 });
	}

	// const hash = simpleHash(password);
	// if (user.passwordHash !== String(hash)) {
	// 	console.log('no password match',user.passwordHash)
	// 	return json({ error: 'Invalid credentials' }, { status: 401 });
	// }

	cookies.set('userId', String(user.id), {
		path: '/',
		httpOnly: true,
		secure: false, // Set to true in production
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 7 // 1 week
	});

	return json({
		user: {
			id: user.id,
			name: user.name,
			phone: user.phone ?? null,
			email: user.email ?? null,
			role: user.role,
			status: user.status,
			area: user.area ?? null,
			salesTarget: user.salesTarget != null ? parseFloat(String(user.salesTarget)) : null,
			rewardBalance: 0,
			createdAt: user.createdAt.toISOString()
		}
	});
};
