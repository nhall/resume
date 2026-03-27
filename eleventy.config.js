import * as sass from 'sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import pxtorem from 'postcss-pxtorem';
import cssnano from 'cssnano';
import path from 'node:path';

export default function (eleventyConfig) {
	// Disable Nunjucks autoescaping — data contains trusted HTML (e.g. certifications)
	eleventyConfig.setNunjucksEnvironmentOptions({
		autoescape: false,
	});
	const isProduction = process.env.NODE_ENV === 'production';

	// SCSS as custom template extension
	eleventyConfig.addTemplateFormats('scss');
	eleventyConfig.addExtension('scss', {
		outputFileExtension: 'css',

		compile: async function (inputContent, inputPath) {
			// Skip partials
			if (path.basename(inputPath).startsWith('_')) {
				return;
			}

			const result = sass.compile(inputPath, {
				loadPaths: ['src/css', 'node_modules'],
			});

			const plugins = [autoprefixer()];

			if (isProduction) {
				plugins.push(
					pxtorem({
						propList: [
							'font-size',
							'line-height',
							'letter-spacing',
							'*margin*',
							'*padding*',
							'*width*',
							'*height*',
						],
						replace: false,
						rootValue: 16,
					}),
					cssnano(),
				);
			}

			const processed = await postcss(plugins).process(result.css, {
				from: inputPath,
			});

			return async () => processed.css;
		},
	});

	// Passthrough static files
	eleventyConfig.addPassthroughCopy('images');
	eleventyConfig.addPassthroughCopy('js');
	eleventyConfig.addPassthroughCopy('robots.txt');

	// Dev server config
	eleventyConfig.setServerOptions({
		port: 3000,
	});

	return {
		dir: {
			input: 'src',
			output: '_site',
			data: '../_data',
		},
		templateFormats: ['njk', 'scss'],
		htmlTemplateEngine: 'njk',
	};
}
