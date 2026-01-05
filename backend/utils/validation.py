from jsonschema import validate, ValidationError


def validate_data(data, schema):
    """
    Kiểm tra tính hợp lệ của dữ liệu theo schema

    Args:
        data: Dữ liệu cần kiểm tra
        schema: Schema để validate

    Raises:
        ValidationError: Nếu dữ liệu không hợp lệ
    """
    try:
        validate(instance=data, schema=schema)
    except ValidationError as e:
        raise ValidationError(f"Dữ liệu không hợp lệ: {e.message}")

