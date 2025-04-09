import { test, expect } from '@playwright/test';
import tags from '../tests/test-data/tags.json';

test.beforeEach(async({ page }) => {
  //mocking API responses
  await page.route('*/**/api/tags', async (route) => {
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })
  //navigating to the page
  await page.goto('https://conduit.bondaracademy.com/');
});


test('has title', async ({ page }) => {
    await page.route('*/**/api/articles*', async (route) => {
        const response = await route.fetch()
        const responseBody = await response.json()
    
        responseBody.articles[0].title = "Test MOCK Title"
        responseBody.articles[0].description = "Test MOCK Description"
    
        await route.fulfill({
          response,
          body: JSON.stringify(responseBody),
        });
    
    });
      await page.getByText('Global Feed').click();
      //checking the title of the page
      await expect(page.locator('.navbar-brand')).toHaveText('conduit');
      //asserting the article list
      await expect(page.locator('app-article-list h1').first()).toContainText('Test MOCK Title');
      await expect(page.locator('app-article-list p').first()).toContainText('Test MOCK Description');

});

test ('delete article', async ({ page, request }) => {
    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', { 
        data: {
            "article": {
                "title": "Test Title2",
                "description": "Test Description2",
                "body": "Test Body2",
                "tagList": ["test2"]
            }
        },
    })
    expect(articleResponse.status()).toEqual(201)

    await page.getByText('Global Feed').click()
    await page.getByText('Test Title2').click()
    await page.getByRole('button', { name: 'Delete Article' }).first().click()

    await expect(page.locator('app-article-list h1').first()).not.toContainText('Test Title2')
    
})


test('create article', async ({ page, request }) => {
  
  await page.getByText('New Article').click()
  await page.getByRole('textbox', { name: 'Article Title' }).fill('Playwright Test Title')
  await page.getByRole('textbox', { name: 'What\'s this article about?' }).fill('Playwright Test Description')
  await page.getByRole('textbox', { name: 'Write your article (in markdown)' }).fill('Playwright Test Body')
  
  await page.getByRole('button', { name: 'Publish Article' }).click()
  const articleResponse = await page.waitForResponse('**/api/articles/**' )
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug

  
  await expect(page.locator('app-article-page')).toContainText('Playwright Test Title')

  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').first()).toContainText('Playwright Test Title')



  const deleteArcticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {

  })
  expect(deleteArcticleResponse.status()).toEqual(204)

})
