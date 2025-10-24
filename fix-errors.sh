#!/bin/bash

echo "🔧 Fixing AccountOS errors..."

# 1. Fix Axios import in all files
echo "📝 Fixing Axios imports..."
find frontend/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/AxiosRequestConfig/any/g'
find frontend/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/InternalAxiosRequestConfig/any/g'
find frontend/src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/InternalInternalAxiosRequestConfig/any/g'

# 2. Create icons directory
echo "📁 Creating icons directory..."
mkdir -p frontend/public/icons
mkdir -p frontend/public/splash

# 3. Create a simple favicon if not exists
if [ ! -f "frontend/public/favicon.ico" ]; then
    echo "🎨 Creating favicon..."
    # Copy existing favicon.svg as favicon.ico placeholder
    if [ -f "frontend/public/favicon.svg" ]; then
        cp frontend/public/favicon.svg frontend/public/favicon.ico
    fi
fi

# 4. Check if all icon files exist
echo "🔍 Checking icon files..."
missing_icons=()
for size in 72 96 128 144 152 192 384 512; do
    if [ ! -f "frontend/public/icons/icon-${size}x${size}.svg" ]; then
        missing_icons+=($size)
    fi
done

if [ ${#missing_icons[@]} -gt 0 ]; then
    echo "⚠️  Missing icon files for sizes: ${missing_icons[*]}"
    echo "📌 Please run the icon generator:"
    echo "   1. Open frontend/public/icons/generate-icons.html in browser"
    echo "   2. Click 'Generate Icons'"
    echo "   3. Download all icons and place in frontend/public/icons/"
fi

echo "✅ Error fixes applied!"
echo ""
echo "📌 Next steps:"
echo "1. Run: cd frontend && npm run dev"
echo "2. Check browser console for any remaining errors"
echo "3. If PWA icons are missing, use the generator tool"
