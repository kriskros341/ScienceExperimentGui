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
        self.process = None


    def check_origin(self, origin):
        return False

    
    async def get(self, *args, **kwargs):
        # Why reinvent the wheel. literally.
        if('check' in self.request.query.split('&')):
            if(self.isRunning):
                self.write("In use")
            else: 
                self.write("Ok")
        else:
            await super().get(*args, **kwargs)


    def open(self):
        print("opened")


    def on_message(self, message):
        message = message.split('&');
        if message[0]:
            if(self.process):
                self.write_message("Already running!")
                print("OUTGOING: Already running!")
            else:
                self.write_message("Ok to start.")
                print("OUTGOING: Ok to start.")
        if message[1]:
            if(not self.process):
                IOLoop.current().asyncio_loop.create_task(
                        self.stream_output(message[1:])
                        )
                self.write_message("Ok.")
                print("OUTGOING: Ok.")
        else:
            self.write_message("Already running!")
            print("OUTGOING: Already running!")
            self.close()


    def on_close(self):
        print("closed")


    async def stream_output(self, message):
        # 5 godzin stracone bo zapomniałem o sys.stdout.flush()
        """
            Python's standard out is buffered (meaning that it collects some of the data 
            "written" to standard out before it writes it to the terminal). Calling sys. 
            stdout. flush() forces it to "flush" the buffer, meaning that it will write everything 
            in the buffer to the terminal, even if normally it would wait before doing so.
            Apr 5, 2012
        """
        print('starting')
        self.isRunning = True
        self.process = tornado.process.Subprocess(
            #["python3", "-u", "controls.py", "m", "45"]
            ["python3", "-u", message[0], message[1], message[2]], 
            stdout=PIPE, 
            stderr=PIPE,
        )
        for line in iter(self.process.stdout.readline, ""):
            if(line == b''):
                break;
            self.write_message(line[0:-1])
        self.write_message('End.')
        self.process = None
        self.isRunning = False


app = tornado.web.Application([
        (r"/", MyWebsocket)
    ])


if __name__ == "__main__":
    app.listen(8000)
    IOLoop.current().start()
