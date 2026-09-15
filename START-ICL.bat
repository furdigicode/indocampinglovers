@echo off
setlocal
cd /d "%~dp0"
title IndoCampingLovers Local Dev

echo ========================================
echo   IndoCampingLovers - Local Development
echo ========================================
echo.

where git >nul 2>nul || (
  echo ERROR: Git tidak ditemukan.
  pause
  exit /b 1
)

where node >nul 2>nul || (
  echo ERROR: Node.js tidak ditemukan.
  pause
  exit /b 1
)

if not exist ".env.local" (
  echo ERROR: .env.local belum tersedia.
  echo Buat .env.local berisi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
  pause
  exit /b 1
)

echo [1/4] Memastikan branch develop...
git checkout develop || goto :error

echo [2/4] Mengambil kode terbaru dari GitHub...
git pull --ff-only origin develop || goto :error

echo [3/4] Memastikan dependency sesuai package-lock...
call npm ci || goto :error

echo [4/4] Menjalankan ICL di http://localhost:3000 ...
echo.
echo Jangan tutup jendela ini selama ICL digunakan.
echo Tekan Ctrl+C untuk menghentikan server.
echo.
start "" "http://localhost:3000"
call npm run dev
goto :eof

:error
echo.
echo ERROR: Proses dihentikan. Baca pesan error di atas.
pause
exit /b 1
