import os
import shutil

base_path = r"c:\Users\abdel\Desktop\website\ecomate\app\[locale]"
src = os.path.join(base_path, "admin")
dst_parent = os.path.join(base_path, "(admin)")
dst = os.path.join(dst_parent, "admin")

if not os.path.exists(dst_parent):
    os.makedirs(dst_parent)

if os.path.exists(src):
    shutil.move(src, dst)
    print(f"Moved {src} to {dst}")
else:
    print(f"Source {src} does not exist")
