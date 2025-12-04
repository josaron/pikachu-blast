# Pikachu Image Setup

## Adding Your Pikachu Image

Simply place your Pikachu image file as `pikachu.png` in this directory (`public/`).

**File location:** `public/pikachu.png`

**Recommended specifications:**
- Format: PNG (with transparent background preferred)
- Size: 300x300px or larger
- The app will automatically use this image when available

## Fallback

If `pikachu.png` is not found, the app will automatically use the included `pikachu.svg` as a fallback, so the app will work immediately even without adding an image.

## Quick Test

Once you've added the image, test it by running:
```bash
docker-compose up --build
```

Then visit http://localhost:3000 and you should see your Pikachu!

## Image Sources

If you need to find a Pikachu image:
- Use royalty-free image sites like Pixabay or Pexels
- Ensure you have proper rights to use the image
- Convert to PNG format if needed

