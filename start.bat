@echo off
echo Starting CampusChow Backend & Frontend...
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"