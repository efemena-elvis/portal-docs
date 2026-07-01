from playwright.sync_api import sync_playwright
import os

OUTPUT_DIR = "screenshots/dark"
os.makedirs(OUTPUT_DIR, exist_ok=True)

URLS = [
    ("homepage", "/"),
    ("endpoint-auth", "/getting-started/authentication"),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.emulate_media(color_scheme="dark")
    for name, path in URLS:
        page.goto(f"http://localhost:3000{path}")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)
        screenshot_path = os.path.join(OUTPUT_DIR, f"{name}.png")
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Saved {screenshot_path}")
    page.close()

    browser.close()
