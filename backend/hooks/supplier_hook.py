from backend.constants.supplier_filter import Supplier_filter


def get_filter_request(request):
    code = request.args.get("supplier_code")
    name = request.args.get("supplier_name")
    address = request.args.get("address")
    phone = request.args.get("phone")
    email = request.args.get("email")
    status = request.args.get("status")

    try:
        start = int(request.args.get("start"))
    except (TypeError, ValueError):
        start = -1

    try:
        num = int(request.args.get("num"))
    except (TypeError, ValueError):
        num = -1

    filter_obj = Supplier_filter(
        code=code,
        name=name,
        address=address,
        phone=phone,
        email=email,
        status=status,
        start=start,
        num=num,
    )
    return filter_obj