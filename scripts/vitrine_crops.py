"""Crop each cake from the display-case film's own frames for the product cards.
Usage: python3 scripts/vitrine_crops.py frame_4s.png frame_6_8s.png out_dir"""
import sys
from PIL import Image
a, b, out = Image.open(sys.argv[1]), Image.open(sys.argv[2]), sys.argv[3]
BOXES = {
    "truffle": (a, (30, 0, 370, 182)), "redvelvet": (a, (380, 0, 720, 182)), "strawberry": (a, (760, 0, 1100, 182)),
    "biscoff": (a, (100, 350, 460, 620)), "tiramisu": (a, (470, 350, 830, 620)), "mango": (a, (840, 340, 1200, 610)),
    "cheesecake": (b, (250, 0, 590, 152)), "blackforest": (b, (670, 0, 1010, 152)),
    "pistachio": (b, (220, 345, 660, 675)), "caramel": (b, (670, 330, 1090, 645)),
}
for k, (im, box) in BOXES.items():
    im.crop(box).save(f"{out}/{k}.webp", quality=86)
