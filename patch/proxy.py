from flask import Flask, make_response, request, Response
import requests

app = Flask(__name__)
ENDPOINT = "https://servers-legacy.purplepalette.net"
VERSION = "0.5.10"
KEYWORD_OPTIONS = [
    {
        "query": "keywords",
        "name": "#KEYWORDS",
        "type": "text",
        "placeholder": "#KEYWORDS",
    }
]


def filterResponseHeaders(resp):
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
    headers.append(("Access-Control-Allow-Origin", "https://potato.purplepalette.net"))
    headers.append(
        ("Access-Control-Allow-Methods", "POST, GET, HEAD, OPTIONS, PUT, PATCH, DELETE")
    )
    headers.append(
        ("Access-Control-Allow-Headers", "Origin, Authorization, Accept, Content-Type")
    )
    headers.append(
        ("Access-Control-Max-Age", "864000")
    )
    return headers


@app.route("/<path:path>")
def proxy(path):
    args = request.args
    if path.endswith("info") or path.endswith("/list"):
        resp = requests.get(ENDPOINT + path, params=args)
        edited = resp.json()
        if path.endswith("info"):
            for e in edited.keys():
                edited[e] = {"items": edited[e], "search": {"options": KEYWORD_OPTIONS}}
        else:
            edited["search"] = {}
            edited["search"]["options"] = KEYWORD_OPTIONS
        sniffed = make_response(edited, resp.status_code)
        sniffed.headers = filterResponseHeaders(resp)
        return sniffed
    resp = requests.request(
        method=request.method,
        url=ENDPOINT + path,
        headers={key: value for (key, value) in request.headers if key != "Host"},
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False,
    )
    response = Response(resp.content, resp.status_code, filterResponseHeaders(resp))
    return response


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
