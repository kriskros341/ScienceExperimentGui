import time
import sys

k = 0
while True:
    sys.stdout.write(k)
    sys.stdout.flush()
    time.sleep(1)
    k += 1
