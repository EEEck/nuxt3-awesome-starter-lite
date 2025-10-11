import { test, expect } from '@playwright/test'

test('grading wizard happy path', async ({ page }) => {
  await page.goto('/grading-wizard')

  await page.getByLabel('Profile ID').fill('demo-profile')
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.getByRole('heading', { name: 'Upload or paste a rubric' })).toBeVisible()
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.getByRole('heading', { name: 'Review rubric details' })).toBeVisible()
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.getByRole('heading', { name: 'Upload student answers' })).toBeVisible()
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.getByRole('heading', { name: 'Run automated grading' })).toBeVisible()
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.getByRole('heading', { name: 'Results summary' })).toBeVisible()
  await expect(page.getByText('Start over')).toBeVisible()
})
