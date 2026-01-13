import datetime
from typing import Optional, Dict
from backend.constants import enum
import jwt
from config import Config


def generate_jwt(username, role=enum.User_Role.USER) -> str:
    expiration_time = datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(seconds=Config.EXPIRATION_JWT)
    token = jwt.encode(
        {
            "username": username,
            "role": role,
            "exp": expiration_time
        }, 
        Config.SECRET_KEY
    )

    return token