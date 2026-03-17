import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { Playwright } from '@siteimprove/alfa-playwright';
import { Audit, Logging, Rules } from '@siteimprove/alfa-test-utils';

test('axe: page has no accessibility violations', async ({ page }) => {
	await page.goto('/');

	const results = await new AxeBuilder({ page }).analyze();

	expect(results.violations).toEqual([]);
});

test('siteimprove: page passes WCAG 2.2 AA checks', async ({ page }) => {
	await page.goto('/');

	const document = await page.evaluateHandle(() => window.document);
	const alfaPage = await Playwright.toPage(document);

	const alfaResult = await Audit.run(alfaPage, {
		rules: {
			include: Rules.aaFilter,
		},
	});

	Logging.fromAudit(alfaResult).print();

	const failingRules = alfaResult.resultAggregates.filter(
		(aggregate) => aggregate.failed > 0,
	);

	expect(failingRules.size, `${failingRules.size} failing accessibility rules`).toBe(0);
});
