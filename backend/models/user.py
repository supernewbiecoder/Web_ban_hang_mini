from backend.constants import enum


class User:
    def __init__(self, username: str, password: str, role: str, status: str):
        self.username = username
        # Hash password before storing
        self.password = password
        self.role = role
        self.status = status if status else enum.User_Status.ACTIVE

    def to_dict(self):
        return {
            'username': self.username,
            'password': self.password,
            'role': self.role,
            'status': self.status
        }

create_user_schema={
    'type':'object',
    'properties' : {
        "username": {"type": "string"},
        "password": {"type": "string"},
        "role": {"type": "string", "enum": [enum.User_Role.ADMIN, enum.User_Role.USER, enum.User_Role.GUEST]},
        "status": {"type": "string", "enum": [enum.User_Status.ACTIVE, enum.User_Status.INACTIVE]}
    },
    'required' : ['username', 'password'],
    "additionalProperties": False
}

login_user_schema={
    'type':'object',
    'properties' : {
        "username": {"type": "string"},
        "password": {"type": "string"}
    },
    'required' : ['username', 'password'],
    "additionalProperties": False
}