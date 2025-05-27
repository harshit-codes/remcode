#!/bin/bash

# LLM Optimization Validation Script (Fixed)
# Validates documentation standards for LLM-optimized codebase

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SOURCE_DIR="src"
DOCS_DIR="docs/generated"

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log error
log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to log info
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

echo "🔍 Validating LLM-optimized documentation standards..."

# Check 1: Single Function Per File Compliance
echo -e "\n${BLUE}📁 Checking single function per file compliance...${NC}"

single_function_violations=()
total_files=0
compliant_files=0

# Process each TypeScript file
find "$SOURCE_DIR" -name "*.ts" -type f | while read -r file; do
    total_files=$((total_files + 1))
    
    # Skip index.ts and types.ts files as they're expected to have multiple exports
    if [[ "$(basename "$file")" =~ ^(index|types)\.ts$ ]]; then
        log_info "Skipping $file (index/types file)"
        continue
    fi
    
    # Count function-like exports using a more robust method
    function_exports=0
    
    # Count various function export patterns
    if grep -q "^export.*function" "$file" 2>/dev/null; then
        function_exports=$((function_exports + $(grep -c "^export.*function" "$file" 2>/dev/null || echo 0)))
    fi
    
    if grep -q "^export default.*function" "$file" 2>/dev/null; then
        function_exports=$((function_exports + $(grep -c "^export default.*function" "$file" 2>/dev/null || echo 0)))
    fi
    
    if grep -q "^export async function" "$file" 2>/dev/null; then
        function_exports=$((function_exports + $(grep -c "^export async function" "$file" 2>/dev/null || echo 0)))
    fi
    
    # For function declarations (standalone functions)
    standalone_functions=0
    if grep -q "^function\|^async function" "$file" 2>/dev/null; then
        standalone_functions=$(grep -c "^function\|^async function" "$file" 2>/dev/null || echo 0)
    fi
    
    total_functions=$((function_exports + standalone_functions))
    
    if [ "$total_functions" -gt 1 ]; then
        echo "❌ Multiple functions in $file ($total_functions functions found)"
        single_function_violations+=("$file")
    else
        compliant_files=$((compliant_files + 1))
    fi
done

# Since we can't pass variables out of the while loop due to subshell, 
# let's calculate compliance differently
violation_count=$(find "$SOURCE_DIR" -name "*.ts" -type f ! -name "index.ts" ! -name "types.ts" | xargs -I {} bash -c '
    file="{}"
    function_exports=0
    standalone_functions=0
    
    # Count function exports
    function_exports=$(grep -c "^export.*function\|^export default.*function\|^export async function" "$file" 2>/dev/null || echo 0)
    standalone_functions=$(grep -c "^function\|^async function" "$file" 2>/dev/null || echo 0)
    
    total_functions=$((function_exports + standalone_functions))
    
    if [ "$total_functions" -gt 1 ]; then
        echo "violation"
    fi
' | grep -c "violation" || echo 0)

if [ "$violation_count" -eq 0 ]; then
    log_success "Single function per file compliance: PASSED"
else
    log_error "Found $violation_count files violating single function per file rule"
fi

# Check 2: JSDoc Documentation Completeness
echo -e "\n${BLUE}📚 Checking JSDoc documentation completeness...${NC}"

missing_jsdoc=()
find "$SOURCE_DIR" -name "*.ts" -type f | while read -r file; do
    # Skip type-only files
    if [[ "$(basename "$file")" =~ ^types\.ts$ ]]; then
        continue
    fi
    
    # Check if file has functions that should be documented
    has_functions=$(grep -c "^export.*function\|^function\|^async function\|export default.*function" "$file" 2>/dev/null || echo 0)
    
    if [ "$has_functions" -gt 0 ]; then
        # Check if file has JSDoc comments
        has_jsdoc=$(grep -c "/\*\*" "$file" 2>/dev/null || echo 0)
        
        if [ "$has_jsdoc" -eq 0 ]; then
            echo "❌ Missing JSDoc in $file"
            missing_jsdoc+=("$file")
        fi
    fi
done

# Count files missing JSDoc
missing_jsdoc_count=$(find "$SOURCE_DIR" -name "*.ts" -type f ! -name "types.ts" | xargs -I {} bash -c '
    file="{}"
    has_functions=$(grep -c "^export.*function\|^function\|^async function\|export default.*function" "$file" 2>/dev/null || echo 0)
    
    if [ "$has_functions" -gt 0 ]; then
        has_jsdoc=$(grep -c "/\*\*" "$file" 2>/dev/null || echo 0)
        if [ "$has_jsdoc" -eq 0 ]; then
            echo "missing"
        fi
    fi
' | grep -c "missing" || echo 0)

if [ "$missing_jsdoc_count" -eq 0 ]; then
    log_success "JSDoc documentation completeness: PASSED"
else
    log_error "Found $missing_jsdoc_count files missing JSDoc documentation"
fi

# Check 3: File Organization Standards
echo -e "\n${BLUE}🗂️ Checking file organization standards...${NC}"

# Check for proper feature-based organization
organization_issues=()

# Verify core directories exist
core_dirs=("commands" "mcp" "processing" "search" "setup" "utils" "vectorizers" "workflows")
for dir in "${core_dirs[@]}"; do
    if [ ! -d "$SOURCE_DIR/$dir" ]; then
        organization_issues+=("Missing core directory: $dir")
    fi
done

if [ ${#organization_issues[@]} -eq 0 ]; then
    log_success "File organization standards: PASSED"
else
    log_error "Found ${#organization_issues[@]} file organization issues"
    for issue in "${organization_issues[@]}"; do
        echo "  - $issue"
    done
fi

# Check 4: Type Safety and Documentation
echo -e "\n${BLUE}🎯 Checking type safety and documentation...${NC}"

type_issues=()

# Check for excessive use of 'any' type
any_usage=$(find "$SOURCE_DIR" -name "*.ts" -exec grep -l ": any\|<any>" {} \; 2>/dev/null | wc -l || echo 0)

if [ "$any_usage" -gt 5 ]; then
    type_issues+=("Excessive use of 'any' type found in $any_usage files")
fi

if [ ${#type_issues[@]} -eq 0 ]; then
    log_success "Type safety and documentation: PASSED"
else
    log_warning "Found ${#type_issues[@]} type safety issues"
    for issue in "${type_issues[@]}"; do
        echo "  - $issue"
    done
fi

# Check 5: Import/Export Patterns
echo -e "\n${BLUE}📦 Checking import/export patterns...${NC}"

import_issues=()

# Check for wildcard imports (which can be problematic for LLMs)
wildcard_imports=$(find "$SOURCE_DIR" -name "*.ts" -exec grep -l "import \* as" {} \; 2>/dev/null | wc -l || echo 0)

if [ "$wildcard_imports" -gt 10 ]; then
    import_issues+=("High number of wildcard imports found ($wildcard_imports files)")
fi

if [ ${#import_issues[@]} -eq 0 ]; then
    log_success "Import/export patterns: PASSED"
else
    log_warning "Found ${#import_issues[@]} import/export pattern issues"
    for issue in "${import_issues[@]}"; do
        echo "  - $issue"
    done
fi

# Summary
echo -e "\n${BLUE}📊 Validation Summary${NC}"
echo "======================================"

if [ "$violation_count" -eq 0 ] && [ "$missing_jsdoc_count" -eq 0 ] && [ ${#organization_issues[@]} -eq 0 ]; then
    log_success "All critical validations passed!"
    log_success "✅ Ready for commit!"
    exit 0
else
    log_error "Some validations failed:"
    if [ "$violation_count" -gt 0 ]; then
        echo "  - $violation_count files violate single function rule"
    fi
    if [ "$missing_jsdoc_count" -gt 0 ]; then
        echo "  - $missing_jsdoc_count files missing JSDoc"
    fi
    if [ ${#organization_issues[@]} -gt 0 ]; then
        echo "  - ${#organization_issues[@]} organization issues"
    fi
    echo ""
    log_info "Run the optimization tools to fix these issues"
    exit 1
fi
