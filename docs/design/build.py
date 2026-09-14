import pathlib
d = pathlib.Path(__file__).parent
helmet = (d / "_helmet.txt").read_text()
tpl = """<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
{helmet}{body}</x-dc>
</body>
</html>
"""
n = 0
for src in sorted((d / "bodies").glob("*.html")):
    out = d / (src.stem + ".dc.html")
    out.write_text(tpl.format(helmet=helmet, body=src.read_text()))
    n += 1
print(f"built {n} artboards")
