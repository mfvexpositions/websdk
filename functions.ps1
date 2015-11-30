#=============================================
# This file is to be used from within the application directory, not here
#=============================================

# Utility which function
function which {
  (get-command $args).path
}

# List directory
function ll {
  cmd /c dir /a $args
}

# Make symbolic link (you should install scoop, then scoop install sudo)
function mklink {
  sudo cmd /c mklink $args
}

# Utility build function
# Does: node ./src/web/build/index.js --od ./public/artifacts
function websdk-build {
  Start-Process `
    -FilePath "$(which node)" `
    -WorkingDirectory $(pwd) `
    -NoNewWindow `
    -Wait `
    -ArgumentList ("$(pwd)\src\web\build\index.js --od $(pwd)\public\artifacts\" + $args)
}

Write-Host "Make sure to source this file, by running (notice the 2 seperate initial dots): . ./node_modules/websdk/functions.ps1"
Write-Host "You may now type 'websdk-build' to build or websdk-build --help to get help"
Write-Host "To make a build tailored for production type: websdk-build --env prod"
Write-Host "To watch the files after first build type: websdk-build --env prod --w"
