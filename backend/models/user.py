
class User:
    def __init__(self, username: str, password: str, role: str):
        self.username = username
        #self.password_hash = hash_password(password)
        # không hash password
        self.password=password
        self.role=role

    def to_dict(self):
        return {
            'username': self.username,
            'password': self.password,
            'role': self.role
        }

create_user_schema={
    'type':'object',
    'properties' : {
        "username": {"type": "string"},
        "password": {"type": "string"},
        "role": {"type": "string"}
    },
    'required' : ['username', 'password', 'role']
}