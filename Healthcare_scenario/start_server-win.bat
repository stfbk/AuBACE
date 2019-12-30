@echo off

set /a "num_servers=%1+7999"

FOR /L %%A IN (8000,1,%num_servers%) DO (
  start "Node Client %%A" node server_x %%A >nul 2>&1
)






