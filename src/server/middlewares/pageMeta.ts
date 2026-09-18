import type { Request, Response, NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';

type ManifestEntry = {
	initial?: {
		js?: string[];
		css?: string[];
	};
};

type AssetManifest = {
	entries?: Record<string, ManifestEntry>;
	[key: string]: string | string[] | Record<string, ManifestEntry> | undefined;
};

function getManifestAssets(manifest: AssetManifest) {
	const assets = manifest.entries
		? Object.values(manifest.entries).flatMap((entry) => [
				...(entry.initial?.js ?? []),
				...(entry.initial?.css ?? []),
			])
		: Object.values(manifest).filter((asset): asset is string => typeof asset === 'string');

	return assets.filter((assetPath) => !assetPath.includes('.hot-update.'));
}

function pageMeta(_req: Request, res: Response, next: NextFunction) {
	const manifestPath = path.resolve(__dirname, '../client/manifest.json');
	const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as AssetManifest;
	const title = 'Document';
	const assetPrefix = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';

	const assets: Record<string, string[]> = {
		scripts: [],
		styles: [],
		rest: [],
	};

	getManifestAssets(manifest).forEach((assetPath) => {
		const resolvedAssetPath = `${assetPrefix}${assetPath}`;
		const ext = path.extname(resolvedAssetPath);

		switch (ext) {
			case '.js':
				assets.scripts.push(resolvedAssetPath);
				break;
			case '.css':
				assets.styles.push(resolvedAssetPath);
				break;
			default:
				assets.rest.push(resolvedAssetPath);
		}
	});

	res.locals.title = title;
	res.locals.assets = assets;

	next();
}

export default pageMeta;
