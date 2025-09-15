#!/bin/bash

# Local script to build HTML documentation from markdown files
# This can be used for local testing before pushing to GitHub

echo "Building HTML documentation from markdown files..."

# Check if marked is installed
if ! command -v marked &> /dev/null; then
    echo "marked is not installed. Installing..."
    npm install -g marked
fi

# Function to process markdown
process_markdown() {
    local md_file="$1"
    marked "$md_file"
}

# Create web directory if it doesn't exist
mkdir -p public/web

# Load navigation component
load_navigation() {
    if [ -f "examples/templates/navigation.html" ]; then
        cat "examples/templates/navigation.html"
    else
        # Fallback navigation if file doesn't exist
        cat << 'NAV_EOF'
    <nav class="nav">
        <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="governance.html">Governance</a></li>
            <li><a href="plan.html">Development Plan</a></li>
            <li><a href="Draft_%20Property%20Data%20Trust%20Framework%202%20Specification.html">Framework Spec</a></li>
            <li><a href="Draft_%20PDTF%20Participant%20DID%20Auth%20OAuth%202%20Specification.html">OAuth Spec</a></li>
            <li><a href="access-specification.html">Access Spec</a></li>
            <li><a href="../">Registry</a></li>
        </ul>
    </nav>
NAV_EOF
    fi
}

# HTML template function
create_html_wrapper() {
    local title="$1"
    local content="$2"
    local output_file="$3"
    local navigation="$(load_navigation)"
    
    cat > "$output_file" << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Property Data Trust Framework</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
            color: #24292e;
        }
        h1, h2, h3 { color: #0366d6; }
        code { 
            background: #f6f8fa;
            padding: 0.2em 0.4em;
            border-radius: 3px;
            font-size: 85%;
        }
        pre {
            background: #f6f8fa;
            padding: 16px;
            overflow: auto;
            border-radius: 6px;
        }
        a { color: #0366d6; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .nav {
            background: #f6f8fa;
            padding: 1rem;
            margin-bottom: 2rem;
            border-radius: 6px;
        }
        .nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .nav li {
            display: inline-block;
            margin-right: 1rem;
        }
    </style>
</head>
<body>
${navigation}
    <main>
${content}
    </main>
</body>
</html>
EOF
}

# Build index.html from README.md
if [ -f "README.md" ]; then
    echo "Building index.html from README.md..."
    content=$(process_markdown README.md)
    create_html_wrapper "Property Data Trust Framework Documentation" "$content" "public/web/index.html"
fi

# Build HTML for each markdown file in docs/
if [ -d "docs" ]; then
    for md_file in docs/*.md; do
        if [ -f "$md_file" ]; then
            filename=$(basename "$md_file" .md)
            html_file="public/web/${filename}.html"

            echo "Building ${html_file} from ${md_file}..."
            content=$(process_markdown "$md_file")

            # Capitalize first letter of filename for title
            title=$(echo "$filename" | sed 's/.*/\u&/')

            create_html_wrapper "$title" "$content" "$html_file"
        fi
    done
fi

echo "Documentation build complete!"
echo "HTML files are in public/web/"
echo ""
echo "To view locally, run:"
echo "  cd public/web && python3 -m http.server 8000"
echo "Then open http://localhost:8000 in your browser"