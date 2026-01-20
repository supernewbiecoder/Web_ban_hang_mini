from backend.constants.user_filter import User_filter
def get_filter_request(request):
    username = request.args.get("username")
    email = request.args.get("email")
    status = request.args.get("status")
    role = request.args.get("role")
    # Xử lý start/end an toàn
    try:
        start = int(request.args.get("start"))
    except (TypeError, ValueError):
        start = -1
    
    try:
        num = int(request.args.get("num"))
    except (TypeError, ValueError):
        num = -1
    
    filter_obj = User_filter(
        username=username,
        email=email,
        status=status,
        role=role,
        status=status,
        start=start,
        num=num
    )
    return filter_obj