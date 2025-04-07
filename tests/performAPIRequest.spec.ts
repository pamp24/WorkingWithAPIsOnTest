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
  await page.goto('https://conduit.bondaracademy.com/')

  await page.getByText('Sign in').click()
  await page.getByRole('textbox', {name:"Email"}).fill('fotis@test.com')
  await page.getByRole('textbox', {name:"Password"}).fill('test')
    await page.getByRole('button', {name:"Sign in"}).click()
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
    await expect(page.locator('app-article-list p').first()).toContainText('Test MOCK   Description');

});

test ('delete article', async ({ page, request }) => {
    const response = await request.post('https://conduit-api.bondaracademy.com/api/users/login', {
        data: {
            "user":{
                "email": "fotis@test.com", "password": "test"}
        }
    })
    const responseBody = await response.json()
    const accessToken = responseBody.user.token
    
    const articleResponse = await request.post('https://conduit-api.bondaracademy.com/api/articles', { 
        data: {
            "article": {
                "title": "Test Title2",
                "description": "Test Description2",
                "body": "Test Body2",
                "tagList": ["test2"]
            }
        },
        headers: {
            'Authorization': `Token ${accessToken}`
        }
    })
    expect(articleResponse.status()).toEqual(201)

    await page.getByText('Global Feed').click()
    await page.getByText('Test Title2').click()
    await page.getByRole('button', { name: 'Delete Article' }).first().click()

    await expect(page.locator('app-article-list h1').first()).not.toContainText('Test Title2')
    
})