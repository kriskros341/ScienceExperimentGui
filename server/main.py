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
    isRunning = False
    def check_origin(self, origin):
        return True


    def open(self):
        IOLoop.current().asyncio_loop.create_task(self.stream_output())
        print("opened")


    def on_message(self, message):
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
        if not isRunning:
            isRunning = True
            sub_process = tornado.process.Subprocess(
                ["python3", "test.py"], 
                stdout=PIPE, 
                stderr=PIPE
            )
            for line in iter(sub_process.stdout.readline, ""):
                if(line == b''):
                    break;
                self.write_message(line)
            isRunning = False
        else:
            self.write("Already running!")
            self.close()


app = tornado.web.Application([
        (r"/", MyWebsocket)
    ])


if __name__ == "__main__":
    print()
    app.listen(8080)
    IOLoop.current().start()
