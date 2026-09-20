import asyncio
import re
from playwright.async_api import async_playwright

async def check_va():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        context = await b.new_context(viewport={'width': 1440, 'height': 900})
        await context.clear_cookies()
        page = await context.new_page()
        await page.goto('http://localhost:5173')
        await page.evaluate("() => localStorage.clear()")
        await page.reload(wait_until='networkidle')
        await page.wait_for_timeout(1500)
        btn = page.locator("button:has-text('Start Full Mock Test'), button:has-text('Start Test')").first
        if await btn.count() > 0:
            await btn.click()
            await page.wait_for_timeout(3000)

        # Click Question 17 (Para-Jumble)
        q17 = page.locator('.grid-cols-4 button', has_text=re.compile(r'^17$'))
        if await q17.count() > 0:
            await q17.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path='test_artifacts/screenshots/06_varc_va_q17.png')
            print('[OK] Captured 06_varc_va_q17.png')

        # Click Question 23 (Odd Sentence Out)
        q23 = page.locator('.grid-cols-4 button', has_text=re.compile(r'^23$'))
        if await q23.count() > 0:
            await q23.click()
            await page.wait_for_timeout(1000)
            await page.screenshot(path='test_artifacts/screenshots/07_varc_odd_q23.png')
            print('[OK] Captured 07_varc_odd_q23.png')

        await b.close()

if __name__ == '__main__':
    asyncio.run(check_va())
