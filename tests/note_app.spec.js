const { test, expect, describe, beforeEach } = require('@playwright/test')
const { loginWith, createNote  } = require('./helper')

describe('Note app', () => {
    beforeEach(async ({ page, request }) => {
        await request.post('http://localhost:3001/api/testing/reset')
        await request.post('http://localhost:3001/api/users', {
            data: {
                name: 'assil',
                username: 'altf4irl69',
                password: '692514'
            }
        })
        await page.goto('http://localhost:5173')
    })

    test('front page can be opened', async ({ page }) => {  
        const locator = await page.getByText('Notes')
        await expect(locator).toBeVisible()
        await expect(page.getByText('Note app, Department of Computer Science, University of Helsinki 2024')).toBeVisible()
    })

    test('login fails with wrong password', async ({ page }) => {
        await loginWith(page, 'altf4irl69', '1hasdfkhb')

        const errorDiv = await page.locator('.error')
        await expect(errorDiv).toContainText('Wrong username or password')
        await expect(errorDiv).toHaveCSS('border-style', 'solid')
        await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

        await expect(page.getByText('assil logged in')).not.toBeVisible()
    })

    test('user can login', async ({ page }) => {
        await loginWith(page, 'altf4irl69', '692514')
        await expect(page.getByText('assil logged in')).toBeVisible()
    })

    describe('when logged in', () => {
        beforeEach(async ({ page }) => {
            await loginWith(page, 'altf4irl69', '692514')
        })
    
        test('a new note can be created', async ({ page }) => {
            await createNote(page, 'a note created by playwright')
          await expect(page.getByText('a note created by playwright')).toBeVisible()
        })

        describe('and a note exists', () => {
            beforeEach(async ({ page }) => {
                await createNote(page, 'another note by playwright')
            })
        
            test('importance can be changed', async ({ page }) => {
              await page.getByRole('button', { name: 'make not important' }).click()
              await expect(page.getByText('make important')).toBeVisible()
            })
        })
    })  
})
