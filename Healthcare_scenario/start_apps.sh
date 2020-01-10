#!/bin/bash
num="$(($1 + 7999))"

for (( c=8000; c<=num; c++ ))
do
   node app_x $c &
done

# to kill the running servers
# ps aux | grep server_x
# kill pid

