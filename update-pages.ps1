#!/usr/bin/env powershell

# Script to update all HTML pages with authentication and proper layout
# Run this from the cs1 project root directory

Write-Host "Updating HTML pages with authentication and layout..." -ForegroundColor Green

# Define the common header template (for pages in /pages/ folder)
$headerTemplate = @'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - Claim Cipher</title>
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="../styles/normalize.css">
    <link rel="stylesheet" href="../styles/variables.css">
    <link rel="stylesheet" href="../styles/components/header.css">
    <link rel="stylesheet" href="../styles/components/sidebar.css">
    <link rel="stylesheet" href="../styles/components/cards.css">
    <link rel="stylesheet" href="../styles/components/buttons.css">
    <link rel="stylesheet" href="../styles/components/forms.css">
    <link rel="stylesheet" href="../styles/components/navigation.css">
    <link rel="stylesheet" href="../styles/pages/{{CSS_FILE}}.css">
    <link rel="stylesheet" href="../styles/index.css">
</head>
<body>
    <!-- Demo Banner -->
    <div class="demo-banner">
         Pro Demo Active - <span id="demo-countdown">6 days, 14 hours remaining</span>
        <button class="btn btn--primary btn--small" style="margin-left: 16px;">Upgrade Now</button>
    </div>

    <!-- Sidebar Navigation -->
    <nav class="sidebar" style="display: flex; flex-direction: column;">
        <div>
            <div class="sidebar__logo">Claim Cipher</div>
            <ul class="sidebar__nav">
                <li class="sidebar__nav-item">
                    <a href="../index.html" class="sidebar__nav-link">
                        <span></span> Dashboard
                    </a>
                </li>
                <li class="sidebar__nav-item">
                    <a href="mileage.html" class="sidebar__nav-link {{ACTIVE_MILEAGE}}">
                        <span></span> Mileage Calculator
                    </a>
                </li>
                <li class="sidebar__nav-item">
                    <a href="routes.html" class="sidebar__nav-link {{ACTIVE_ROUTES}}">
                        <span></span> Route Optimizer
                    </a>
                </li>
                <li class="sidebar__nav-item">
                    <a href="jobs.html" class="sidebar__nav-link {{ACTIVE_JOBS}}">
                        <span></span> Mobile Sync
                        <span class="badge badge--pro">PRO</span>
                    </a>
                </li>
                <li class="sidebar__nav-item">
                    <a href="autoforms.html" class="sidebar__nav-link {{ACTIVE_AUTOFORMS}}">
                        <span></span> AutoForms
                    </a>
                </li>
                <li class="sidebar__nav-item">
                    <a href="comparables.html" class="sidebar__nav-link {{ACTIVE_COMPARABLES}}">
                        <span></span> Comparables
                        <span class="badge badge--pro">PRO</span>
                    </a>
                </li>
                <li class="sidebar__nav-item">
                    <a href="firms.html" class="sidebar__nav-link {{ACTIVE_FIRMS}}">
                        <span></span> Firms Directory
                    </a>
                </li>
                <li class="sidebar__nav-item">
                    <a href="gear.html" class="sidebar__nav-link {{ACTIVE_GEAR}}">
                        <span></span> Gear
                    </a>
                </li>
                <li class="sidebar__nav-item">
                    <a href="help.html" class="sidebar__nav-link {{ACTIVE_HELP}}">
                        <span></span> Help
                    </a>
                </li>
                <li class="sidebar__nav-item">
                    <a href="settings.html" class="sidebar__nav-link {{ACTIVE_SETTINGS}}">
                        <span></span> Settings
                    </a>
                </li>
            </ul>
        </div>
    </nav>

    <!-- Main Content Area -->
    <main class="main">
'@

# Define the common footer template
$footerTemplate = @'
    </main>

    <!-- Toast Notification (hidden by default) -->
    <div class="toast" id="toast">
        <div style="display: flex; align-items: center; gap: 12px;">
            <span></span>
            <div>
                <div style="font-weight: 600;">Success!</div>
                <div style="font-size: 14px; color: var(--text-secondary);">{{TOAST_MESSAGE}}</div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="../scripts/utils/constants.js"></script>
    <script src="../scripts/utils/helpers.js"></script>
    <script src="../scripts/utils/auth.js"></script>
    <script src="../scripts/components/demo-banner.js"></script>
    <script src="../scripts/components/toast.js"></script>
    <script src="../scripts/pages/{{JS_FILE}}.js"></script>
</body>
</html>
'@

# Define page configurations
$pages = @{
    'routes.html' = @{
        title = 'Route Optimizer'
        cssFile = 'routes'
        jsFile = 'routes'
        toastMessage = 'Route optimized successfully'
        content = @'
        <div class="page-routes">
            <header class="main__header">
                <h1 class="main__title">Route Optimizer</h1>
                <p class="main__subtitle">Group stops within 50-mile radius and optimize your daily routes</p>
            </header>

            <div class="card">
                <div class="route-controls">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Start Address</label>
                            <input type="text" class="form-input" value="Home" placeholder="Enter starting location">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Route Rules</label>
                            <div class="rule-badges">
                                <span class="badge">Max 50mi radius</span>
                                <span class="badge">Max 10 stops/day</span>
                                <span class="badge">Spillover: Tomorrow</span>
                                <button class="btn btn--secondary btn--small">Edit Rules</button>
                            </div>
                        </div>
                    </div>
                    <div class="route-actions">
                        <button class="btn btn--secondary">Import from CSV</button>
                        <button class="btn btn--primary" id="optimize-routes-btn">Optimize Routes</button>
                    </div>
                </div>
            </div>

            <div class="map-container">
                <div class="map-placeholder">
                    <div class="map-icon">🗺️</div>
                    <div>Interactive map will display optimized routes with color-coded polylines</div>
                </div>
            </div>
        </div>
'@
    }
    'autoforms.html' = @{
        title = 'AutoForms'
        cssFile = 'autoforms'
        jsFile = 'autoforms'
        toastMessage = 'Form processed successfully'
        content = @'
        <div class="page-autoforms">
            <header class="main__header">
                <h1 class="main__title">AutoForms</h1>
                <p class="main__subtitle">Auto-fill PDF forms from CCC estimates</p>
            </header>

            <div class="card">
                <div class="file-drop-zone" id="pdf-drop-zone">
                    <div class="drop-zone-content">
                        <div class="drop-zone-icon">📄</div>
                        <div class="drop-zone-text">
                            <strong>Drop your CCC estimate here</strong><br>
                            <span>or click to browse files</span>
                        </div>
                        <button class="btn btn--primary" id="choose-file-btn">Choose File</button>
                        <div class="drop-zone-note">
                            Privacy: Files are not saved unless you choose to save them
                        </div>
                    </div>
                </div>
            </div>
        </div>
'@
    }
    'jobs.html' = @{
        title = 'Mobile Sync'
        cssFile = 'jobs'
        jsFile = 'jobs'
        toastMessage = 'Job synced successfully'
        content = @'
        <div class="page-jobs">
            <header class="main__header">
                <h1 class="main__title">Mobile Sync</h1>
                <p class="main__subtitle">Manage field inspections and sync photos from mobile devices</p>
                <span class="badge badge--pro">PRO FEATURE</span>
            </header>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-card__value">3</div>
                    <div class="stat-card__label">Active Jobs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__value">12</div>
                    <div class="stat-card__label">Completed This Week</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card__value">247</div>
                    <div class="stat-card__label">Photos Synced</div>
                </div>
            </div>
        </div>
'@
    }
    'settings.html' = @{
        title = 'Settings'
        cssFile = 'settings'
        jsFile = 'settings'
        toastMessage = 'Settings saved successfully'
        content = @'
        <div class="page-settings">
            <header class="main__header">
                <h1 class="main__title">Settings</h1>
                <p class="main__subtitle">Manage your profile, security, and business settings</p>
            </header>

            <div class="card">
                <div class="card__header">
                    <h3 class="card__title">Profile Information</h3>
                </div>
                
                <form class="settings-form" id="profile-form">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-input" value="John Smith">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" class="form-input" value="john.smith@example.com">
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn btn--success">Save Changes</button>
                        <button type="button" class="btn btn--secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
'@
    }
}

# Function to get active class for navigation
function Get-ActiveClass($pageName, $currentPage) {
    if ($pageName -eq $currentPage) {
        return "active"
    }
    return ""
}

# Update each page
foreach ($pageName in $pages.Keys) {
    Write-Host "Updating $pageName..." -ForegroundColor Yellow
    
    $config = $pages[$pageName]
    
    # Build the complete HTML
    $html = $headerTemplate
    $html = $html.Replace('{{TITLE}}', $config.title)
    $html = $html.Replace('{{CSS_FILE}}', $config.cssFile)
    
    # Set active navigation states
    $html = $html.Replace('{{ACTIVE_MILEAGE}}', $(Get-ActiveClass 'mileage' $config.cssFile))
    $html = $html.Replace('{{ACTIVE_ROUTES}}', $(Get-ActiveClass 'routes' $config.cssFile))
    $html = $html.Replace('{{ACTIVE_JOBS}}', $(Get-ActiveClass 'jobs' $config.cssFile))
    $html = $html.Replace('{{ACTIVE_AUTOFORMS}}', $(Get-ActiveClass 'autoforms' $config.cssFile))
    $html = $html.Replace('{{ACTIVE_COMPARABLES}}', $(Get-ActiveClass 'comparables' $config.cssFile))
    $html = $html.Replace('{{ACTIVE_FIRMS}}', $(Get-ActiveClass 'firms' $config.cssFile))
    $html = $html.Replace('{{ACTIVE_GEAR}}', $(Get-ActiveClass 'gear' $config.cssFile))
    $html = $html.Replace('{{ACTIVE_HELP}}', $(Get-ActiveClass 'help' $config.cssFile))
    $html = $html.Replace('{{ACTIVE_SETTINGS}}', $(Get-ActiveClass 'settings' $config.cssFile))
    
    # Add content
    $html += $config.content
    
    # Add footer
    $footer = $footerTemplate
    $footer = $footer.Replace('{{TOAST_MESSAGE}}', $config.toastMessage)
    $footer = $footer.Replace('{{JS_FILE}}', $config.jsFile)
    $html += $footer
    
    # Write to file
    $filePath = "pages\$pageName"
    $html | Out-File -FilePath $filePath -Encoding UTF8 -Force
    
    Write-Host "  ✓ $pageName updated" -ForegroundColor Green
}

Write-Host "`nAll pages updated successfully!" -ForegroundColor Green
Write-Host "Note: You may need to create corresponding CSS and JS files for each page if they don't exist." -ForegroundColor Yellow
