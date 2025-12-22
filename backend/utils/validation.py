from jsonschema import validate, ValidationError


def validate_json(data, schema):
    try:
        validate(instance=data, schema=schema)
        return True, None
    except ValidationError as e:
        return False, e.message
