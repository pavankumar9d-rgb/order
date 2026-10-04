import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_distressed_text(text, font, fill_color, size=(2000, 320)):
    # Render text onto transparent surface
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Calculate bounding box to center text
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size[0] - tw) // 2
    y = (size[1] - th) // 2
    
    draw.text((x, y), text, font=font, fill=fill_color)
    
    # Add grunge / stencil brush erosion matching the reference "KTM BIKE"
    # Use PIL ImageDraw directly on alpha
    alpha = img.split()[3]
    draw_alpha = ImageDraw.Draw(alpha)
    np.random.seed(101)
    
    # Vertical brush cuts and paint flecks like KTM BIKE
    for _ in range(40):
        vx = np.random.randint(x, x + tw)
        vy = np.random.randint(y + 10, y + th - 20)
        vlen = np.random.randint(15, 60)
        vw = np.random.randint(2, 6)
        draw_alpha.rectangle([vx, vy, vx + vw, vy + vlen], fill=30)
        
    for _ in range(30):
        rx = np.random.randint(x, x + tw)
        ry = np.random.randint(y, y + th)
        radius = np.random.randint(3, 8)
        draw_alpha.ellipse([rx - radius, ry - radius, rx + radius, ry + radius], fill=0)
        
    img.putalpha(alpha)
    return img

def generate_thumbnail():
    W, H = 2160, 3840
    print(f"Generating enhanced 4K custom thumbnail ({W}x{H})...")
    
    # 1. Studio background (clean off-white with subtle warm lighting)
    # Reference background is approx #eaeaea - #f5f5f5
    canvas = Image.new("RGBA", (W, H), (242, 243, 245, 255))
    
    # Subtle soft vertical gradient
    gradient = Image.new("L", (1, H))
    for y in range(H):
        val = int(247 - (y / H) * 14) # 247 down to 233
        gradient.putpixel((0, y), val)
    gradient_img = gradient.resize((W, H))
    bg_arr = np.zeros((H, W, 4), dtype=np.uint8)
    g_val = np.array(gradient_img)
    bg_arr[:, :, 0] = g_val
    bg_arr[:, :, 1] = g_val
    bg_arr[:, :, 2] = g_val
    bg_arr[:, :, 3] = 255
    canvas = Image.fromarray(bg_arr)
    
    # 2. Centered Rounded Dark Card
    # Reference proportions:
    # Card width: ~84% of width = 1814px
    # Card height: ~45% of height = 1720px
    # Card top: 25.6% = ~980px
    card_w = 1750
    card_h = 1730
    card_x0 = (W - card_w) // 2 # 205px
    card_y0 = 980
    corner_radius = 150
    
    # Card Ambient & Contact Shadow
    shadow_pad = 180
    shadow_img = Image.new("RGBA", (card_w + shadow_pad * 2, card_h + shadow_pad * 2), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(shadow_img)
    s_draw.rounded_rectangle(
        [shadow_pad, shadow_pad + 30, shadow_pad + card_w, shadow_pad + card_h + 30],
        radius=corner_radius,
        fill=(15, 18, 24, 110)
    )
    shadow_blurred = shadow_img.filter(ImageFilter.GaussianBlur(radius=60))
    canvas.paste(shadow_blurred, (card_x0 - shadow_pad, card_y0 - shadow_pad), shadow_blurred)
    
    # Rounded Dark Card Surface
    # Reference color is graphite slate: rgb(78, 83, 91)
    card_img = Image.new("RGBA", (card_w, card_h), (0, 0, 0, 0))
    c_draw = ImageDraw.Draw(card_img)
    c_draw.rounded_rectangle(
        [0, 0, card_w, card_h],
        radius=corner_radius,
        fill=(77, 82, 90, 255)
    )
    
    # Subtle studio lighting falloff on the card
    card_arr = np.array(card_img)
    c_mask = card_arr[:, :, 3] > 0
    cy, cx = card_h // 2, card_w // 2
    y_idx, x_idx = np.ogrid[:card_h, :card_w]
    dist = np.sqrt(((x_idx - cx) / card_w) ** 2 + ((y_idx - cy * 0.7) / card_h) ** 2)
    lighting = (1.06 - dist * 0.22).clip(0.88, 1.12)
    for c in range(3):
        card_arr[c_mask, c] = np.clip(card_arr[c_mask, c] * lighting[c_mask], 0, 255).astype(np.uint8)
    
    card_final = Image.fromarray(card_arr)
    canvas.paste(card_final, (card_x0, card_y0), card_final)
    
    # 3. 3D Model: Pavan Express Courier Box with Floating Label
    # Load isolated transparent 3D asset
    box_im = Image.open("box_hero_perfect.png").convert("RGBA")
    
    # Scale box larger so it commands the frame and breaks outside borders!
    # Target box width: 2020px (larger than card width 1750px so sides pop out!)
    target_bw = 2050
    bw, bh = box_im.size
    scale = target_bw / bw
    target_bh = int(bh * scale) # ~2072px
    box_scaled = box_im.resize((target_bw, target_bh), Image.Resampling.LANCZOS)
    
    # Box position:
    # Top curved shipping label reaches up to y ~ 640px (well above card top at 980px)
    # Bottom corner reaches y ~ 2712px (overlapping card bottom at 2710px)
    box_x = (W - target_bw) // 2 + 15
    box_y = card_y0 - 340 # 640px
    
    # Realistic floor shadow cast by the bottom of the box
    box_shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sh_draw = ImageDraw.Draw(box_shadow)
    shadow_cy = box_y + target_bh - 90
    shadow_cx = box_x + target_bw // 2
    sh_draw.ellipse(
        [shadow_cx - 820, shadow_cy - 110, shadow_cx + 820, shadow_cy + 130],
        fill=(10, 12, 16, 175)
    )
    box_shadow_blur = box_shadow.filter(ImageFilter.GaussianBlur(radius=75))
    canvas.paste(box_shadow_blur, (0, 0), box_shadow_blur)
    
    # Paste the 3D Box
    canvas.paste(box_scaled, (box_x, box_y), box_scaled)
    
    # 4. Typography below the card
    # In reference:
    # Line 1: KTM BIKE (Red, uppercase, distressed stamp style, tall)
    # Line 2: 3D SCROLL WEBSITE (Black, heavy, wide/condensed)
    font_path_impact = "C:/Windows/Fonts/impact.ttf"
    font_line1 = ImageFont.truetype(font_path_impact, 220)
    font_line2 = ImageFont.truetype(font_path_impact, 190)
    
    # Red Line 1: PAVAN EXPRESS
    text1_img = create_distressed_text("PAVAN EXPRESS", font_line1, (218, 28, 22, 255), size=(2000, 320))
    text1_x = (W - 2000) // 2
    text1_y = 2810
    canvas.paste(text1_img, (text1_x, text1_y), text1_img)
    
    # Black Line 2: 3D SCROLL WEBSITE
    draw = ImageDraw.Draw(canvas)
    text2 = "3D SCROLL WEBSITE"
    bbox2 = draw.textbbox((0, 0), text2, font=font_line2)
    tw2 = bbox2[2] - bbox2[0]
    text2_x = (W - tw2) // 2
    text2_y = 3080
    draw.text((text2_x, text2_y), text2, font=font_line2, fill=(14, 15, 18, 255))
    
    # 5. Bottom Solid Red Accent Block
    # Reference coordinates:
    # x: 48px to 994px (width: 946px)
    # y: 3438px to 3706px (height: 268px)
    # Signature courier red: rgb(214, 24, 31)
    red_block_x0 = 48
    red_block_y0 = 3438
    red_block_x1 = 994
    red_block_y1 = 3706
    draw.rectangle([red_block_x0, red_block_y0, red_block_x1, red_block_y1], fill=(214, 24, 31, 255))
    
    # Save 4K Master Thumbnail
    out_4k = "pavan_express_custom_thumbnail.png"
    canvas.save(out_4k, quality=95)
    print(f"Saved 4K Master: {out_4k}")
    
    # Save standard 1080x1920 version for mobile/web preview
    canvas_1080 = canvas.resize((1080, 1920), Image.Resampling.LANCZOS)
    out_1080 = "pavan_express_custom_thumbnail_1080p.png"
    canvas_1080.save(out_1080, quality=95)
    print(f"Saved 1080p Standard: {out_1080}")

if __name__ == "__main__":
    generate_thumbnail()
