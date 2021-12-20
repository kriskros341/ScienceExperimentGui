import tornado.websocket
from subprocess import Popen, CalledProcessError, PIPE
import tornado.web
from tornado.ioloop import IOLoop
import sqlalchemy as sa

meta = sa.MetaData()


DataTbl = sa.Table('Data', meta,
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('temperatura', sa.Integer),
        sa.Column('predkosc', sa.Integer),
        sa.Column('czas', sa.Date),
        sa.Column('stan', sa.Integer)
        )
#aiomysql.sa 


class MyWebsocket(tornado.websocket.WebSocketHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.isRunning = False

    def check_origin(self, origin):
        return True


    def open(self):
        print("opened")


    def on_message(self, message):
        print("essage")
        if message == 'check' or message == 'start':
            if(self.isRunning):
                self.write("Already running!")
            else:
                self.write("Ok.")
        if not self.isRunning and message == 'start':
            IOLoop.current().asyncio_loop.create_task(self.stream_output())
        else:
            self.write("Already running!")
            self.close()
        print("essage")


    def on_close(self):
        print("closed")


    async def stream_output(self):
        # 5 godzin stracone bo zapomniałem o sys.stdout.flush()
        """
            Python's standard out is buffered (meaning that it collects some of the data 
            "written" to standard out before it writes it to the terminal). Calling sys. 
            stdout. flush() forces it to "flush" the buffer, meaning that it will write everything 
            in the buffer to the terminal, even if normally it would wait before doing so.
            Apr 5, 2012
        """
        self.isRunning = True
        sub_process = tornado.process.Subprocess(
            ["python3", "test.py"], 
            stdout=PIPE, 
            stderr=PIPE
        )
        for line in iter(sub_process.stdout.readline, ""):
            if(line == b''):
                break;
            self.write_message(line)
            self.close()
        self.isRunning = False


app = tornado.web.Application([
        (r"/", MyWebsocket)
    ])


if __name__ == "__main__":
    print()
    app.listen(8080)
    IOLoop.current().start()
