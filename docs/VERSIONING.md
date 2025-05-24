# Remcode Versioning Strategy

**Last Updated:** May 24, 2025  
**Package Name:** `remcode`  
**Current Version:** `0.1.0-beta.1`

## 📋 Versioning Strategy

### **Semantic Versioning (SemVer)**

Remcode follows [Semantic Versioning 2.0.0](https://semver.org/) with the following structure:

```
MAJOR.MINOR.PATCH[-PRERELEASE]
```

### **Version Categories**

#### **Pre-Release Versions (Current Phase)**
- **Beta Releases**: `0.1.0-beta.1`, `0.1.0-beta.2`, etc.
- **Release Candidate**: `0.1.0-rc.1`, `0.1.0-rc.2`, etc.
- **Alpha** (if needed): `0.1.0-alpha.1`, `0.1.0-alpha.2`, etc.

#### **Stable Releases (Future)**
- **Major** (Breaking changes): `1.0.0`, `2.0.0`
- **Minor** (New features): `1.1.0`, `1.2.0`
- **Patch** (Bug fixes): `1.0.1`, `1.0.2`

### **Current Release Plan**

#### **Phase 1: Beta Testing (v0.1.0-beta.x)**
- **Focus**: Core MCP functionality, basic installation
- **Target Users**: Early adopters, contributors
- **Distribution**: npm with `beta` tag
- **Installation**: `npm install remcode@beta` or `npx remcode@beta`

#### **Phase 2: Release Candidate (v0.1.0-rc.x)**
- **Focus**: Production readiness, comprehensive testing
- **Target Users**: Production evaluators
- **Distribution**: npm with `rc` tag

#### **Phase 3: Stable Release (v1.0.0)**
- **Focus**: Production-ready, documented, supported
- **Target Users**: General public, enterprises
- **Distribution**: npm latest tag

### **Release Process**

#### **Beta Release Process**
1. **Code Ready**: All tests passing, features working
2. **Version Bump**: Update package.json version
3. **Build & Test**: `npm run build && npm test`
4. **Publish**: `npm publish --tag beta`
5. **Documentation**: Update installation guides

#### **Stable Release Process**
1. **Release Candidate**: Thorough testing phase
2. **Final Testing**: Community feedback integration
3. **Documentation Review**: Complete guide validation
4. **Version Finalization**: Remove pre-release tag
5. **Publish**: `npm publish` (latest tag)

### **Version History**

| Version | Date | Description | Breaking Changes |
|---------|------|-------------|------------------|
| `0.1.0-beta.1` | 2025-05-24 | Initial beta release with MCP server | N/A |

### **NPM Distribution Tags**

- **`latest`**: Stable releases (future v1.0.0+)
- **`beta`**: Beta releases (current v0.1.0-beta.x)
- **`rc`**: Release candidates (future v0.1.0-rc.x)
- **`alpha`**: Alpha releases (if needed)

### **Installation Commands by Phase**

```bash
# Beta Testing (Current)
npx remcode@beta serve
npm install -g remcode@beta

# Release Candidate (Future)
npx remcode@rc serve
npm install -g remcode@rc

# Stable (Future)
npx remcode serve
npm install -g remcode
```

### **Backward Compatibility Policy**

- **Pre-1.0.0**: No backward compatibility guarantees
- **1.x.x series**: Backward compatible within major version
- **Breaking changes**: Only in major version bumps

### **Communication Strategy**

- **Release Notes**: Document all changes in GitHub releases
- **Migration Guides**: For breaking changes
- **Deprecation Notices**: 1 minor version before removal
- **Security Updates**: Immediate patch releases

### **Quality Gates**

#### **Beta Release Requirements**
- [ ] All unit tests passing
- [ ] Core MCP functionality working
- [ ] Basic installation guide complete
- [ ] CLI commands functional

#### **RC Release Requirements**
- [ ] Integration tests passing
- [ ] External API tests validated
- [ ] Performance benchmarks met
- [ ] Comprehensive documentation

#### **Stable Release Requirements**
- [ ] Production testing complete
- [ ] Community feedback integrated
- [ ] Security audit completed
- [ ] Support documentation ready

### **Development Workflow**

```bash
# Version bump for beta
npm version prerelease --preid=beta

# Version bump for RC
npm version prerelease --preid=rc

# Version bump for stable
npm version minor  # or major/patch
```

### **Rollback Strategy**

- **NPM Deprecation**: Mark problematic versions as deprecated
- **Hot Fixes**: Immediate patch releases for critical issues
- **Version Pinning**: Recommend specific versions for stability

---

**For questions about versioning strategy, refer to this document or create an issue in the GitHub repository.**
