import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';

const MIME = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
	'.ico': 'image/x-icon',
};

createServer(async (req, res) => {
	const pathname = new URL(req.url, 'http://localhost').pathname;
	const filePath = join('_site', pathname === '/' ? 'index.html' : pathname);
	try {
		const content = await readFile(filePath);
		res.setHeader('Content-Type', MIME[extname(filePath)] ?? 'application/octet-stream');
		res.end(content);
	} catch {
		res.writeHead(404);
		res.end('Not found');
	}
}).listen(3000);
