import json
import threading
import unittest
from urllib.request import urlopen
from http.server import HTTPServer

from app.main import Handler


class BaselineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(("127.0.0.1", 0), Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.thread.join()

    def test_health(self):
        with urlopen(f"{self.base}/health") as response:
            self.assertEqual(response.status, 200)
            self.assertEqual(json.load(response), {"status": "ok"})

    def test_reservoir_list(self):
        with urlopen(f"{self.base}/reservoirs") as response:
            self.assertEqual(json.load(response), {"reservoirs": [{"id": "R-101", "level_percent": 72}]})


if __name__ == "__main__":
    unittest.main()
