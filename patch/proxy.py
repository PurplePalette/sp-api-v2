from typing import Dict, List
from flask import Flask, make_response, request, Response
import requests

app = Flask(__name__)
ENDPOINT = "https://servers-legacy.purplepalette.net/"
VERSION = "0.6.0"
SERVER_PREFIX = "sweet-potato-"
KEYWORD_OPTIONS = [
    {
        "query": "keywords",
        "name": "#KEYWORDS",
        "type": "text",
        "placeholder": "#KEYWORDS",
    }
]


def add_prefix(path: str) -> str:
    """パスにプレフィックスを追加する"""
    return SERVER_PREFIX + path


def remove_prefix(path: str) -> str:
    """パスからプレフィックスを除去する"""
    return path.replace(SERVER_PREFIX, '') if SERVER_PREFIX in path else path


def filter_response_headers(resp: requests.Response) -> List[tuple]:
    """配信元サーバーから受け取ったレスポンスから不要なヘッダーを取り除く"""
    excluded_headers = [
        "content-encoding",
        "content-length",
        "transfer-encoding",
        "connection",
    ]
    headers = [
        (name, value)
        for (name, value) in resp.raw.headers.items()
        if name.lower() not in excluded_headers
    ]
    return headers


def handle_info_endpoint(path: str, args: Dict[str, str]) -> Response:
    """/info エンドポイントの処理"""
    # 本来の応答データを取得
    resp = requests.get(ENDPOINT + path, params=args)
    if resp.status_code != 200:
        ret = make_response({}, resp.status_code)
        return ret
    # 応答データを書き換え
    ret_data = resp.json()
    for e in ret_data.keys():
        ret_data[e] = {
            "items": ret_data[e],
            "search": {"options": KEYWORD_OPTIONS}
        }
    # 書き換えた応答データを作成
    ret = make_response(ret_data, resp.status_code)
    ret.headers = filter_response_headers(resp)
    return ret


def handle_list_endpoint(path: str, args: Dict[str, str]) -> Response:
    """/list エンドポイントの処理"""
    # 本来の応答データを取得
    resp = requests.get(ENDPOINT + path, params=args)
    if resp.status_code != 200:
        ret = make_response({}, resp.status_code)
        return ret
    # 応答データを書き換え
    ret_data = resp.json()
    for i in range(len(ret_data["items"])):
        ret_data["items"][i]["name"] = add_prefix(ret_data["items"][i]["name"])
        if "level" in path:
            for k in ["background", "particle", "skin", "effect"]:
                ret_data["items"][i]["engine"][k]["name"] = add_prefix(
                    ret_data["items"][i]["engine"][k]["name"]
                )
        elif "engine" in path:
            ret_data["items"][i]["version"] = 6
            for k in ["background", "particle", "skin", "effect"]:
                ret_data["items"][i][k]["name"] = add_prefix(
                    ret_data["items"][i][k]["name"]
                )
        elif "effect" in path:
            ret_data["items"][i]["version"] = 3
    ret_data["search"] = {"options": KEYWORD_OPTIONS}
    # 書き換えた応答データを作成
    ret = make_response(ret_data, resp.status_code)
    ret.headers = filter_response_headers(resp)
    return ret


def handle_general_endpoint(path: str, args: Dict[str, str]) -> Response:
    """汎用エンドポイント処理"""
    path = remove_prefix(path)
    resp = requests.request(
        method=request.method,
        url=ENDPOINT + path,
        headers={
            key: value for (key, value) in request.headers
            if key != "Host"
        },
        params=args,
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False,
    )
    if resp.status_code != 200:
        ret = make_response({}, resp.status_code)
        return ret
    ret = resp.json()
    if "item" in ret:
        ret["item"]["name"] = add_prefix(ret["item"]["name"])
        if "level" in path:
            for k in ["background", "particle", "skin", "effect"]:
                ret["item"]["engine"][k]["name"] = add_prefix(
                    ret["item"]["engine"][k]["name"]
                )
        elif "engine" in path:
            for k in ["background", "particle", "skin", "effect"]:
                ret["item"][k]["name"] = add_prefix(ret["item"][k]["name"])
            ret["item"]["version"] = 6
        elif "effect" in path:
            ret["item"]["version"] = 3
    response = Response(
        str(ret),
        resp.status_code,
        filter_response_headers(resp)
    )
    return response


@app.route("/sonolus/<path:path>")
def proxy(path: str) -> Response:
    """全パスへのリクエストを受け取り プロキシサーバーとして動作する"""
    args = request.args
    if path.endswith("/info"):
        return handle_info_endpoint(path, args)
    if path.endswith("/list"):
        return handle_list_endpoint(path, args)
    # 汎用リクエスト
    return handle_general_endpoint(path, args)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
