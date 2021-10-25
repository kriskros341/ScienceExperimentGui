from time import sleep
import sys
x = 0
while True:
    sleep(1)
    x+=1
    sys.stdout.write(str(x))
    sys.stdout.flush()
