import { test, expect } from '@playwright/test';
import tags from '../tests/test-data/tags.json';


test.beforeEach(async({ page }) => {
  //mocking API responses
  await page.route('*/**/api/tags', async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })
  //modify the response of the API 
  await page.route('*/**/api/articles*', async (route) => {
    const response = await route.fetch()
    const responseBody = await response.json()

    responseBody.articles[0].title = "Test Title"
    responseBody.articles[0].description = "Test Description"

    await route.fulfill({
      response,
      body: JSON.stringify(responseBody),
    });

  });
  //navigating to the page
  await page.goto('https://conduit.bondaracademy.com/');
});


test('has Title', async ({ page }) => {
  //checking the title of the page
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  //asserting the article list
  await expect(page.locator('app-article-list h1').first()).toContainText('Test Title');
  await expect(page.locator('app-article-list p').first()).toContainText('Test Description');

});