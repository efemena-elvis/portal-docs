from playwright.sync_api import sync_playwright
import os

output_dir = os.path.join(os.path.dirname(__file__), '..', 'screenshots', 'phase1')
os.makedirs(output_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.goto('http://localhost:3000/')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(500)
    page.keyboard.press('Control+KeyK')
    page.wait_for_timeout(500)
    page.screenshot(path=os.path.join(output_dir, 'search-modal.png'))
    browser.close()
