import type { Handle } from '@sveltejs/kit';
import { db, usersTable } from '$lib/server/db';
import { eq } from 'drizzle-orm';

export const handle: Handle = async ({ event, resolve }) => {
	const userIdStr = event.cookies.get('userId');
	const userId = userIdStr ? parseInt(userIdStr, 10) : null;

	if (userId && !isNaN(userId)) {
		const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
		event.locals.user = user || null;
	} else {
		event.locals.user = null;
	}

	const response = await resolve(event);
	return response;
};
