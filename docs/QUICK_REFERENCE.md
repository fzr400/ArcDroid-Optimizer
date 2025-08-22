# 🚀 ArcDroid Optimizer - Quick Reference

## Essential GitHub Commands

### Initial Setup
```bash
# Clone repository (replace YOUR_USERNAME)
git clone https://github.com/YOUR_USERNAME/ArcDroid-Optimizer.git
cd ArcDroid-Optimizer

# Set up development branch
git checkout -b development
git push -u origin development
```

### Daily Workflow
```bash
# Start new feature
git checkout development
git pull origin development
git checkout -b feature/feature-name

# Work and commit
git add .
git commit -m "Description of changes"
git push -u origin feature/feature-name

# Create Pull Request on GitHub web interface
```

### Sync with Latest Changes
```bash
# Update development branch
git checkout development
git pull origin development

# Update your feature branch
git checkout feature/your-feature
git merge development
```

## Repository URLs (Update with your username)

- **Repository**: `https://github.com/YOUR_USERNAME/ArcDroid-Optimizer`
- **Issues**: `https://github.com/YOUR_USERNAME/ArcDroid-Optimizer/issues`
- **Releases**: `https://github.com/YOUR_USERNAME/ArcDroid-Optimizer/releases`
- **Clone URL**: `https://github.com/YOUR_USERNAME/ArcDroid-Optimizer.git`

## File Locations

### Current Project
- **Source**: `d:\Dropbox (Personal)\Dropbox (Personal)\Dropbox (Personal)\DXF Optimizer\ArcDroidToolbar\ArcDroidOptimizer\ArcDroidOptimizer.js`
- **Stable Release**: `d:\Dropbox (Personal)\Dropbox (Personal)\Dropbox (Personal)\DXF Optimizer\STABLE_RELEASE_v1.0\`
- **QCAD Installation**: `C:\Program Files\QCADCAM\scripts\ArcDroidOptimizer.js`

### GitHub Repository Structure
```
ArcDroid-Optimizer/
├── src/ArcDroidOptimizer.js     # Main source
├── releases/v1.0/               # Stable release
├── examples/test_sample.dxf     # Test file
└── docs/                        # Documentation
```

## Testing Workflow

1. **Make changes** in `src/ArcDroidOptimizer.js`
2. **Copy to QCAD**: `cp src/ArcDroidOptimizer.js "C:\Program Files\QCADCAM\scripts\"`
3. **Test in QCAD** with Ctrl+Alt+O
4. **Commit if working**: `git add . && git commit -m "Description"`

## Collaboration Checklist

### Before Starting Work
- [ ] `git checkout development`
- [ ] `git pull origin development`
- [ ] `git checkout -b feature/descriptive-name`

### Before Committing
- [ ] Test changes in QCAD
- [ ] Verify no errors in console
- [ ] Check file size reduction works
- [ ] Update documentation if needed

### Creating Pull Request
- [ ] Push feature branch
- [ ] Create PR from feature → development
- [ ] Add description of changes
- [ ] Request review
- [ ] Address feedback

## Emergency Commands

### Undo Last Commit (not pushed)
```bash
git reset --soft HEAD~1
```

### Discard All Changes
```bash
git checkout -- .
```

### Switch to Stable Version
```bash
git checkout main
cp releases/v1.0/ArcDroidOptimizer.js "C:\Program Files\QCADCAM\scripts\"
```

## Current Status

- ✅ **v1.0 Stable**: Working optimizer with 135KB reduction
- ✅ **Installation**: Batch and PowerShell installers
- ✅ **Documentation**: Complete setup guides
- 🔄 **Next**: GitHub repository setup

## Key Features to Preserve

- **Ctrl+Alt+O activation**
- **5-phase optimization**
- **Real-time progress feedback**
- **ArcDroid memory constraints**
- **Entity type debugging**
- **Tolerance settings** (0.1 for duplicates/merging)

---

**Remember**: Always test in QCAD before committing changes!