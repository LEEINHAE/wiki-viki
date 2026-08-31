import postgres from 'postgres';
import { env } from '$env/dynamic/private';

let client;

export function db() {
	if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not configured.');
	client ??= postgres(env.DATABASE_URL, { max: 10, idle_timeout: 20 });
	return client;
}
