from playwright.sync_api import sync_playwright
import os
import sys

OUTPUT_DIR = sys.argv[1] if len(sys.argv) > 1 else "screenshots/phase2"
os.makedirs(OUTPUT_DIR, exist_ok=True)

URLS = [
    ("homepage", "/"),
    ("endpoint-auth", "/getting-started/authentication"),
    ("guide-quickstart", "/getting-started/quick-start"),
    ("webhooks-overview", "/webhooks/webhooks-overview"),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    # Desktop
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    for name, path in URLS:
        page.goto(f"http://localhost:3000{path}")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)
        screenshot_path = os.path.join(OUTPUT_DIR, f"{name}.png")
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Saved {screenshot_path}")
    page.close()

    # Mobile homepage
    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto("http://localhost:3000/")
    mobile.wait_for_load_state("networkidle")
    mobile.wait_for_timeout(1000)
    mobile_path = os.path.join(OUTPUT_DIR, "homepage-mobile.png")
    mobile.screenshot(path=mobile_path, full_page=True)
    print(f"Saved {mobile_path}")
    mobile.close()

    browser.close()
