from typing import Dict, List
from flask import Flask, send_from_directory, send_file, make_response, request, Response
import requests
import json

app = Flask(__name__)
ENDPOINT = "https://servers-legacy.purplepalette.net/"
VERSION = "0.6.2"
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
        "sonolus-version"
    ]
    headers = [
        (name, value)
        for (name, value) in resp.raw.headers.items()
        if name.lower() not in excluded_headers
    ]
    headers.append(("Sonolus-Version", VERSION))
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
        for i in range(len(ret_data[e])):
            ret_data[e][i]["name"] = add_prefix(ret_data[e][i]["name"])
        if "levels" in e:
            for i in range(len(ret_data["levels"])):
                for k in ["background", "particle", "skin", "effect"]:
                    ret_data["levels"][i]["engine"][k]["name"] = add_prefix(
                        ret_data["levels"][i]["engine"][k]["name"]
                    )
                ret_data["levels"][i]["engine"]["version"] = 6
                ret_data["levels"][i]["engine"]["effect"]["version"] = 3
                ret_data["levels"][i]["engine"]["effect"]["data"] = {
                    "type": "EffectData",
                    "hash": "4A544E7B2739F1E1783C26E0AF618DDFF29276E2",
                    "url": "https://cdn-etc.purplepalette.net/PatchEffectData"
                }
                ret_data["levels"][i]["engine"]["effect"]["audio"] = {
                    "type": "EffectAudio",
                    "hash": "78B49410C517C02B30FBDF7CF821C886F7A7B5B2",
                    "url": "https://cdn-etc.purplepalette.net/PatchEffectAudio"
                }
        elif "engines" in e:
            for i in range(len(ret_data["engines"])):
                ret_data["engines"][i]["version"] = 6
                for k in ["background", "particle", "skin", "effect"]:
                    ret_data["engines"][i][k]["name"] = add_prefix(
                        ret_data["engines"][i][k]["name"]
                    )
        elif "effect" in e:
            for i in range(len(ret_data["effects"])):
                ret_data["effects"][i]["version"] = 3
        ret_data[e] = {
            "items": ret_data[e],
            "search": {"options": KEYWORD_OPTIONS}
        }
    ret_data["title"] = "Sweet Potato"
    ret_data["banner"] = {
        "type": "ServerBanner",
        "url": "https://cdn-etc.purplepalette.net/sp-banner.png"
    }
    # 書き換えた応答データを作成
    ret = make_response(json.dumps(ret_data), resp.status_code)
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
            ret_data["items"][i]["engine"]["version"] = 6
            ret_data["items"][i]["engine"]["effect"]["version"] = 3
            ret_data["items"][i]["engine"]["effect"]["data"] = {
                "type": "EffectData",
                "hash": "4A544E7B2739F1E1783C26E0AF618DDFF29276E2",
                "url": "https://cdn-etc.purplepalette.net/PatchEffectData"
            }
            ret_data["items"][i]["engine"]["effect"]["audio"] = {
                "type": "EffectAudio",
                "hash": "78B49410C517C02B30FBDF7CF821C886F7A7B5B2",
                "url": "https://cdn-etc.purplepalette.net/PatchEffectAudio"
            }
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
            if key not in ["Host", "Accept-Encoding", "Accept-Language", "Accept"]
        },
        params=args,
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
            ret["item"]["engine"]["version"] = 6
            ret["item"]["engine"]["effect"]["version"] = 3
            ret["item"]["engine"]["effect"]["data"] = {
                "type": "EffectData",
                "hash": "4A544E7B2739F1E1783C26E0AF618DDFF29276E2",
                "url": "https://cdn-etc.purplepalette.net/PatchEffectData"
            }
            ret["item"]["engine"]["effect"]["audio"] = {
                "type": "EffectAudio",
                "hash": "78B49410C517C02B30FBDF7CF821C886F7A7B5B2",
                "url": "https://cdn-etc.purplepalette.net/PatchEffectAudio"
            }
            for k in ["background", "particle", "skin", "effect"]:
                ret["item"]["engine"][k]["name"] = add_prefix(
                    ret["item"]["engine"][k]["name"]
                )
                for d in ["thumbnail", "data", "configuration", "texture", "image", "audio"]:
                    if d in ret["item"]["engine"][k].keys():
                        old = ret["item"]["engine"][k][d]["url"]
                        if "https://" in old:
                            continue
                        ret["item"]["engine"][k][d]["url"] = f"https://servers.purplepalette.net{old}"
        elif "engine" in path:
            for k in ["background", "particle", "skin", "effect"]:
                ret["item"][k]["name"] = add_prefix(ret["item"][k]["name"])
            ret["item"]["version"] = 6
        elif "effect" in path:
            ret["item"]["version"] = 3
            ret["item"]["data"] = {
                "type": "EffectData",
                "hash": "4A544E7B2739F1E1783C26E0AF618DDFF29276E2",
                "url": "https://cdn-etc.purplepalette.net/PatchEffectData"
            }
            ret["item"]["audio"] = {
                "type": "EffectAudio",
                "hash": "78B49410C517C02B30FBDF7CF821C886F7A7B5B2",
                "url": "https://cdn-etc.purplepalette.net/PatchEffectAudio"
            }
    response = Response(
        json.dumps(ret),
        resp.status_code,
        filter_response_headers(resp)
    )
    return response


@app.route("/tests/<testId>/repository/<path:path>")
def repository_proxy2(testId: str, path: str) -> Response:
    resp = requests.request(
        method=request.method,
        url=ENDPOINT + "repository/" + path,
        headers={
            key: value for (key, value) in request.headers
            if key != "Host"
        },
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False,
    )
    response = Response(
        resp.content,
        resp.status_code,
        filter_response_headers(resp)
    )
    return response


@app.route("/repository/<path:path>")
def repository_proxy(path: str) -> Response:
    resp = requests.request(
        method=request.method,
        url=ENDPOINT + "repository/" + path,
        headers={
            key: value for (key, value) in request.headers
            if key != "Host"
        },
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False,
    )
    response = Response(
        resp.content,
        resp.status_code,
        filter_response_headers(resp)
    )
    return response


@app.route("/sonolus/<path:path>")
def proxy(path: str) -> Response:
    """全パスへのリクエストを受け取り プロキシサーバーとして動作する"""
    args = request.args
    if path.endswith("info"):
        return handle_info_endpoint(path, args)
    if path.endswith("list"):
        return handle_list_endpoint(path, args)
    # 汎用リクエスト
    return handle_general_endpoint(path, args)


@app.route("/tests/<testId>/sonolus/<path:path>")
def proxy2(testId: str, path: str) -> Response:
    """全パスへのリクエストを受け取り プロキシサーバーとして動作する"""
    args = request.args
    if path.endswith("info"):
        return handle_info_endpoint(f"tests/{testId}/{path}", args)
    if path.endswith("list"):
        return handle_list_endpoint(f"tests/{testId}/{path}", args)
    # 汎用リクエスト
    return handle_general_endpoint(f"tests/{testId}/{path}", args)


@app.route('/')
def send_index():
    try:
        return send_file('static/index.html')
    except:
        return "200 Server is working"


@app.route('/<path:path>')
def send_report(path):
    return send_from_directory('static', path)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
