@echo off
rem ============================================================
rem  Noon Seller - isolated Chrome instance
rem  Account : btoo3e3lanat1@gmail.com
rem  Profile : H:\amzain\profiles\noon-seller
rem  Fully separate cookies/cache/session from other browsers.
rem ============================================================

set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"
set "PROFILE=H:\amzain\profiles\noon-seller"

if not exist "%CHROME%" (
  echo Chrome not found at "%CHROME%"
  pause
  exit /b 1
)

start "" "%CHROME%" ^
 --user-data-dir="%PROFILE%" ^
 --profile-directory="Default" ^
 --remote-debugging-port=9222 ^
 --no-first-run ^
 --no-default-browser-check ^
 --new-window "https://sell.noon.com/"
