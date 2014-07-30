from checkio.signals import ON_CONNECT
from checkio import api
from checkio.referees.io import CheckiOReferee
from checkio.referees import cover_codes
from checkio.referees import checkers

from tests import TESTS

cover = """def cover(func, data):
    res = func(tuple(data))
    if not isinstance(res, str):
        raise TypeError("must be string.")
    return res
"""


def checker(answer, user_result):
    if not all(ch in "1234" for ch in user_result):
        return False, (1, "Wrong symbols.")
    if len(user_result) > len(answer[0]):
        return False, (5, "It should be shorter.")
    if user_result not in answer:
        return False, (5, "Wrong answer.")
    return True, (10, "Great!")


api.add_listener(
    ON_CONNECT,
    CheckiOReferee(
        tests=TESTS,
        cover_code={
            'python-27': cover,  # or None
            'python-3': cover
        },
        function_name="puzzle88",
        checker=checker
        # add_allowed_modules=[],
        # add_close_builtins=[],
        # remove_allowed_modules=[]
    ).on_ready)
