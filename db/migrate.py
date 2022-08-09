import json
import os

levels = os.listdir("./levels")
print(levels)
for l in levels:
    if not os.path.exists("./levels/" + l + "/info.json") or os.path.exists("./levels/" + l + "/data.sus"):
        continue
    with open(f"./levels/{l}/info.json", "r", encoding="utf-8") as f:
        level = json.loads(f.read())
    level["engine"] = "wbp-pjsekai"
    with open(f"./levels/{l}/info.json", "w", encoding="utf-8") as f:
        f.write(json.dumps(level, indent=4))
    print(f"{l} done")
