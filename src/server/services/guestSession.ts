import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import type { IUser } from '../../types';

export const GUEST_SESSION_COOKIE = 'erudit_guest_session';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export interface GuestSession {
	token: string;
	user: IUser;
	expiresAt: number;
}

const sessions = new Map<string, GuestSession>();

function createUserId() {
	return crypto.randomUUID();
}

function createToken() {
	return crypto.randomBytes(32).toString('hex');
}

function normalizeName(name?: string) {
	const normalized = name?.trim().replace(/\s+/g, ' ');
	return normalized?.slice(0, 32) || 'Guest';
}

export function issueGuestSession(name?: string): GuestSession {
	const token = createToken();
	const session: GuestSession = {
		token,
		user: { id: createUserId(), name: normalizeName(name) },
		expiresAt: Date.now() + SESSION_TTL_MS,
	};

	sessions.set(token, session);
	return session;
}

export function resolveGuestSession(token?: string): GuestSession | undefined {
	if (!token) {
		return undefined;
	}

	const session = sessions.get(token);
	if (!session || session.expiresAt <= Date.now()) {
		sessions.delete(token);
		return undefined;
	}

	return session;
}

export function setGuestName(session: GuestSession, name?: string) {
	console.log('Setting guest name:', name);
	Object.assign(session.user, { name: normalizeName(name) });
}

export function getCookieValue(request: Request, cookieName: string) {
	const cookies = request.headers.cookie?.split(';') ?? [];
	const cookie = cookies.find((value) => value.trim().startsWith(`${cookieName}=`));
	return cookie?.trim().slice(cookieName.length + 1);
}

export function ensureGuestSession(request: Request, response: Response, next: NextFunction) {
	let session = resolveGuestSession(getCookieValue(request, GUEST_SESSION_COOKIE));

	if (!session) {
		session = issueGuestSession();
		const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
		const cookieHeader = [
			`${GUEST_SESSION_COOKIE}=${session.token}`,
			`Max-Age=${SESSION_TTL_MS / 1000}`,
			'HttpOnly',
			'SameSite=Lax',
			secure.slice(2),
		]
			.filter(Boolean)
			.join('; ');
		response.setHeader('Set-Cookie', cookieHeader);
	}

	response.locals.guestSession = session;
	next();
}
