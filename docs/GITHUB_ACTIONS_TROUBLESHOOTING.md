# GitHub Actions NPM Publishing Pipeline Troubleshooting

## 🎯 **Quick Fix Guide**

### **Issue 1: Pipeline Fails at Test Stage**
**Symptoms:** GitHub Actions fails with test errors
**Solution:**
```bash
# Test locally first
npm run lint        # Check TypeScript compilation
npm run build       # Verify build process
npm run test:unit    # Run unit tests
npm run test:mcp     # Run MCP tests
npm run test:production  # Run production tests
```

### **Issue 2: NPM_TOKEN Not Configured**
**Symptoms:** Pipeline fails at publish step with authentication error
**Solution:**
```bash
# Run setup script
npm run setup-npm-token

# Or manually:
# 1. Get NPM token: https://www.npmjs.com/settings/tokens
# 2. Add to GitHub: Repository → Settings → Secrets → NPM_TOKEN
```

### **Issue 3: Version Bump Not Working**
**Symptoms:** Version doesn't change or commit format issues
**Solution:**
```bash
# Use proper commit format:
git commit -m "feat: new feature"    # 0.1.6 → 0.2.0
git commit -m "fix: bug fix"         # 0.1.6 → 0.1.7
git commit -m "docs: update docs"    # 0.1.6 → 0.1.7
```

## 🔧 **Manual NPM Publishing (Fallback)**

If automated pipeline fails, publish manually:

```bash
# 1. Login to NPM
npm login

# 2. Build the package
npm run build:clean

# 3. Bump version manually
npm version patch  # or minor/major

# 4. Publish
npm publish

# 5. Push changes
git push origin main --tags
```

## 📊 **Pipeline Status Monitoring**

Monitor your pipeline at:
- **GitHub Actions:** https://github.com/harshit-codes/remcode/actions
- **NPM Package:** https://www.npmjs.com/package/remcode

## 🚀 **Test the Fix**

```bash
# Make a test commit to trigger pipeline
git add .
git commit -m "fix: resolve GitHub Actions pipeline issues"
git push origin main

# Monitor the pipeline at GitHub Actions tab
```
