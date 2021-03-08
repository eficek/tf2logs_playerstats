# tf2logs_playerstats
cli tool to compile stats of individual players by class from any collection of logs

**WIP**

this tool allows a user to input any selection of log links (logs.tf/xxxxxxx) and a class, and the tool will return a set of players' compiled stats based on the class that the user inputs.

example input - all logs from s7 invite hl, for demo:
http://logs.tf/2701293 http://logs.tf/2701176 http://logs.tf/2701199 ... https://logs.tf/2772607 https://logs.tf/2772525
demoman

example output - 
kjr:
total kills: 184; total dmg: 114624
iron_bomber:
    kills: 69 - 37.50% of total
    dmg: 38366 - 33.47% of total
tf_projectile_pipe_remote:
    kills: 113 - 61.41% of total
    dmg: 72101 - 62.90% of total
fryingpan:
    kills: 0 - 0.00% of total
    dmg: 65 - 0.06% of total
tf_projectile_pipe:
    kills: 2 - 0.01% of total
skullbat:
    kills: 0 - 0.00% of total
bottle:
    kills: 0 - 0.00% of total

rj:
total kills: 128; total dmg: 61465
tf_projectile_pipe_remote:
    kills: 81 - 63.28% of total
    dmg: 48622 - 79.11% of total
iron_bomber:
    kills: 35 - 27.34% of total
    dmg: 9929 - 16.15% of total
world:
    kills: 4 - 3.13% of total
    dmg: 0 - 0.00% of total
bottle:
    kills: 0 - 0.00% of total
loose_cannon:
    kills: 0 - 0.00% of total
loose_cannon_impact:
    kills: 1 - 0.01% of total

...
