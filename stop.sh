#!/bin/bash
echo "🛑 Останавливаю проект..."
PID=$(lsof -ti:5173)
if [ -n "$PID" ]; then
  kill -9 $PID
  echo "✅ Сервер на порту 5173 остановлен."
else
  echo "⚠️ Сервер не найден на порту 5173."
fi