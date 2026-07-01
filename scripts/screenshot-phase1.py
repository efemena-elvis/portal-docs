from playwright.sync_api import sync_playwright
import os

output_dir = os.path.join(os.path.dirname(__file__), '..', 'screenshots', 'phase1')
os.makedirs(output_dir, exist_ok=True)

pages = [
    ('http://localhost:3000/', 'home.png'),
    ('http://localhost:3000/get-started', 'get-started.png'),
    ('http://localhost:3000/accept-payments/accept-payments-overview', 'accept-payments-overview.png'),
    ('http://localhost:3000/accept-payments/mobile-money-checkout/initialize-payment', 'endpoint-initialize-payment.png'),
    ('http://localhost:3000/webhooks/webhooks-overview', 'webhooks-overview.png'),
    ('http://localhost:3000/reference/errors', 'reference-errors.png'),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 1440, 'height': 900})

    for url, filename in pages:
        page.goto(url)
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)
        page.screenshot(path=os.path.join(output_dir, filename), full_page=False)
        print(f'Screenshot: {filename}')

    browser.close()
