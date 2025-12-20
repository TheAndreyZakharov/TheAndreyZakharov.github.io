#!/bin/bash
echo "Stopping..."
PID=$(lsof -ti:5173)
if [ -n "$PID" ]; then
  kill -9 $PID
  echo "Server at 5173 stopped."
else
  echo "Server at 5173 not found"
fi