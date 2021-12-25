import time
import tornado

k = 0
while True:
    print(str(k), flush=True)
    time.sleep(1)
    k += 1
    if(k == 4):
        break;
