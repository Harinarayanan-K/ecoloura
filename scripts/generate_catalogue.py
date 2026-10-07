"""Generate the printable catalogue from the website's existing product data.

Run: python3 scripts/generate_catalogue.py
Then print public/catalogue/index.html to A4 PDF, with backgrounds enabled and
headers/footers disabled, saving public/downloads/ecoloura-product-catalogue.pdf.
"""
import json
from html import escape
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'src/data/productsData.ts').read_text()
products = json.loads(source.split('export const productsData: Product[] = ', 1)[1].split(';', 1)[0])
email = 'ecolourahotelsuppliers@gmail.com'
phone = '+91 85903 65077'
whatsapp = 'https://wa.me/918590365077?text=Hello%20Ecolour%C3%A0%2C%20please%20share%20a%20bulk%20amenities%20quotation.'


def image(product):
    return '<img src="..' + escape(product['image']) + '" alt="' + escape(product['name']) + '">'


def footer(page):
    return f'<footer><span>ECOLOURÀ / HOSPITALITY AMENITIES</span><span>PRODUCT COLLECTION · {page:02d} / 04</span></footer>'


style = '''
@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0;background:#e8e9e1}body{font-family:Arial,sans-serif;color:#284b3b;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{width:210mm;height:297mm;padding:17mm;position:relative;background:#f9f8f4;overflow:hidden;break-after:page;page-break-after:always}.page:last-child{break-after:auto;page-break-after:auto}.wordmark{font-family:Arial,sans-serif;font-size:37px;font-weight:600;letter-spacing:-2px;line-height:1}.brand-sub{font-size:7px;letter-spacing:2.6px;margin-top:10px}.eyebrow{font-size:8px;letter-spacing:2px;color:#7d8c68}.cover-title{font-family:Georgia,serif;font-size:56px;font-weight:400;line-height:1.08;letter-spacing:-2px;margin:46px 0 23px}.cover-title em,.title em{font-weight:400;color:#7b8562}.cover-intro{font-size:12px;line-height:1.9;color:#727e62;width:90%;margin-bottom:28px}.photo-band{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin:30px 0}.photo-band div{background:#e7e9e0;aspect-ratio:1/1}.photo-band img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}.cover-notes{display:flex;gap:28px;margin-top:26px;border-top:1px solid #d5ddc7;padding-top:25px}.cover-notes div{flex:1}.cover-notes h3{font-size:12px;font-weight:500;margin:0 0 10px}.cover-notes p{font-size:10px;line-height:1.8;color:#7b876b;margin:0}.cover-contact{margin-top:32px;padding:22px;background:#284b3b;color:#f7f8ed}.cover-contact strong{font-family:Georgia,serif;font-size:22px;font-weight:400;display:block;margin-bottom:9px}.cover-contact p{font-size:10px;line-height:1.8;margin:0}.cover-contact a{color:#f7f8ed;text-decoration:none}.cover-contact small{font-size:8px;color:#c7d3b8;display:block;margin-top:10px}footer{position:absolute;left:17mm;right:17mm;bottom:13mm;display:flex;justify-content:space-between;border-top:1px solid #d5ddc7;padding-top:14px;font-size:7px;letter-spacing:1px;color:#8f9a7f}.page-head{display:flex;justify-content:space-between;align-items:center;padding-bottom:25px;border-bottom:1px solid #d5ddc7}.page-head .wordmark{font-size:25px}.page-head .brand-sub{font-size:6px;margin-top:7px}.title{font-family:Georgia,serif;font-size:40px;font-weight:400;line-height:1.15;letter-spacing:-1px;margin:27px 0 13px}.page-intro{font-size:11px;line-height:1.8;color:#7b876b;margin:0 0 25px}.product-row{display:grid;grid-template-columns:180px 1fr;gap:26px;align-items:center;padding:15px 0;border-top:1px solid #d9dece;min-height:205px}.product-photo{width:180px;height:180px;background:#e7e9e0}.product-photo img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply}.product-number{font-size:8px;letter-spacing:1.5px;color:#99a288;margin-bottom:11px}.product-row h2{font-family:Georgia,serif;font-size:25px;line-height:1.2;font-weight:400;margin:0 0 12px}.product-row p{font-size:11px;line-height:1.85;color:#78856a;margin:0 0 13px}.product-note{font-size:8px;line-height:1.8;color:#6e805a;border-top:1px solid #d9dece;padding-top:11px}.product-link{display:inline-block;font-size:9px;color:#284b3b;margin-top:10px;text-decoration:none;border-bottom:1px solid #c4cfb5;padding-bottom:4px}.ordering-note{font-size:9px;line-height:1.8;background:#edf0e4;color:#738460;padding:14px 18px;margin-top:13px}@media screen{.page{margin:24px auto;box-shadow:0 3px 30px #0001}}@media print{html,body{background:#f9f8f4}.page{margin:0;box-shadow:none}}
'''
by_id = {product['id']: product for product in products}
cover_photos = ''.join('<div>' + image(by_id[key]) + '</div>' for key in ['dental-kit', 'vanity-kit', 'room-slippers'])
cover = f'''<section class="page cover"><div class="wordmark">ecolourà</div><div class="brand-sub">HOSPITALITY AMENITIES</div>
<h1 class="cover-title">Small details.<br><em>Lasting impressions.</em></h1>
<span class="eyebrow">THE GUEST ESSENTIALS COLLECTION</span><p class="cover-intro">Thoughtfully selected amenities for hotels, resorts, hospitals, and care establishments. Available for bulk supply and private-label enquiries.</p>
<div class="photo-band">{cover_photos}</div>
<div class="cover-notes"><div><h3>Everyday essentials</h3><p>Personal care, grooming, and in-room comfort, coordinated for your property.</p></div><div><h3>Distinctly your brand</h3><p>Discuss custom logo and packaging options for your guest-use products.</p></div><div><h3>A lasting partnership</h3><p>Bulk and recurring orders planned around your establishment’s requirements.</p></div></div>
<div class="cover-contact"><strong>Let’s create your collection.</strong><p><a href="tel:+918590365077">{phone}</a><br><a href="mailto:{email}">{email}</a></p><small>Share your products, quantities, branding needs, and delivery location for a quotation.</small></div>{footer(1)}</section>'''

categories = [
    ('personal-care', 'Personal care.', 'A thoughtful freshen-up.', 'A considered selection of everyday essentials for guest bathrooms and care establishments.'),
    ('grooming', 'Guest grooming.', 'A fresh start.', 'Convenient, individually presented essentials for the moments your guests need them.'),
    ('in-room', 'In-room comfort.', 'Feel a little more at home.', 'The practical finishing touches that bring comfort and convenience to a stay.'),
]
pages = [cover]
for page_number, (category, title, subtitle, description) in enumerate(categories, 2):
    rows = []
    for index, product in enumerate([p for p in products if p['category'] == category], 1):
        subject = 'Quotation enquiry: ' + product['name']
        from urllib.parse import quote
        link = 'mailto:' + email + '?subject=' + quote(subject) + '&body=' + quote('Hello Ecolourà,\nPlease share product options and a bulk quotation for ' + product['name'] + '.\nQuantity:\nDelivery location:\nBranding requirements:')
        rows.append(f'''<article class="product-row"><div class="product-photo">{image(product)}</div><div><div class="product-number">0{index} / {escape(product['categoryLabel']).upper()}</div><h2>{escape(product['name'])}</h2><p>{escape(product['fullDesc'])}</p><div class="product-note">Institutional bulk supply · Branding options on enquiry<br>MOQ, packaging, and delivery confirmed with quotation.</div><a class="product-link" href="{escape(link)}">Enquire about this product ↗</a></div></article>''')
    pages.append(f'''<section class="page"><div class="page-head"><div><div class="wordmark">ecolourà</div><div class="brand-sub">HOSPITALITY AMENITIES</div></div><span class="eyebrow">THE ORIGINAL PRODUCT COLLECTION</span></div><h1 class="title">{escape(title)}<br><em>{escape(subtitle)}</em></h1><p class="page-intro">{escape(description)}</p>{''.join(rows)}<div class="ordering-note">For a tailored quotation: <a href="{whatsapp}" style="color:inherit">WhatsApp {phone}</a> or email <a href="mailto:{email}" style="color:inherit">{email}</a>.<br>Product photos show our original collection. Confirm current availability and specifications with our team.</div>{footer(page_number)}</section>''')
html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Ecolourà — Product Catalogue</title><style>' + style + '</style></head><body>' + ''.join(pages) + '</body></html>'
out = root / 'public/catalogue/index.html'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(html)
print(f'Created {out.relative_to(root)}: 4 pages, 9 products, original image paths.')
