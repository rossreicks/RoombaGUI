from SimpleWebSocketServer import SimpleWebSocketServer, WebSocket
import json
import threading
import time

import SimpleHTTPServer
import SocketServer

PORT = 5000

Handler = SimpleHTTPServer.SimpleHTTPRequestHandler

x = 0
y = 0
heading = 0

clients = []

class EchoCSV(WebSocket):

    def handleMessage(self):
        data = json.loads(self.data)
        # data is an array of Objects with params: x, y, and heading
        for line in data:
            # print(line['x'])
            # print(line['y'])
            # print(line['heading'])
            print(line)

        self.sendMessage('hello')

    def handleConnected(self):
        clients.append(self)
        print(self.address, 'connected')

    def handleClose(self):
        clients.remove(self)
        print(self.address, 'closed')


server = SimpleWebSocketServer('', 4000, EchoCSV)
httpd = SocketServer.TCPServer(("", PORT), Handler)

print "serving at port", PORT
t1 = threading.Thread(target = server.serveforever)
t2 = threading.Thread(target= httpd.serve_forever)
t1.daemon = True
t1.start()
t2.daemon = True
t2.start()
while 1:
    for client in clients:
        client.sendMessage(u"{{ \"x\": {}, \"y\": {}, \"heading\": {} }}".format(x, y, heading))
        time.sleep(1)
        x = x + 1
        y = y + 1

