#!/bin/bash
# scripts/llm-optimization/validate-docs.sh
# Pre-commit validation for LLM-optimized documentation standards

set -e

echo "🔍 Validating LLM-optimized documentation standards..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SOURCE_DIR="src"
VALIDATION_ERRORS=0
VALIDATION_WARNINGS=0

# Function to log errors
log_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((VALIDATION_ERRORS++))
}

# Function to log warnings
log_warning() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((VALIDATION_WARNINGS++))
}

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log info
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check 1: Single Function Per File Compliance
echo -e "\n${BLUE}📁 Checking single function per file compliance...${NC}"

single_function_violations=()
while IFS= read -r -d '' file; do
    # Skip index.ts and types.ts files
    if [[ "$file" =~ (index|types)\.ts$ ]]; then
        continue
    fi
    
    # Count exported functions
    function_count=$(grep -c "^export.*function\|^export default.*function\|^export async function" "$file" 2>/dev/null)
    if [ -z "$function_count" ] || [ "$function_count" = "" ]; then
        function_count=0
    fi
    
    # Count regular function declarations that might be exported
    regular_functions=$(grep -c "^function\|^async function" "$file" 2>/dev/null)
    if [ -z "$regular_functions" ] || [ "$regular_functions" = "" ]; then
        regular_functions=0
    fi
    
    total_functions=$((function_count + regular_functions))
    
    if [ "$total_functions" -gt 1 ]; then
        single_function_violations+=("$file")
        log_error "Multiple functions in $file ($total_functions functions found)"
    fi
done < <(find "$SOURCE_DIR" -name "*.ts" -print0 2>/dev/null || true)

if [ ${#single_function_violations[@]} -eq 0 ]; then
    log_success "Single function per file compliance: PASSED"
else
    log_error "Found ${#single_function_violations[@]} files violating single function per file rule"
    echo "Files to refactor:"
    printf '  - %s\n' "${single_function_violations[@]}"
    echo "Run: npm run llm:refactor-to-single to automatically fix these files"
fi

# Check 2: JSDoc Documentation Completeness
echo -e "\n${BLUE}📚 Checking JSDoc documentation completeness...${NC}"

missing_jsdoc_files=()
incomplete_jsdoc_files=()

while IFS= read -r -d '' file; do
    # Skip type definition files
    if [[ "$file" =~ types\.ts$ ]]; then
        continue
    fi
    
    # Check if file has any functions
    if grep -q "^export.*function\|^function\|^async function" "$file"; then
        # Check for JSDoc presence
        if ! grep -B10 "^export.*function\|^function\|^async function" "$file" | grep -q "/\*\*"; then
            missing_jsdoc_files+=("$file")
            continue
        fi
        
        # Check for required JSDoc tags
        required_tags=("@description" "@param" "@returns" "@example")
        missing_tags=()
        
        for tag in "${required_tags[@]}"; do
            if ! grep -q "$tag" "$file"; then
                missing_tags+=("$tag")
            fi
        done
        
        if [ ${#missing_tags[@]} -gt 0 ]; then
            incomplete_jsdoc_files+=("$file:${missing_tags[*]}")
        fi
    fi
done < <(find "$SOURCE_DIR" -name "*.ts" -print0 2>/dev/null || true)

if [ ${#missing_jsdoc_files[@]} -eq 0 ] && [ ${#incomplete_jsdoc_files[@]} -eq 0 ]; then
    log_success "JSDoc documentation completeness: PASSED"
else
    if [ ${#missing_jsdoc_files[@]} -gt 0 ]; then
        log_error "Found ${#missing_jsdoc_files[@]} files missing JSDoc documentation"
        echo "Files missing JSDoc:"
        printf '  - %s\n' "${missing_jsdoc_files[@]}"
    fi
    
    if [ ${#incomplete_jsdoc_files[@]} -gt 0 ]; then
        log_error "Found ${#incomplete_jsdoc_files[@]} files with incomplete JSDoc"
        echo "Files with missing JSDoc tags:"
        for item in "${incomplete_jsdoc_files[@]}"; do
            file="${item%%:*}"
            tags="${item#*:}"
            echo "  - $file (missing: $tags)"
        done
    fi
    
    echo "Run: npm run llm:add-jsdoc to automatically add JSDoc templates"
fi

# Check 3: File Organization Standards
echo -e "\n${BLUE}🗂️  Checking file organization standards...${NC}"

organization_violations=()

# Check for proper feature-based organization
if [ ! -d "$SOURCE_DIR/features" ]; then
    log_error "Missing features directory - feature-based organization required"
    organization_violations+=("missing-features-dir")
fi

if [ ! -d "$SOURCE_DIR/shared" ]; then
    log_error "Missing shared directory - shared utilities organization required"
    organization_violations+=("missing-shared-dir")
fi

if [ ! -d "$SOURCE_DIR/core" ]; then
    log_error "Missing core directory - core framework organization required"
    organization_violations+=("missing-core-dir")
fi

# Check for barrel exports only in index.ts files
barrel_export_violations=()
while IFS= read -r -d '' file; do
    if [[ ! "$file" =~ index\.ts$ ]] && grep -q "export \*" "$file"; then
        barrel_export_violations+=("$file")
    fi
done < <(find "$SOURCE_DIR" -name "*.ts" -print0 2>/dev/null || true)

if [ ${#barrel_export_violations[@]} -gt 0 ]; then
    log_error "Barrel exports (export *) found in non-index files"
    echo "Files with improper barrel exports:"
    printf '  - %s\n' "${barrel_export_violations[@]}"
    echo "Use explicit exports or move to index.ts files"
fi

if [ ${#organization_violations[@]} -eq 0 ] && [ ${#barrel_export_violations[@]} -eq 0 ]; then
    log_success "File organization standards: PASSED"
fi

# Check 4: Type Safety and Documentation
echo -e "\n${BLUE}🎯 Checking type safety and documentation...${NC}"

any_type_warnings=()
missing_return_types=()

while IFS= read -r -d '' file; do
    # Check for 'any' types (warning, not error)
    if grep -q ": any\|any\[\]\|: any\[\]" "$file"; then
        any_type_warnings+=("$file")
    fi
    
    # Check for functions without return type annotations
    if grep -E "^export.*function.*\)|^function.*\)" "$file" | grep -v ": " | grep -q "function"; then
        missing_return_types+=("$file")
    fi
done < <(find "$SOURCE_DIR" -name "*.ts" -print0 2>/dev/null || true)

if [ ${#any_type_warnings[@]} -gt 0 ]; then
    log_warning "Found 'any' types in ${#any_type_warnings[@]} files"
    echo "Consider using specific types for better LLM understanding:"
    printf '  - %s\n' "${any_type_warnings[@]}"
fi

if [ ${#missing_return_types[@]} -gt 0 ]; then
    log_warning "Found functions without explicit return types in ${#missing_return_types[@]} files"
    echo "Consider adding return type annotations:"
    printf '  - %s\n' "${missing_return_types[@]}"
fi

# Check 5: Import/Export Patterns
echo -e "\n${BLUE}📦 Checking import/export patterns...${NC}"

import_violations=()

while IFS= read -r -d '' file; do
    # Check for relative imports going up more than one level
    if grep -q "\.\./\.\." "$file"; then
        import_violations+=("$file")
        log_warning "Deep relative imports found in $file - consider restructuring"
    fi
    
    # Check for missing file-level documentation
    if ! grep -q "@fileoverview\|@module" "$file" && grep -q "export\|import" "$file"; then
        log_warning "Missing file-level documentation (@fileoverview/@module) in $file"
    fi
done < <(find "$SOURCE_DIR" -name "*.ts" -print0 2>/dev/null || true)

# Summary
echo -e "\n${BLUE}📊 Validation Summary${NC}"
echo "======================================"

if [ $VALIDATION_ERRORS -eq 0 ]; then
    log_success "All critical validations passed!"
    
    if [ $VALIDATION_WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}$VALIDATION_WARNINGS warnings found - consider addressing for optimal LLM performance${NC}"
    else
        echo -e "${GREEN}Perfect LLM optimization compliance! 🎉${NC}"
    fi
    
    echo ""
    echo "✅ Ready for commit!"
    exit 0
else
    echo -e "${RED}$VALIDATION_ERRORS critical errors found${NC}"
    if [ $VALIDATION_WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}$VALIDATION_WARNINGS warnings found${NC}"
    fi
    
    echo ""
    echo "❌ Fix errors before committing!"
    echo ""
    echo "🔧 Quick fixes:"
    echo "  npm run llm:refactor-to-single  # Fix single function violations"
    echo "  npm run llm:add-jsdoc          # Add missing JSDoc"
    echo "  npm run llm:organize-files     # Fix file organization"
    echo "  npm run llm:optimize           # Run all optimizations"
    
    exit 1
fi