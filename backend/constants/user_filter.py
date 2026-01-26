from typing import Dict


class User_filter:
    def __init__(
            self,
            username: str = None,
            email: str = None,
            status: str = None,
            start: int = None, num: int = None,
    ):
        self.username = username
        self.email = email
        self.status = status
        if start == -1: start = None
        if num == -1: num = None
        self.start = start
        self.num = num
    def to_dict(self) -> Dict:
        return{
            "username": self.username,
            "email": self.email,
            "status": self.status,
            "start": self.start,
            "num": self.num,
        }