import fs from 'fs';
import path from 'path';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import cssnano from 'cssnano';
import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';

const cssInputPath  = path.resolve('./src/styles/main.css');
const cssOutputPath = path.resolve('./dist/styles/main.css');

const processor = postcss([
  tailwindcss(),
  cssnano({ preset: 'default' }),
]);

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.on('eleventy.before', async () => {
    const outputDir = path.dirname(cssOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const css = fs.readFileSync(cssInputPath, 'utf8');
    const result = await processor.process(css, {
      from: cssInputPath,
      to:   cssOutputPath,
    });
    fs.writeFileSync(cssOutputPath, result.css);
  });

  eleventyConfig.addPassthroughCopy('src/assets');

  eleventyConfig.addFilter('currentYear', () => new Date().getFullYear());

  return {
    dir: {
      input:    'src',
      output:   'dist',
      includes: '_includes',
      layouts:  '_includes/layouts',
    },
    templateFormats: ['njk', 'md', 'html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
}
