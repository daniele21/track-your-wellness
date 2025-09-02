#!/bin/bash

# Security Verification Script
echo "🔍 Running Security Verification..."
echo ""

# Check if .env.local is properly ignored
echo "✅ Checking .env.local git status..."
if git ls-files --error-unmatch .env.local 2>/dev/null; then
    echo "❌ WARNING: .env.local is tracked by git!"
else
    echo "✅ .env.local is properly ignored by git"
fi

# Check for API keys in git history
echo ""
echo "🔍 Checking git history for API keys..."
if git log --all -p | grep -q "AIzaSy"; then
    echo "❌ WARNING: API key found in git history!"
    echo "Consider cleaning git history or creating a new repository"
else
    echo "✅ No API keys found in git history"
fi

# Check for API keys in current committed files
echo ""
echo "🔍 Checking committed files for API keys..."
if git grep -n "AIzaSy" 2>/dev/null; then
    echo "❌ WARNING: API key found in committed files!"
else
    echo "✅ No API keys found in committed files"
fi

# Verify environment files exist
echo ""
echo "📁 Checking environment files..."
if [ -f ".env.example" ]; then
    echo "✅ .env.example exists"
else
    echo "❌ .env.example missing"
fi

if [ -f ".env.local" ]; then
    echo "✅ .env.local exists"
else
    echo "❌ .env.local missing - you need to create this with your API key"
fi

# Check npm vulnerabilities
echo ""
echo "🛡️ Running security audit..."
npm audit

echo ""
echo "🎉 Security verification complete!"
echo "📖 See DEPLOYMENT.md for secure deployment instructions"
